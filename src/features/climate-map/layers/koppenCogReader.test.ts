import { fromUrl } from 'geotiff';
import type { GeoTIFF } from 'geotiff';

import {
  createKoppenImageDataFromRgba,
  createTransparentKoppenImageData,
  getKoppenCogReadBounds,
  readKoppenCogTile,
} from './koppenCogReader';

vi.mock('geotiff', () => ({
  fromUrl: vi.fn(),
}));

class TestImageData {
  readonly colorSpace = 'srgb';

  constructor(
    readonly data: Uint8ClampedArray,
    readonly width: number,
    readonly height: number,
  ) {}
}

const fromUrlMock = vi.mocked(fromUrl);

function createGeoTiffTestDouble(readRasters: GeoTIFF['readRasters']) {
  return { readRasters } as GeoTIFF;
}

function createRasterResult() {
  return Object.assign([
    new Uint8Array([12]),
    new Uint8Array([0]),
    new Uint8Array([0]),
    new Uint8Array([255]),
  ], {
    width: 1,
    height: 1,
  });
}

describe('koppenCogReader', () => {
  beforeAll(() => {
    vi.stubGlobal('ImageData', TestImageData);
  });

  beforeEach(() => {
    fromUrlMock.mockReset();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('converts RGBA raster data into ImageData without changing class IDs', () => {
    const imageData = createKoppenImageDataFromRgba(
      [
        new Uint8Array([1, 2, 0, 30]),
        new Uint8Array([1, 2, 0, 30]),
        new Uint8Array([1, 2, 0, 30]),
        new Uint8Array([255, 128, 0, 64]),
      ],
      2,
      2,
    );

    expect(imageData.width).toBe(2);
    expect(imageData.height).toBe(2);
    expect([...imageData.data]).toEqual([
      1, 1, 1, 255,
      2, 2, 2, 128,
      0, 0, 0, 0,
      30, 30, 30, 64,
    ]);
  });

  it('keeps no-data alpha transparent', () => {
    const imageData = createKoppenImageDataFromRgba(
      [
        new Uint8Array([0]),
        new Uint8Array([0]),
        new Uint8Array([0]),
        new Uint8Array([0]),
      ],
      1,
      1,
    );

    expect([...imageData.data]).toEqual([0, 0, 0, 0]);
  });

  it('returns transparent tile data for bboxes outside the COG extent', () => {
    expect(getKoppenCogReadBounds({
      west: 180,
      south: -90,
      east: 360,
      north: 90,
    })).toBeUndefined();

    const imageData = createTransparentKoppenImageData(1, 1);

    expect([...imageData.data]).toEqual([0, 0, 0, 0]);
  });

  it('does not read the COG when a tile bbox is outside the COG extent', async () => {
    const imageData = await readKoppenCogTile('koppen.tif', {
      west: 180,
      south: -90,
      east: 360,
      north: 90,
    });

    expect(fromUrlMock).not.toHaveBeenCalled();
    expect(imageData.width).toBe(256);
    expect(imageData.height).toBe(256);
    expect([...imageData.data]).toEqual(new Array(256 * 256 * 4).fill(0));
  });

  it('rejects aborted raster reads instead of returning a transparent tile', async () => {
    const abortController = new AbortController();
    abortController.abort();
    const abortError = new DOMException('The operation was aborted.', 'AbortError');
    const readRasters = vi.fn().mockRejectedValue(abortError);

    fromUrlMock.mockResolvedValue(createGeoTiffTestDouble(readRasters));

    await expect(readKoppenCogTile('aborted.tif', {
      west: 0,
      south: 0,
      east: 1,
      north: 1,
    }, abortController.signal)).rejects.toBe(abortError);

    expect(readRasters).toHaveBeenCalledTimes(1);
  });

  it('retries missing tile block errors before returning tile data', async () => {
    const readRasters = vi.fn()
      .mockRejectedValueOnce(new TypeError("Cannot read properties of undefined (reading 'buffer')"))
      .mockResolvedValueOnce(createRasterResult());

    fromUrlMock.mockResolvedValue(createGeoTiffTestDouble(readRasters));

    const imageData = await readKoppenCogTile('retry.tif', {
      west: 0,
      south: 0,
      east: 1,
      north: 1,
    });

    expect(readRasters).toHaveBeenCalledTimes(2);
    expect([...imageData.data]).toEqual([12, 12, 12, 255]);
  });

  it('clamps read bboxes to the COG extent', () => {
    expect(getKoppenCogReadBounds({
      west: -181,
      south: -91,
      east: 10,
      north: 91,
    })).toEqual([-180, -90, 10, 90]);
  });
});
