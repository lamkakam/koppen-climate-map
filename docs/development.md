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

## Climate Tiles

The client map loads XYZ PNG tiles from `public/tiles/koppen/1991_2020/{z}/{x}/{y}.png`, served at `/tiles/koppen/1991_2020/{z}/{x}/{y}.png`. Each pixel's red channel is the Koppen class ID; class `0` is transparent no-data. Filtering classes updates deck.gl shader uniforms only, so the tile URL remains stable and tiles are not re-fetched for checklist changes.
