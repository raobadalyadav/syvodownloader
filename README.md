# Syvo Downloader

A Windows-style desktop application for downloading permitted online video/audio content. It provides a download queue, video/audio modes, quality selection, real-time progress, history, search, settings, playlist support, subtitles, duplicate-file detection, and a first-run responsible-use confirmation — built with Electron, [yt-dlp](https://github.com/yt-dlp/yt-dlp), and [FFmpeg](https://ffmpeg.org/).

Because the download engine is generic (no site-specific code), it works with any of the [1800+ sites yt-dlp supports](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md) — not just YouTube, but Instagram, Facebook, and most other video platforms too. Private or login-gated content (common on Instagram/Facebook) needs the **Cookies Source** setting (Settings → Advanced) pointed at a browser you're logged into.

## Important usage note

Use this app only for media you own, have permission to download, or where the platform/license explicitly permits downloading. Every platform's official help/terms generally allow downloading your own uploaded content, but downloading other people's content without authorization is usually against that platform's terms — review the specific platform's current terms and the content license before downloading anything. The app shows a one-time responsible-use confirmation on first launch. This is a local desktop tool only — it does not host, proxy, or redistribute any media through a server.

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

> Every packaged build (Windows, Linux, macOS) bundles its own `yt-dlp` and `FFmpeg` automatically (see [Building](#building-installers) below), so a typical end user does not need to install anything else separately.

### Linux / macOS

Same requirements as above, adjusted for platform: Linux needs a 64-bit distro with FUSE available for AppImage (or install the `.deb` instead); macOS needs 11 (Big Sur) or later. The macOS build is unsigned — Gatekeeper will warn on first launch, so open it via right-click → Open the first time (or `xattr -cr` on the `.app`).

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

## Building installers

```bash
npm run build:win        # Windows: NSIS installer
npm run build:portable   # Windows: portable .exe
npm run build:linux      # Linux: AppImage + .deb
npm run build:mac        # macOS: .zip (unsigned — see note above)
```

`bin/` holds each platform's `yt-dlp`/`ffmpeg` binaries in its own subfolder — `bin/win/`, `bin/linux/`, `bin/mac/` — and `electron-builder` copies only the matching one into each build's `resources/bin/`, so every installer works out of the box without asking users to install dependencies themselves. Linux/macOS cross-builds from a Linux machine work for AppImage/deb/zip, but macOS code signing and notarization require an actual Mac.

---

## Features

- Paste/drag-and-drop a URL, or import a `.txt` file of URLs, or add a full playlist with per-item selection (playlist links are auto-detected)
- Works with YouTube, Instagram, Facebook, and any other site yt-dlp supports; a **Cookies Source** setting unlocks private/login-gated content
- Metadata analysis (title, thumbnail, duration, channel, available formats, subtitles, chapters), with estimated file size shown right in the quality picker
- Video (MP4/MKV/WebM) and audio-only (MP3/M4A/Opus/WAV/FLAC) modes with mode-aware quality/format pickers
- Queue with pause/resume/cancel/retry (per item and globally), manual reordering, concurrency control, auto-retry, and persistence across restarts
- Duplicate-file detection (Skip / Rename / Replace / Download Anyway) and a disk-space advisory before large downloads
- Search and filter across the queue and download history; downloaded file size shown in both
- Desktop notifications, system tray with quick controls, dark/light theme
- Settings for download folder + optional folder template (`{uploader}/{year}`), concurrency, filename template (with a token-insert builder), subtitle languages, metadata/thumbnail embedding, rate limiting, proxy, and cookies source
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

## Website

A static React landing/marketing site lives in [`website/`](website/) — see [`website/README.md`](website/README.md) for running, building, and deploying it. It only links to the GitHub Release assets; it never hosts or processes any media itself.

## Web UI (local, browser-based)

Prefer a browser tab over the Electron window? [`webapp/`](webapp/) is a React + Express app with the full download engine — same features as the desktop app — running as a small server on your own machine (`127.0.0.1` only, never a public/hosted service). See [`webapp/README.md`](webapp/README.md).

## Product direction

This app is deliberately local-first: no account system, no server proxy, no cloud storage, and no remote copy of the media. Everything — settings, queue, and history — lives in a local JSON store under Electron's `userData` directory. Production hardening still to come: signed installer + auto-update, SQLite-backed history for very large libraries, a scheduler, and channel/subscription workflows.
