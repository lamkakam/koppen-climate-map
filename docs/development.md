# Development

## Requirements

- Node.js 22 or newer
- npm 11 or newer

## Commands

```sh
npm install --legacy-peer-deps
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Playwright uses Vite on `127.0.0.1:5174` with a strict port to avoid reusing another local app during smoke tests.

## Climate Raster

The client map loads public OpenStreetMap XYZ PNG tiles from `https://tile.openstreetmap.org/{z}/{x}/{y}.png` as the base layer. Keep the OpenStreetMap attribution visible in the map viewport and linked to `https://www.openstreetmap.org/copyright`. Public tile usage must follow the OpenStreetMap tile policy: https://operations.osmfoundation.org/policies/tiles/

The Koppen overlay reads viewport-sized tile windows from one generated Cloud-Optimized GeoTIFF at `public/tiles/koppen/1991_2020/koppen_geiger_0p00833333_rgba_cog.tif`, served at `/tiles/koppen/1991_2020/koppen_geiger_0p00833333_rgba_cog.tif`. Generate it from `koppen_geiger_tif/1991_2020/koppen_geiger_0p00833333.tif` with:

```sh
scripts/preprocess_geotiff.sh
```

The generated COG is ignored by git and must be provided locally or by deployment before the app runs. Its red, green, and blue channels store the Koppen class ID, alpha is 255 for classified pixels, and class `0` has alpha 0 for transparent no-data. Filtering classes updates deck.gl shader uniforms only, so the COG URL remains stable and the raster source is not changed for checklist updates.
