# Desktop Video Downloader

A Windows-style desktop application inspired by the supplied screenshot. It provides a clean downloader queue, video/audio modes, quality selection, progress reporting, history tabs, settings, and an output folder picker.

## Important usage note
Use this app only for media you own, have permission to download, or where the platform/license explicitly permits downloading. YouTube's official help documents that users can download their own uploaded videos and use Premium offline downloads; it also says other users' videos cannot be downloaded through YouTube's own download workflow. Review the platform's current terms and the content license before using any third-party downloader.

## Prerequisites
- Node.js 20+
- `yt-dlp` executable
- `ffmpeg` executable

Place `yt-dlp(.exe)` and `ffmpeg(.exe)` in a `bin/` folder beside `package.json`, or make them available on PATH.

The app uses yt-dlp for metadata and download operations. yt-dlp documents YouTube among its supported extractors and notes that FFmpeg is needed when audio/video streams have to be merged.

## Run
```bash
npm install
npm start
```

## Build Windows installer
```bash
npm run build:win
```

## Product direction
This starter is deliberately local-first: no account system, no server proxy, no cloud storage, and no remote copy of the media. A production release should add a signed installer, automatic dependency management, persistent history, retry/resume policies, concurrent queue control, disk-space checks, telemetry opt-in, update handling, localization, accessibility, and a permissions/license confirmation flow.
