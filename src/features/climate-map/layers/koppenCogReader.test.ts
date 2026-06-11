import {
  createKoppenImageDataFromRgba,
  createTransparentKoppenImageData,
  getKoppenCogReadBounds,
} from './koppenCogReader';

class TestImageData {
  readonly colorSpace = 'srgb';

  constructor(
    readonly data: Uint8ClampedArray,
    readonly width: number,
    readonly height: number,
  ) {}
}

describe('koppenCogReader', () => {
  beforeAll(() => {
    vi.stubGlobal('ImageData', TestImageData);
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

  it('clamps read bboxes to the COG extent', () => {
    expect(getKoppenCogReadBounds({
      west: -181,
      south: -91,
      east: 10,
      north: 91,
    })).toEqual([-180, -90, 10, 90]);
  });
});
