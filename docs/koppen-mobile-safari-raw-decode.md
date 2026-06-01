# Koppen Mobile Safari Raw Decode Fix

## Problem

Mobile Safari showed false class-colored dots in the Koppen overlay, even after the Koppen texture sampler was changed to nearest filtering with mipmap sampling disabled.

The remaining failure mode was treated as browser PNG decode or upload color conversion. The Koppen raster tiles are categorical data, not photographs, so the grayscale value must arrive in WebGL unchanged because the shader reads `color.r * 255.0` as the Koppen class ID.

## Fix

Koppen tiles now bypass browser-managed image decoding.

The Koppen `TileLayer` fetches each PNG as bytes with the tile abort signal, decodes the supported PNG format in client code, and passes raw `ImageData` into `KoppenBitmapLayer`.

The decoder supports the current production tile format only:

- PNG signature, `IHDR`, one or more `IDAT`, and `IEND`
- 8-bit grayscale plus alpha
- non-interlaced scanlines
- PNG filters 0 through 4

Decoded pixels are converted to RGBA with the grayscale byte copied exactly into `r`, `g`, and `b`, and the original alpha copied to `a`. Unsupported PNG formats throw a clear error instead of rendering potentially corrupted categorical data.

The existing Koppen sampler settings remain in place:

- nearest minification and magnification filtering
- no mipmap filtering
- LOD clamped to level 0
- clamp-to-edge addressing

OpenStreetMap tiles, tile URLs, class colors, shader mapping, and UI controls were not changed.

## Verification

Automated checks:

```sh
npx vitest run src/features/climate-map/layers/koppenPngDecoder.test.ts
npm run typecheck
```

The decoder tests cover exact class ID preservation, a non-zero scanline filter, and rejection of unsupported PNG headers.

Manual Mobile Safari acceptance:

- solid same-class land regions no longer show false deep green dots
- transparent or ocean areas no longer show stray false data points
- panning and zooming still load Koppen tiles normally
