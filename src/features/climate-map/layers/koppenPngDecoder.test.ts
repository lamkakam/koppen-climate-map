import { zlibSync } from 'fflate';

import { decodeKoppenPng } from './koppenPngDecoder';

const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];

type PngOptions = {
  readonly width: number;
  readonly height: number;
  readonly bitDepth?: number;
  readonly colorType?: number;
  readonly interlace?: number;
  readonly filteredRows: readonly Uint8Array[];
};

function writeUint32(value: number) {
  const bytes = new Uint8Array(4);

  new DataView(bytes.buffer).setUint32(0, value);

  return bytes;
}

function createChunk(type: string, data: Uint8Array) {
  const typeBytes = new TextEncoder().encode(type);

  return [
    ...Array.from(writeUint32(data.length)),
    ...typeBytes,
    ...data,
    0,
    0,
    0,
    0,
  ];
}

function createPng({
  width,
  height,
  bitDepth = 8,
  colorType = 4,
  interlace = 0,
  filteredRows,
}: PngOptions) {
  const ihdr = new Uint8Array([
    ...Array.from(writeUint32(width)),
    ...Array.from(writeUint32(height)),
    bitDepth,
    colorType,
    0,
    0,
    interlace,
  ]);
  const idat = zlibSync(new Uint8Array(filteredRows.flatMap((row) => [...row])));

  return new Uint8Array([
    ...pngSignature,
    ...createChunk('IHDR', ihdr),
    ...createChunk('IDAT', idat),
    ...createChunk('IEND', new Uint8Array()),
  ]).buffer;
}

describe('decodeKoppenPng', () => {
  it('decodes 8-bit Gray+Alpha PNGs while preserving exact class IDs', () => {
    const png = createPng({
      width: 2,
      height: 1,
      filteredRows: [
        new Uint8Array([0, 1, 255, 30, 128]),
      ],
    });

    expect(decodeKoppenPng(png)).toEqual({
      width: 2,
      height: 1,
      data: new Uint8ClampedArray([
        1, 1, 1, 255,
        30, 30, 30, 128,
      ]),
    });
  });

  it('reverses non-zero PNG scanline filters', () => {
    const png = createPng({
      width: 3,
      height: 1,
      filteredRows: [
        new Uint8Array([1, 10, 255, 2, 255, 3, 255]),
      ],
    });

    expect(decodeKoppenPng(png).data).toEqual(new Uint8ClampedArray([
      10, 10, 10, 255,
      12, 12, 12, 254,
      15, 15, 15, 253,
    ]));
  });

  it.each([
    ['16-bit Gray+Alpha', { bitDepth: 16 }],
    ['RGBA color', { colorType: 6 }],
    ['interlaced Gray+Alpha', { interlace: 1 }],
  ])('rejects unsupported %s PNGs', (_name, overrides) => {
    const png = createPng({
      width: 1,
      height: 1,
      filteredRows: [
        new Uint8Array([0, 1, 255]),
      ],
      ...overrides,
    });

    expect(() => decodeKoppenPng(png)).toThrow(/Unsupported Koppen PNG format/);
  });
});
