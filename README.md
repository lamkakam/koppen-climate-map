# koppen-climate-map

Client-only React, TypeScript, and Vite app for the Koppen climate map.

See [docs/development.md](docs/development.md) for local development commands.

## Raster Tiles

The map renders public OpenStreetMap raster tiles as the base layer from:

```text
https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

OpenStreetMap attribution must remain visible in the map viewport and link to `https://www.openstreetmap.org/copyright`. Public tile usage must follow the OpenStreetMap tile policy: https://operations.osmfoundation.org/policies/tiles/

The Koppen climate overlay reads browser image tiles from:

```text
public/tiles/koppen/1991_2020/{z}/{x}/{y}.png
```

At runtime Vite serves those files as:

```text
/tiles/koppen/1991_2020/{z}/{x}/{y}.png
```

Tiles must be encoded as PNGs where the red channel stores the Koppen class ID, alpha is 255 for classified pixels, and class ID `0` means transparent no-data. The client does not decode GeoTIFFs and does not rewrite tile pixels on the CPU; class coloring and filtering happen in the deck.gl bitmap fragment shader.

If the climate tiles move, update `KOPPEN_TILE_URL` in `src/features/climate-map/layers/KoppenTileLayer.ts`.
