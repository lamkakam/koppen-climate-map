import { buildKoppenCogUrl, KOPPEN_COG_URL } from './KoppenTileLayer';

describe('KoppenTileLayer', () => {
  it('uses a root-relative tile URL in local builds', () => {
    expect(buildKoppenCogUrl('/')).toBe(
      '/tiles/koppen/1991_2020/koppen_geiger_0p00833333_rgba_cog.tif',
    );
  });

  it('prefixes the tile URL with the Vite base path for GitHub Pages builds', () => {
    expect(buildKoppenCogUrl('/koppen-climate-map/')).toBe(
      '/koppen-climate-map/tiles/koppen/1991_2020/koppen_geiger_0p00833333_rgba_cog.tif',
    );
  });

  it('derives the default tile URL from the active Vite base path', () => {
    expect(KOPPEN_COG_URL).toBe(buildKoppenCogUrl(import.meta.env.BASE_URL));
  });
});
