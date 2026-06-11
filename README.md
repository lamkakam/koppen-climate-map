# koppen-climate-map

Client-only React, TypeScript, and Vite app for the Koppen climate map.

See [docs/development.md](docs/development.md) for local development commands.

## Raster Sources

The map renders public OpenStreetMap raster tiles as the base layer from:

```text
https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

OpenStreetMap attribution must remain visible in the map viewport and link to `https://www.openstreetmap.org/copyright`. Public tile usage must follow the OpenStreetMap tile policy: https://operations.osmfoundation.org/policies/tiles/

The Koppen climate overlay reads viewport-sized windows from one generated Cloud-Optimized GeoTIFF for the 1991-2020 period:

```text
public/tiles/koppen/1991_2020/koppen_geiger_0p00833333_rgba_cog.tif
```

At runtime Vite serves those files as:

```text
/tiles/koppen/1991_2020/koppen_geiger_0p00833333_rgba_cog.tif
```

Restore the app-ready COG from the packaged archive with:

```sh
scripts/unpack_koppen_tile.sh
```

The tracked archive is:

```text
data/tiles/koppen/1991_2020/koppen_geiger_0p00833333_rgba_cog.tif.tar.gz
```

The COG is a generated local/deploy artifact and is ignored by git. It must be present at the public path above before running or deploying the app. The COG stores the Koppen class ID in the red, green, and blue channels; alpha is 255 for classified pixels, and class ID `0` has alpha 0 for transparent no-data. Class coloring and filtering happen in the deck.gl bitmap fragment shader. The app structure can accommodate data-era selection if additional eras are added later.

If the climate COG moves, update `KOPPEN_COG_URL` in `src/features/climate-map/layers/KoppenTileLayer.ts`.

### Regenerating the Koppen COG

To rebuild the app-ready COG from the upstream dataset:

1. Download the Koppen-Geiger V3 dataset from https://www.gloh2o.org/koppen/.
2. Extract the source GeoTIFF so this default path exists:

   ```text
   koppen_geiger_tif/1991_2020/koppen_geiger_0p00833333.tif
   ```

3. Generate the RGBA COG:

   ```sh
   scripts/preprocess_geotiff.sh
   ```

4. Optionally refresh the packaged archive:

   ```sh
   scripts/package_koppen_tile.sh
   ```

### Koppen Tile Scripts

```sh
scripts/unpack_koppen_tile.sh [archive_path]
```

Extracts the packaged COG archive into `public/`. `archive_path` defaults to:

```text
data/tiles/koppen/1991_2020/koppen_geiger_0p00833333_rgba_cog.tif.tar.gz
```

```sh
scripts/preprocess_geotiff.sh [source_tif] [output_tif]
```

Creates an RGBA Cloud-Optimized GeoTIFF from the source class GeoTIFF. `source_tif` defaults to:

```text
koppen_geiger_tif/1991_2020/koppen_geiger_0p00833333.tif
```

`output_tif` defaults to:

```text
public/tiles/koppen/1991_2020/koppen_geiger_0p00833333_rgba_cog.tif
```

```sh
scripts/package_koppen_tile.sh [tile_path]
```

Packages the generated COG. `tile_path` defaults to:

```text
public/tiles/koppen/1991_2020/koppen_geiger_0p00833333_rgba_cog.tif
```

The output archive path is derived as `data/<tile_path-without-public-prefix>.tar.gz`.

### Koppen Dataset License And Citation

[The Köppen-Geiger dataset](https://www.gloh2o.org/koppen/) is licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by-nc/4.0/). This repository's license does not apply to the upstream GloH2O dataset or files derived from it, including the generated COG and packaged archive.

Upstream dataset citation:

Beck, H.E., T.R. McVicar, N. Vergopolan, A. Berg, N.J. Lutsko, A. Dufour, Z. Zeng, X. Jiang, A.I.J.M. van Dijk, D.G. Miralles. "High-resolution (1 km) Köppen-Geiger maps for 1901-2099 based on constrained CMIP6 projections." Scientific Data 10, 724, [doi:10.1038/s41597-023-02549-6](https://doi.org/10.1038/s41597-023-02549-6) (2023).
