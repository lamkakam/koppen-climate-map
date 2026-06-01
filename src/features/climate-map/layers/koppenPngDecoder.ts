import { unzlibSync } from 'fflate';

const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10] as const;
const bytesPerPixel = 2;

export type DecodedKoppenPng = {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8ClampedArray;
};

type PngHeader = {
  readonly width: number;
  readonly height: number;
  readonly bitDepth: number;
  readonly colorType: number;
  readonly compression: number;
  readonly filter: number;
  readonly interlace: number;
};

function readAscii(bytes: Uint8Array, offset: number, length: number) {
  return String.fromCharCode(...bytes.subarray(offset, offset + length));
}

function assertSupportedHeader(header: PngHeader) {
  if (
    header.bitDepth !== 8
    || header.colorType !== 4
    || header.compression !== 0
    || header.filter !== 0
    || header.interlace !== 0
  ) {
    throw new Error(
      `Unsupported Koppen PNG format: expected 8-bit non-interlaced Gray+Alpha, got bit depth ${header.bitDepth}, color type ${header.colorType}, compression ${header.compression}, filter ${header.filter}, interlace ${header.interlace}`,
    );
  }
}

function paethPredictor(left: number, up: number, upperLeft: number) {
  const estimate = left + up - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upperLeftDistance = Math.abs(estimate - upperLeft);

  if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) {
    return left;
  }

  return upDistance <= upperLeftDistance ? up : upperLeft;
}

function reverseFilter(
  filterType: number,
  scanline: Uint8Array,
  previousScanline: Uint8Array,
) {
  const output = new Uint8Array(scanline.length);

  for (let index = 0; index < scanline.length; index += 1) {
    const left = index >= bytesPerPixel ? output[index - bytesPerPixel] : 0;
    const up = previousScanline[index] ?? 0;
    const upperLeft = index >= bytesPerPixel ? previousScanline[index - bytesPerPixel] ?? 0 : 0;

    switch (filterType) {
      case 0:
        output[index] = scanline[index];
        break;
      case 1:
        output[index] = (scanline[index] + left) % 256;
        break;
      case 2:
        output[index] = (scanline[index] + up) % 256;
        break;
      case 3:
        output[index] = (scanline[index] + Math.floor((left + up) / 2)) % 256;
        break;
      case 4:
        output[index] = (scanline[index] + paethPredictor(left, up, upperLeft)) % 256;
        break;
      default:
        throw new Error(`Unsupported Koppen PNG scanline filter: ${filterType}`);
    }
  }

  return output;
}

function concatBytes(chunks: readonly Uint8Array[]) {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;

  chunks.forEach((chunk) => {
    output.set(chunk, offset);
    offset += chunk.length;
  });

  return output;
}

export function decodeKoppenPng(arrayBuffer: ArrayBuffer): DecodedKoppenPng {
  const bytes = new Uint8Array(arrayBuffer);

  if (
    bytes.length < pngSignature.length
    || pngSignature.some((byte, index) => bytes[index] !== byte)
  ) {
    throw new Error('Unsupported Koppen PNG format: missing PNG signature');
  }

  const view = new DataView(arrayBuffer);
  const idatChunks: Uint8Array[] = [];
  let header: PngHeader | undefined;
  let offset = pngSignature.length;
  let hasIend = false;

  while (offset + 12 <= bytes.length) {
    const chunkLength = view.getUint32(offset);
    const chunkType = readAscii(bytes, offset + 4, 4);
    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + chunkLength;

    if (chunkEnd + 4 > bytes.length) {
      throw new Error('Unsupported Koppen PNG format: truncated chunk data');
    }

    const chunkData = bytes.subarray(chunkStart, chunkEnd);

    if (chunkType === 'IHDR') {
      if (chunkLength !== 13) {
        throw new Error('Unsupported Koppen PNG format: invalid IHDR chunk');
      }

      header = {
        width: view.getUint32(chunkStart),
        height: view.getUint32(chunkStart + 4),
        bitDepth: bytes[chunkStart + 8],
        colorType: bytes[chunkStart + 9],
        compression: bytes[chunkStart + 10],
        filter: bytes[chunkStart + 11],
        interlace: bytes[chunkStart + 12],
      };
      assertSupportedHeader(header);
    } else if (chunkType === 'IDAT') {
      idatChunks.push(chunkData);
    } else if (chunkType === 'IEND') {
      hasIend = true;
      break;
    }

    offset = chunkEnd + 4;
  }

  if (header === undefined || idatChunks.length === 0 || !hasIend) {
    throw new Error('Unsupported Koppen PNG format: missing IHDR, IDAT, or IEND chunk');
  }

  const rowLength = header.width * bytesPerPixel;
  const inflated = unzlibSync(concatBytes(idatChunks));
  const expectedInflatedLength = header.height * (rowLength + 1);

  if (inflated.length !== expectedInflatedLength) {
    throw new Error(
      `Unsupported Koppen PNG format: expected ${expectedInflatedLength} decoded bytes, got ${inflated.length}`,
    );
  }

  const data = new Uint8ClampedArray(header.width * header.height * 4);
  let previousScanline = new Uint8Array(rowLength);

  for (let y = 0; y < header.height; y += 1) {
    const rowOffset = y * (rowLength + 1);
    const filterType = inflated[rowOffset];
    const scanline = reverseFilter(
      filterType,
      inflated.subarray(rowOffset + 1, rowOffset + 1 + rowLength),
      previousScanline,
    );

    for (let x = 0; x < header.width; x += 1) {
      const sourceOffset = x * bytesPerPixel;
      const destinationOffset = (y * header.width + x) * 4;
      const gray = scanline[sourceOffset];
      const alpha = scanline[sourceOffset + 1];

      data[destinationOffset] = gray;
      data[destinationOffset + 1] = gray;
      data[destinationOffset + 2] = gray;
      data[destinationOffset + 3] = alpha;
    }

    previousScanline = scanline;
  }

  return {
    width: header.width,
    height: header.height,
    data,
  };
}
