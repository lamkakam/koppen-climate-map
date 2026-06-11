import { fromUrl } from 'geotiff';
import type { GeoTIFF, ReadRasterResult } from 'geotiff';

type RgbaBands = readonly [
  Uint8Array | Uint8ClampedArray,
  Uint8Array | Uint8ClampedArray,
  Uint8Array | Uint8ClampedArray,
  Uint8Array | Uint8ClampedArray,
];

type GeoBoundingBox = {
  readonly west: number;
  readonly south: number;
  readonly east: number;
  readonly north: number;
};

const koppenTiffs = new Map<string, Promise<GeoTIFF>>();
const koppenExtent = {
  west: -180,
  south: -90,
  east: 180,
  north: 90,
} as const;

function isRgbaBands(rasters: ReadRasterResult): rasters is ReadRasterResult & RgbaBands {
  return Array.isArray(rasters) && rasters.length >= 4;
}

function openKoppenCog(url: string) {
  const cachedTiff = koppenTiffs.get(url);

  if (cachedTiff !== undefined) {
    return cachedTiff;
  }

  const tiff = fromUrl(url);
  koppenTiffs.set(url, tiff);

  return tiff;
}

function isMissingTileBlockError(error: unknown) {
  return error instanceof TypeError && error.message.includes("reading 'buffer'");
}

async function readKoppenRasters(
  tiff: GeoTIFF,
  readBounds: readonly [number, number, number, number],
  signal?: AbortSignal,
) {
  return tiff.readRasters({
    bbox: [...readBounds],
    width: 256,
    height: 256,
    samples: [0, 1, 2, 3],
    interleave: false,
    resampleMethod: 'nearest',
    signal,
  });
}

export function createKoppenImageDataFromRgba(rgbaBands: RgbaBands, width: number, height: number) {
  const [red, , , alpha] = rgbaBands;
  const data = new Uint8ClampedArray(width * height * 4);

  for (let sourceIndex = 0, targetIndex = 0; sourceIndex < red.length; sourceIndex += 1) {
    const classId = red[sourceIndex] ?? 0;

    data[targetIndex] = classId;
    data[targetIndex + 1] = classId;
    data[targetIndex + 2] = classId;
    data[targetIndex + 3] = alpha[sourceIndex] ?? 0;
    targetIndex += 4;
  }

  return new ImageData(data, width, height);
}

export function createTransparentKoppenImageData(width: number, height: number) {
  return new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
}

export function getKoppenCogReadBounds(bbox: GeoBoundingBox) {
  const west = Math.max(bbox.west, koppenExtent.west);
  const south = Math.max(bbox.south, koppenExtent.south);
  const east = Math.min(bbox.east, koppenExtent.east);
  const north = Math.min(bbox.north, koppenExtent.north);

  if (west >= east || south >= north) {
    return undefined;
  }

  return [west, south, east, north] as const;
}

export async function readKoppenCogTile(
  url: string,
  bbox: GeoBoundingBox,
  signal?: AbortSignal,
) {
  const readBounds = getKoppenCogReadBounds(bbox);

  if (readBounds === undefined) {
    return createTransparentKoppenImageData(256, 256);
  }

  const tiff = await openKoppenCog(url);
  let rasters: ReadRasterResult;

  try {
    rasters = await readKoppenRasters(tiff, readBounds, signal);
  } catch (error) {
    if (signal?.aborted !== true && isMissingTileBlockError(error)) {
      rasters = await readKoppenRasters(tiff, readBounds, signal);
    } else {
      throw error;
    }
  }

  if (!isRgbaBands(rasters)) {
    throw new Error('Koppen COG must provide RGBA raster bands');
  }

  return createKoppenImageDataFromRgba(rasters, rasters.width, rasters.height);
}
