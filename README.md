# Syvo Downloader (Desktop Video Downloader)

A Windows-style desktop application for downloading permitted online video/audio content. It provides a download queue, video/audio modes, quality selection, real-time progress, history, search, settings, playlist support, subtitles, duplicate-file detection, and a first-run responsible-use confirmation — built with Electron, [yt-dlp](https://github.com/yt-dlp/yt-dlp), and [FFmpeg](https://ffmpeg.org/).

## Important usage note

Use this app only for media you own, have permission to download, or where the platform/license explicitly permits downloading. YouTube's official help documents that users can download their own uploaded videos and use Premium offline downloads; other users' videos generally cannot be downloaded through YouTube's own workflow. Review the platform's current terms and the content license before using any downloader. The app shows a one-time responsible-use confirmation on first launch.

---

## System Requirements

### To run the installed app (end users)

| Requirement | Minimum | Recommended |
|---|---|---|
| OS | Windows 10 (64-bit, version 1909+) | Windows 11 |
| Processor | 64-bit dual-core, 1.6 GHz | Quad-core 2.0 GHz+ |
| RAM | 4 GB | 8 GB+ (helps with large playlists / multiple concurrent downloads) |
| Disk space | ~500 MB for the app | Several GB free, depending on how much you download |
| Display | 1280 × 720 (window minimum is 1000 × 680) | 1920 × 1080 |
| Network | Broadband internet connection (required — the app cannot analyze or download offline) | — |
| Permissions | Write access to the selected download folder | — |

> The Windows installer bundles `yt-dlp` and `FFmpeg` automatically (see [Building](#building-a-windows-installer) below), so a typical end user does not need to install anything else separately. macOS/Linux are not officially targeted but the app runs on them via Electron since there is nothing Windows-specific in the code.

### To run or build from source (developers)

- **Node.js 20+** and npm
- **yt-dlp** executable — on your `PATH`, or placed in the project's `bin/` folder
- **FFmpeg** executable — on your `PATH`, or placed in the project's `bin/` folder
- Git (optional, for cloning)

The app looks for `yt-dlp`/`ffmpeg` in this order: packaged app's `resources/bin/`, the project's `bin/` folder, `~/.local/bin`, `/usr/local/bin`, `/usr/bin`, then finally your system `PATH`. Use **Tools → Diagnostics** (or the Settings → Advanced tab) inside the app to see exactly which binaries were found and their versions.

---

## Run from source

```bash
npm install
npm start
```

On first launch you'll see a short welcome screen to pick your download folder, confirm dependency status, choose a theme, and accept the responsible-use terms.

## Building a Windows installer

```bash
npm run build:win        # NSIS installer
npm run build:portable   # portable .exe
```

Place `yt-dlp.exe` and `ffmpeg.exe` in `bin/` before building — `electron-builder` copies that folder into the packaged app's `resources/bin/`, so the installer works out of the box without asking users to install dependencies themselves.

---

## Features

- Paste/drag-and-drop a URL, or import a `.txt` file of URLs, or add a full playlist with per-item selection
- Metadata analysis (title, thumbnail, duration, channel, available formats, subtitles, chapters)
- Video (MP4/MKV/WebM) and audio-only (MP3/M4A/Opus/WAV/FLAC) modes with quality/format pickers and an advanced format table
- Queue with pause/resume/cancel/retry (per item and globally), concurrency control, auto-retry, and persistence across restarts
- Duplicate-file detection (Skip / Rename / Replace / Download Anyway) and a disk-space advisory before large downloads
- Search, sort, and filter across the queue and download history
- Desktop notifications, system tray with quick controls, dark/light theme
- Settings for download folder, concurrency, filename template, subtitles, metadata/thumbnail embedding, rate limiting, and proxy
- Window size/position is remembered between launches

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| Ctrl+V | Paste URL |
| Ctrl+N | New download |
| Ctrl+F | Search |
| Ctrl+, | Settings |
| Ctrl+Shift+P | Pause all |
| Ctrl+Shift+R | Resume all |

---

## Product direction

This app is deliberately local-first: no account system, no server proxy, no cloud storage, and no remote copy of the media. Everything — settings, queue, and history — lives in a local JSON store under Electron's `userData` directory. Production hardening still to come: signed installer + auto-update, SQLite-backed history for very large libraries, a scheduler, and channel/subscription workflows.
