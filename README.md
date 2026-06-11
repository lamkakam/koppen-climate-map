# koppen-climate-map

Client-only React, TypeScript, and Vite app for the Koppen climate map.

See [docs/development.md](docs/development.md) for local development commands.

## Raster Sources

The map renders public OpenStreetMap raster tiles as the base layer from:

```text
https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

OpenStreetMap attribution must remain visible in the map viewport and link to `https://www.openstreetmap.org/copyright`. Public tile usage must follow the OpenStreetMap tile policy: https://operations.osmfoundation.org/policies/tiles/

The Koppen climate overlay reads viewport-sized windows from one generated Cloud-Optimized GeoTIFF:

```text
public/tiles/koppen/1991_2020/koppen_geiger_0p00833333_rgba_cog.tif
```

At runtime Vite serves those files as:

```text
/tiles/koppen/1991_2020/koppen_geiger_0p00833333_rgba_cog.tif
```

Generate it from the source raster with:

```sh
scripts/preprocess_geotiff.sh
```

The COG is a generated local/deploy artifact and is ignored by git. It must be present at the public path above before running or deploying the app. The COG stores the Koppen class ID in the red, green, and blue channels; alpha is 255 for classified pixels, and class ID `0` has alpha 0 for transparent no-data. Class coloring and filtering happen in the deck.gl bitmap fragment shader.

If the climate COG moves, update `KOPPEN_COG_URL` in `src/features/climate-map/layers/KoppenTileLayer.ts`.
