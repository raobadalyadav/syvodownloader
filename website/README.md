# Syvo Downloader — Website

The marketing/landing site for [Syvo Downloader](../README.md). Static React (Vite + TypeScript) — no backend, no server-side video processing. The download buttons link straight to the GitHub Release assets; this site never touches or proxies any media itself.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally to sanity-check it
```

## Deploy

`dist/` is a plain static site — deploy it anywhere that serves static files:

- **Vercel / Netlify**: point either at this `website/` subdirectory, build command `npm run build`, output directory `dist`.
- **GitHub Pages**: `npm run build`, then publish `dist/` to a `gh-pages` branch (e.g. via the `gh-pages` npm package or a GitHub Actions workflow).
- **Any static host** (S3, Cloudflare Pages, etc.): upload the contents of `dist/` after building.

## Updating release links

Download URLs live in one place: [`src/constants.ts`](src/constants.ts). Bump `RELEASE_TAG` (and the two asset filenames) there when a new version is published on the [Releases page](https://github.com/raobadalyadav/syvodownloader/releases).
