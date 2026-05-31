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
