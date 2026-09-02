# Complete PRD — YouTube Video Downloader Desktop Application

**Product name:** YouTube Video Downloader
**Product type:** Windows desktop application
**Primary platform:** Windows 10/11
**Recommended stack:** Electron + Node.js + `yt-dlp` + FFmpeg
**Product model:** Local-first desktop utility
**Reference UI:** User-provided 4K Video Downloader-style screenshot
**Current starter project:** The generated project is explicitly positioned as a Windows-style desktop downloader with queue, video/audio modes, quality selection, progress, history tabs, settings, and output-folder selection. 

---

# 1. Executive Summary

The product is a modern Windows desktop application that allows users to manage permitted media downloads through a simple workflow:

**Paste URL → Analyze → Select format/quality → Add to queue → Download → Process → View/Open file**

The experience should visually resemble a professional desktop downloader rather than a web page: compact toolbar, native Windows window behavior, persistent download queue, detailed progress, history, settings, and unobtrusive notifications.

The current project is designed as **local-first** with no account, server proxy, cloud media storage, or remote media copy. 

The application should only be positioned for media the user owns, has authorization to download, or for which downloading is explicitly permitted by the platform/content license. The current project README already includes this usage constraint. 

---

# 2. Product Vision

Build a fast, reliable, privacy-conscious desktop media downloader that feels substantially better than command-line tools while retaining the flexibility of an advanced downloader.

### Vision statement

> “A powerful desktop download manager for permitted online media, combining one-click simplicity with professional controls.”

---

# 3. Problem Statement

Existing downloading workflows often suffer from:

* complicated command-line interfaces
* excessive advertisements
* poor download management
* limited control over formats
* weak queue handling
* unclear download progress
* poor error recovery
* confusing settings
* no centralized download history
* weak organization for large numbers of downloads

The proposed application solves this through a unified desktop interface.

---

# 4. Goals

## Primary goals

1. Make downloading a permitted video extremely simple.
2. Provide professional format and quality controls.
3. Support multiple concurrent downloads.
4. Provide reliable progress and ETA.
5. Maintain persistent download history.
6. Handle playlists and collections cleanly.
7. Provide robust pause, resume, retry and cancel functionality.
8. Make downloaded content easy to locate.
9. Work primarily offline except when analyzing/downloading remote URLs.
10. Maintain user control over file location and application settings.

## Secondary goals

* Support multiple supported media platforms through the underlying extraction engine.
* Provide advanced download settings for power users.
* Provide a polished Windows-native experience.
* Minimize CPU/RAM usage.
* Provide accessible keyboard-driven operation.

## Non-goals for initial release

* Hosting/downloading media through our own servers.
* Cloud storage.
* Social-network functionality.
* Media streaming service.
* Content redistribution.
* Circumventing DRM or access controls.
* Anonymous proxy infrastructure.

---

# 5. Target Users

## Persona A — Casual User

Needs:

> “I have a permitted video URL and want it saved locally.”

Requirements:

* paste link
* choose quality
* click download
* find resulting file

## Persona B — Content Creator

Needs:

* download own published material
* batch processing
* audio extraction
* subtitle preservation
* quality selection
* organized folders

## Persona C — Researcher / Student

Needs:

* playlists
* multiple URLs
* metadata
* subtitles
* predictable naming
* download history

## Persona D — Power User

Needs:

* custom formats
* advanced format selection
* concurrency
* filename templates
* cookies where legitimately authorized
* proxy support where appropriate
* command/log visibility

---

# 6. Product Principles

### Simple by default

A casual user should not need to understand codecs, containers or command-line syntax.

### Powerful when needed

Advanced controls should be available without cluttering the primary interface.

### Local-first

Media should be downloaded directly to the user's machine rather than routed through an application-owned server. The starter architecture explicitly follows this model. 

### Transparent

The app should clearly show:

* source
* selected quality
* output format
* download location
* progress
* errors

### Safe operation

The application should not implement DRM circumvention, credential theft, or unauthorized access mechanisms.

---

# 7. Core User Journey

```text
Launch Application
       ↓
Paste URL
       ↓
Analyze URL
       ↓
Validate Source
       ↓
Fetch Metadata
       ↓
Show Video Information
       ↓
Select:
  Format
  Quality
  Audio/Video
  Output folder
       ↓
Add to Queue
       ↓
Download
       ↓
Merge/Post-process with FFmpeg if required
       ↓
Validate Output
       ↓
Move to Completed
       ↓
Show notification
       ↓
Open / Play / Reveal File
```

---

# 8. UI / UX Requirements

The visual reference uses a traditional desktop application layout with:

* title bar
* menu bar
* prominent Paste Link action
* download type selector
* quality selector
* destination selector
* category tabs
* searchable download list
* per-item actions
* bottom download status area

The new product should retain this information architecture while using its own branding.

---

# 9. Main Application Layout

## Window

Default size:

```text
Width: 1400px
Height: 850px
Minimum: 1000 × 650
```

Resizable.

Remember the previous window size and position.

---

# 10. Top Application Bar

### Left

Application logo + product name.

Example:

```text
▶ Media Downloader
```

### Right

* Minimize
* Maximize/Restore
* Close

---

# 11. Menu Bar

Menus:

```text
File
Edit
View
Tools
Help
```

### File

```text
Add URL
Add URLs from File
Add Playlist
Open Download Folder
Open History
Export History
Exit
```

### Edit

```text
Copy
Paste
Select All
Remove Selected
Clear Completed
```

### View

```text
All
Active
Completed
Failed
Audio
Video
Playlists
Compact View
Detailed View
```

### Tools

```text
Settings
Format Selector
Queue Manager
Diagnostics
Check for Updates
```

### Help

```text
Documentation
Keyboard Shortcuts
Report Problem
Privacy
About
```

---

# 12. Primary Toolbar

The toolbar is the most important interaction area.

```text
[ Paste Link ] [ Download ▼ ] [ Quality ▼ ] [ Format ▼ ]
[ Destination ▼ ]                         [ Settings ⚙ ]
```

### Paste Link

Clicking opens/activates URL input.

Keyboard:

```text
Ctrl + V
```

should automatically recognize supported URLs.

---

# 13. URL Input

Support:

```text
https://...
```

Multiple URLs:

```text
URL 1
URL 2
URL 3
```

Potential future support:

* multiline paste
* clipboard monitoring
* drag-and-drop URL
* `.txt` URL import

---

# 14. URL Analysis

After URL entry:

```text
Analyzing...
```

Then retrieve:

* title
* thumbnail
* duration
* uploader/channel
* source
* available formats
* subtitles
* playlist metadata where applicable

### Failure states

Examples:

```text
Invalid URL
Unsupported URL
Private content
Authentication required
Network unavailable
Extractor error
Age-restricted content
Format unavailable
```

The UI must give actionable messages rather than exposing raw stack traces.

---

# 15. Video Information Dialog

Example:

```text
┌─────────────────────────────────────────────┐
│ [Thumbnail]                                 │
│                                             │
│ Video title                                 │
│ Channel                                     │
│ Duration: 24:18                             │
│ Source: YouTube                             │
│                                             │
│ Quality: [1080p ▼]                          │
│ Format:  [MP4 ▼]                            │
│                                             │
│ ☑ Download subtitles                        │
│ ☑ Embed metadata                            │
│                                             │
│          [Cancel] [Add to Queue]            │
└─────────────────────────────────────────────┘
```

---

# 16. Quality Selection

Support common quality classes where available:

```text
Best
4K / 2160p
1440p
1080p
720p
480p
360p
240p
144p
```

Audio:

```text
Best
320 kbps
256 kbps
192 kbps
128 kbps
96 kbps
```

Important:

The UI should show **available qualities returned by the extractor**, not pretend unavailable resolutions exist.

---

# 17. Format Selection

### Video

```text
MP4
MKV
WebM
```

### Audio

```text
MP3
M4A
WAV
Opus
FLAC
```

Format support should be validated against actual conversion capability.

---

# 18. Advanced Format Selection

Power users can see a table such as:

| Format | Resolution | FPS | Video Codec | Audio Codec | Size |
| ------ | ---------: | --: | ----------- | ----------- | ---: |
| 137    |      1080p |  30 | H.264       | —           |    — |
| 248    |      1080p |  30 | VP9         | —           |    — |
| 251    |      Audio |   — | —           | Opus        |    — |

The user can select the exact permitted source format combination.

---

# 19. Download Queue

The queue is the heart of the application.

Each item should have:

```text
Thumbnail
Title
Source/channel
Duration
Format
Quality
Progress
Speed
ETA
Status
Actions
```

Example:

```text
┌────────────────────────────────────────────────────────┐
│ [thumb] Video Title                                    │
│         Channel • 12:42 • MP4 • 1080p                 │
│         ███████████████░░░░  74%                      │
│         3.42 MB/s • 2m 14s remaining                  │
│                                         Pause  ⋮       │
└────────────────────────────────────────────────────────┘
```

---

# 20. Download States

Each item has one state:

```text
Queued
Analyzing
Preparing
Downloading
Merging
Converting
Finalizing
Completed
Paused
Failed
Canceled
Waiting
```

State transitions:

```text
Queued
 ↓
Analyzing
 ↓
Preparing
 ↓
Downloading
 ↓
Post-processing
 ↓
Completed
```

Failure may occur from any stage.

---

# 21. Progress System

Show:

### Percentage

```text
68%
```

### Size

```text
742 MB / 1.2 GB
```

### Speed

```text
8.4 MB/s
```

### ETA

```text
01:42
```

### Overall queue

```text
3 downloads active
8 queued
2 completed
```

---

# 22. Queue Controls

Global:

```text
Start All
Pause All
Resume All
Cancel All
Remove Completed
Retry Failed
```

Per item:

```text
Pause
Resume
Cancel
Retry
Remove
Open Folder
Open File
Copy URL
View Details
```

---

# 23. Concurrent Downloads

Settings:

```text
Maximum concurrent downloads:
[ 3 ]
```

Suggested default:

```text
3
```

Allowed range:

```text
1–10
```

Actual safe maximum may depend on system/network resources.

---

# 24. Pause / Resume

The downloader should use the underlying downloader's capabilities wherever supported.

Requirements:

* pause active transfer
* preserve partial data where safely possible
* resume without restarting unnecessarily
* handle expired URLs by refreshing source metadata
* clearly indicate when true resume is unavailable

---

# 25. Retry System

Configurable:

```text
Automatic retry:
☑ Enabled

Retries:
[ 3 ]

Retry delay:
[ 10 seconds ]
```

Retry causes:

* temporary network failure
* timeout
* HTTP transient error
* temporary extractor failure

Do not endlessly retry permanent errors.

---

# 26. Download History

Tabs:

```text
All
Video
Audio
Playlists
Channels
Subscriptions
Completed
Failed
```

Persist history locally.

Store:

```text
id
source_url
title
channel
thumbnail
download_date
status
file_path
file_size
format
quality
duration
error_code
```

---

# 27. Search

Search history/download list by:

* title
* uploader
* URL
* filename
* status

Search should be instant for local history.

Shortcut:

```text
Ctrl + F
```

---

# 28. Sorting

Support:

```text
Date added
Date completed
Title
Duration
File size
Status
Quality
```

Ascending/descending.

---

# 29. Filtering

Examples:

```text
All
Active
Completed
Failed
Paused
Audio
Video
```

---

# 30. Download Folder

User can select:

```text
Downloads/
Videos/
Music/
Custom folder
```

Potential folder templates:

```text
{channel}/
{playlist}/
{year}/
{month}/
```

Example:

```text
Videos/
  Channel Name/
    Video Title.mp4
```

---

# 31. Filename Templates

Default:

```text
%(title)s.%(ext)s
```

Advanced examples:

```text
%(uploader)s - %(title)s.%(ext)s
```

```text
%(upload_date)s - %(title)s.%(ext)s
```

Provide a friendly template builder rather than requiring raw syntax.

---

# 32. Duplicate Detection

Before download:

```text
A file with the same name already exists.
```

Options:

```text
Skip
Replace
Rename
Download Anyway
```

Optional content/hash comparison for stronger duplicate detection.

---

# 33. Playlist Support

When a playlist URL is detected:

```text
Playlist detected

42 videos

☑ Select all
☐ Video 01
☐ Video 02
☐ Video 03
...
```

Actions:

```text
Download selected
Download all
Cancel
```

Playlist metadata:

* playlist title
* item count
* creator
* ordering

---

# 34. Channel Support

Where supported by the extraction engine:

```text
Channel
├── Latest videos
├── Videos
├── Shorts
├── Live
```

Allow selection of specific items rather than blindly downloading everything.

---

# 35. Subscriptions

This should be considered a **Phase 3/advanced feature**.

Possible implementation:

```text
Subscriptions
├── Channel A
├── Channel B
├── Channel C
```

User can configure:

```text
Check for new permitted media
Download manually
```

No automated collection should be enabled without explicit user configuration.

---

# 36. Audio Extraction

Audio mode:

```text
Download → Audio
```

Options:

```text
MP3
M4A
Opus
WAV
FLAC
```

Metadata:

```text
Title
Artist/Uploader
Album/Playlist
Thumbnail
```

Optional:

```text
Embed cover art
Embed metadata
```

---

# 37. Subtitle Support

Options:

```text
☐ Download subtitles
☐ Download automatic subtitles
☐ Embed subtitles
☐ Save subtitles separately
```

Languages:

```text
English
Hindi
Spanish
French
...
```

Formats:

```text
SRT
VTT
ASS
```

---

# 38. Metadata

Optional metadata embedding:

```text
☑ Title
☑ Artist/Uploader
☑ Album/Playlist
☑ Description
☑ Thumbnail
☑ Chapter markers
```

---

# 39. Chapter Support

When source supports chapters:

```text
00:00 Introduction
04:15 Setup
10:22 Main Topic
19:40 Conclusion
```

Store/embed chapter markers when supported by selected output format.

---

# 40. Post-processing Pipeline

The application should distinguish download from processing.

```text
Source
 ↓
Download
 ↓
Validate
 ↓
Merge streams
 ↓
Convert if requested
 ↓
Embed metadata
 ↓
Embed subtitles
 ↓
Rename
 ↓
Move to destination
 ↓
Completed
```

FFmpeg should be invoked when required for stream merging or media processing. The current project documentation explicitly identifies FFmpeg as a prerequisite and notes its role in merging audio/video streams. 

---

# 41. Dependency Management

Required dependencies:

```text
Node.js
yt-dlp
FFmpeg
```

The current starter project expects Node.js 20+, `yt-dlp`, and FFmpeg, with binaries placed in `bin/` or available on PATH. 

### Production requirement

The released application should ideally:

```text
First launch
   ↓
Dependency check
   ↓
yt-dlp installed?
   ├─ Yes → continue
   └─ No → setup flow
   ↓
FFmpeg installed?
   ├─ Yes → continue
   └─ No → setup flow
```

The application should display exact executable versions and compatibility status.

---

# 42. Settings

## General

```text
Start application with Windows
Minimize to tray
Show notifications
Confirm before deleting
Confirm before canceling
```

## Downloads

```text
Default folder
Concurrent downloads
Auto-start queue
Auto retry
Retry count
Auto rename duplicates
```

## Video

```text
Default quality
Default container
Prefer H.264
Prefer MP4
Prefer best available
```

## Audio

```text
Default format
Default bitrate
```

## Subtitles

```text
Preferred languages
Download subtitles
Embed subtitles
```

## Advanced

```text
Custom yt-dlp arguments
Custom FFmpeg arguments
Proxy
Cookies
Network timeout
Rate limit
```

Advanced command arguments should be clearly marked as expert settings.

---

# 43. Bandwidth Controls

Allow:

```text
Unlimited
1 MB/s
2 MB/s
5 MB/s
10 MB/s
Custom
```

Potential global limit:

```text
Maximum total bandwidth
```

---

# 44. Scheduling

Future feature:

```text
Download at:
[ 11:30 PM ]

On:
☑ Monday
☑ Tuesday
☐ Wednesday
...
```

Queue can wait until scheduled time.

---

# 45. Notifications

Windows notifications:

### Completed

```text
Download completed
"Video Title" is ready.
```

### Failed

```text
Download failed
Open the app to retry.
```

### Queue completed

```text
All downloads completed
12 files downloaded.
```

---

# 46. System Tray

Tray menu:

```text
Media Downloader
────────────
3 Downloads Active
────────────
Pause All
Resume All
Open App
Open Downloads
Settings
Exit
```

---

# 47. Dark Mode

Themes:

```text
System
Light
Dark
```

Dark mode should cover:

* application background
* dialogs
* queue rows
* menus
* settings
* notifications inside application

---

# 48. Accessibility

Requirements:

* keyboard navigation
* visible focus
* scalable UI text
* adequate contrast
* descriptive tooltips
* screen-reader-compatible controls
* no color-only status indicators

Example:

```text
Downloading
[icon] + "Downloading"
```

rather than color alone.

---

# 49. Keyboard Shortcuts

| Shortcut     | Action          |
| ------------ | --------------- |
| Ctrl+V       | Paste URL       |
| Ctrl+N       | New download    |
| Ctrl+F       | Search          |
| Ctrl+,       | Settings        |
| Space        | Pause/Resume    |
| Delete       | Remove selected |
| Ctrl+A       | Select all      |
| Ctrl+Shift+P | Pause all       |
| Ctrl+Shift+R | Resume all      |

---

# 50. Error Handling

Every error should have:

```text
Human-readable message
Technical reason
Suggested action
Retry capability
Diagnostic ID
```

Example:

```text
Download failed

The source could not be accessed.

Possible causes:
• Network connection
• Source unavailable
• URL expired

[Retry] [View Details]
```

---

# 51. Logging

Local logs:

```text
logs/
  app.log
  downloads.log
  errors.log
```

Do not put sensitive credentials into logs.

Provide:

```text
Tools → Diagnostics → Open Logs
```

---

# 52. Privacy

Default position:

* no mandatory account
* no cloud media upload
* no server-side media processing
* local history
* local settings

The existing project direction explicitly specifies no account, server proxy, cloud storage, or remote copy of media. 

Optional telemetry, if implemented:

```text
☐ Help improve the application by sending anonymous diagnostics
```

Must be opt-in.

---

# 53. Security

Electron security requirements:

```text
contextIsolation: true
nodeIntegration: false
sandbox: true where practical
preload-only IPC
validate all IPC input
```

Never execute arbitrary user-provided shell commands through renderer code.

Use an allowlisted IPC API:

```text
download.start()
download.pause()
download.resume()
download.cancel()
metadata.fetch()
settings.get()
settings.set()
filesystem.selectFolder()
```

---

# 54. Architecture

```text
┌──────────────────────────────────────────────┐
│                 Electron UI                  │
│                                              │
│  Toolbar                                     │
│  Queue                                       │
│  History                                     │
│  Settings                                    │
└───────────────────┬──────────────────────────┘
                    │
              Secure IPC
                    │
┌───────────────────▼──────────────────────────┐
│             Electron Main Process            │
│                                              │
│ Queue Manager                                │
│ Download Manager                             │
│ Metadata Manager                             │
│ History Manager                              │
│ Settings Manager                             │
│ Notification Manager                        │
│                                              │
└───────┬───────────────────────┬──────────────┘
        │                       │
        ▼                       ▼
     yt-dlp                  FFmpeg
        │                       │
        └───────────┬───────────┘
                    ▼
             Local File System
```

---

# 55. Recommended Repository Structure

```text
youtube-downloader/
│
├── package.json
├── README.md
├── LICENSE
│
├── bin/
│   ├── yt-dlp.exe
│   └── ffmpeg.exe
│
├── src/
│   ├── main/
│   │   ├── main.js
│   │   ├── downloader.js
│   │   ├── queue.js
│   │   ├── metadata.js
│   │   ├── history.js
│   │   ├── settings.js
│   │   ├── ffmpeg.js
│   │   └── notifications.js
│   │
│   ├── preload/
│   │   └── preload.js
│   │
│   └── renderer/
│       ├── index.html
│       ├── app.js
│       ├── styles.css
│       ├── components/
│       │   ├── toolbar.js
│       │   ├── queue.js
│       │   ├── dialogs.js
│       │   └── settings.js
│       └── assets/
│
├── data/
│   ├── settings.json
│   └── history.db
│
└── build/
```

---

# 56. Data Model

## DownloadItem

```json
{
  "id": "uuid",
  "url": "string",
  "title": "string",
  "thumbnail": "string",
  "uploader": "string",
  "duration": 1234,
  "type": "video",
  "format": "mp4",
  "quality": "1080p",
  "status": "downloading",
  "progress": 74.2,
  "speed": 3420000,
  "eta": 132,
  "outputPath": "string",
  "fileSize": 123456789,
  "createdAt": "ISO date",
  "completedAt": null,
  "error": null
}
```

---

# 57. Queue Manager

Responsibilities:

```text
Add item
Remove item
Prioritize
Pause
Resume
Cancel
Retry
Start next
Concurrency control
Persist queue
Restore queue after restart
```

Priority levels:

```text
Low
Normal
High
```

Potential future drag-and-drop queue ordering.

---

# 58. Application Startup

```text
Launch
 ↓
Load settings
 ↓
Check dependencies
 ↓
Open database/history
 ↓
Restore incomplete queue
 ↓
Validate incomplete jobs
 ↓
Show main window
```

Prompt:

```text
3 downloads were interrupted.

[Resume All] [Review] [Discard]
```

---

# 59. Database

Recommended:

```text
SQLite
```

Tables:

```text
downloads
download_events
settings
queue
subtitles
playlists
```

For a small MVP, JSON can be used temporarily, but SQLite is strongly preferred for production.

---

# 60. Update System

Application updates:

```text
Current version: 1.4.2
New version: 1.5.0

[Download Update]
```

Also consider independently updating:

```text
yt-dlp
FFmpeg
```

Dependency updates should be validated before replacing active binaries.

---

# 61. Installer

Windows installer requirements:

```text
Setup.exe
```

Installer options:

```text
Install for current user
Install for all users
Create desktop shortcut
Create Start Menu shortcut
Launch after install
```

Production release should use a **signed Windows installer**. This is also identified as a production requirement in the starter project's product direction. 

---

# 62. Auto-start

Optional:

```text
Start with Windows
```

Should not automatically begin downloads unless the user explicitly enabled that behavior.

---

# 63. Performance Requirements

Target:

```text
Startup: < 3 seconds on typical modern PC
Idle RAM: < 200 MB
Queue interaction: < 100 ms UI response
```

The UI must remain responsive during large downloads.

All long-running operations must execute outside the renderer's main UI flow.

---

# 64. Reliability Requirements

Application should survive:

* network interruption
* source timeout
* application restart
* computer restart
* partial download
* unavailable disk
* permission error
* insufficient disk space
* FFmpeg failure
* yt-dlp failure

---

# 65. Disk Space Management

Before starting:

```text
Required: 1.3 GB
Available: 4.8 GB

✓ Enough space
```

Failure:

```text
Not enough disk space.
Required: 2.4 GB
Available: 480 MB
```

The starter project itself identifies disk-space checks as a production enhancement. 

---

# 66. Network Requirements

Support:

```text
HTTPS
IPv4
IPv6 where available
```

Configurable:

```text
Timeout
Retries
Rate limit
Proxy
```

The downloader must never expose authentication cookies, tokens or sensitive headers through logs or UI diagnostics.

---

# 67. Platform Adapter Architecture

Do not tightly couple business logic to YouTube.

Recommended:

```text
Extractor Interface
       │
       ├── YouTube Adapter
       ├── Platform Adapter
       └── Future Adapter
```

Conceptually:

```javascript
extractor.detect(url)
extractor.getMetadata(url)
extractor.getFormats(url)
extractor.download(options)
```

The underlying extraction engine can determine platform support.

The current project uses yt-dlp for metadata and download operations. 

---

# 68. Analytics

Default:

```text
No personal analytics
```

Optional anonymous product analytics:

```text
App version
OS version
Feature usage counts
Crash reports
```

Never collect:

```text
Downloaded media
Private URLs
Cookies
Authentication tokens
File contents
```

Provide opt-out/opt-in clearly.

---

# 69. Monetization

Recommended product model:

## Free

```text
Unlimited local downloads
Core formats
Queue
History
Basic settings
```

## Pro

Potential features:

```text
Advanced scheduler
More concurrency
Advanced format selection
Playlist management
Smart organization
Advanced automation
Priority updates
```

Do not artificially restrict basic local functionality merely to force upgrades.

---

# 70. Product Tiers

Example:

### Free

₹0

### Pro

₹799/year

### Lifetime

₹2,499 one-time

Pricing is a product strategy placeholder and should be validated against market demand and actual operating costs.

---

# 71. MVP Scope

The first release should contain:

### Must have

* URL paste
* URL analysis
* metadata extraction
* quality selection
* format selection
* video download
* audio download
* queue
* progress
* pause
* resume where supported
* cancel
* retry
* download folder
* history
* search
* settings
* FFmpeg integration
* yt-dlp integration
* Windows installer

### MVP success condition

A user can go from URL to successfully saved permitted media in under one minute without reading documentation.

---

# 72. Version 1.1

Add:

* persistent SQLite queue
* duplicate detection
* playlist selection
* subtitle support
* metadata embedding
* system notifications
* tray mode
* dark mode
* improved retry logic

---

# 73. Version 1.2

Add:

* scheduler
* bandwidth limiting
* filename templates
* advanced format picker
* queue priorities
* drag-and-drop
* bulk URL import
* download folders per category

---

# 74. Version 2.0

Add:

* multiple platform adapters
* subscription/channel workflows
* automation
* richer download rules
* smart media organization
* advanced diagnostics
* optional Pro licensing

---

# 75. User Stories

### URL download

> As a user, I want to paste a URL so that I can download permitted media.

Acceptance:

```text
Given a valid supported URL
When I paste it
Then metadata is displayed
```

### Quality

> As a user, I want to select quality before starting a download.

Acceptance:

```text
Only formats reported as available are shown.
```

### Queue

> As a user, I want to queue multiple downloads.

Acceptance:

```text
Downloads beyond concurrency limit remain queued.
```

### Resume

> As a user, I want interrupted downloads to resume where technically supported.

Acceptance:

```text
Restarting the app preserves recoverable queued/in-progress jobs.
```

### History

> As a user, I want to see everything I downloaded previously.

Acceptance:

```text
Completed downloads appear in persistent history.
```

---

# 76. Functional Requirements Matrix

| ID     | Requirement                     | Priority |
| ------ | ------------------------------- | -------- |
| FR-001 | Paste URL                       | P0       |
| FR-002 | Analyze URL                     | P0       |
| FR-003 | Fetch metadata                  | P0       |
| FR-004 | Select video quality            | P0       |
| FR-005 | Select format                   | P0       |
| FR-006 | Download video                  | P0       |
| FR-007 | Download audio                  | P0       |
| FR-008 | Queue management                | P0       |
| FR-009 | Progress reporting              | P0       |
| FR-010 | Pause/resume                    | P0       |
| FR-011 | Cancel                          | P0       |
| FR-012 | Retry                           | P0       |
| FR-013 | Output directory                | P0       |
| FR-014 | History                         | P0       |
| FR-015 | Settings                        | P0       |
| FR-016 | FFmpeg processing               | P0       |
| FR-017 | Playlist selection              | P1       |
| FR-018 | Subtitles                       | P1       |
| FR-019 | Notifications                   | P1       |
| FR-020 | Scheduler                       | P2       |
| FR-021 | Channel/subscription management | P2       |
| FR-022 | Multi-platform adapters         | P2       |

---

# 77. Non-Functional Requirements

| Category        | Requirement                            |
| --------------- | -------------------------------------- |
| Performance     | UI remains responsive during downloads |
| Reliability     | Recover interrupted jobs               |
| Security        | Secure Electron IPC                    |
| Privacy         | Local-first by default                 |
| Accessibility   | Keyboard navigation                    |
| Scalability     | 10+ concurrent queue items             |
| Maintainability | Modular services                       |
| Observability   | Structured local logs                  |
| Compatibility   | Windows 10/11                          |
| Updatability    | Signed application updates             |

---

# 78. QA Test Plan

## Functional

Test:

```text
Valid URL
Invalid URL
Empty URL
Playlist
Duplicate file
Audio
Video
Multiple downloads
Pause
Resume
Cancel
Retry
Restart application
No internet
Low disk space
FFmpeg missing
yt-dlp missing
Permission denied
```

## UI

Test:

```text
Window resizing
Dark mode
High DPI
Keyboard navigation
Long titles
Long filenames
Very large queue
```

## Recovery

Test:

```text
PC restart
Network disconnect
Network reconnect
Application crash
Partial file
Disk full
```

---

# 79. Security Test Plan

Check:

```text
IPC injection
Path traversal
Malicious filenames
Malformed URLs
Invalid output paths
Renderer privilege escalation
Untrusted metadata
Command injection
```

Critical requirement:

**Never concatenate untrusted URL/file data into shell commands without safe argument handling.**

---

# 80. Definition of Done

A feature is complete when:

```text
✓ Functional
✓ Unit tested
✓ Integration tested
✓ Error states handled
✓ UI responsive
✓ Accessibility reviewed
✓ Security reviewed
✓ Logging implemented
✓ Documentation updated
✓ Windows tested
```

---

# 81. Development Phases

## Phase 1 — Foundation

```text
Electron shell
UI
IPC
yt-dlp integration
FFmpeg integration
Settings
```

## Phase 2 — Downloader

```text
Metadata
Download engine
Progress
Queue
Pause/resume
Retry
History
```

## Phase 3 — Advanced

```text
Playlist
Subtitles
Audio extraction
Templates
Scheduler
Notifications
Tray
```

## Phase 4 — Production

```text
Installer
Code signing
Updater
Crash handling
Performance optimization
QA
Privacy
Licensing
```

---

# 82. Developer Deliverables

Developer must deliver:

```text
Source code
package.json
build configuration
Electron application
Windows installer
yt-dlp integration
FFmpeg integration
database migrations
README
architecture documentation
test suite
release instructions
```

The current starter already provides installation/build commands using `npm install`, `npm start`, and `npm run build:win`. 

---

# 83. Recommended Technology Stack

### Frontend

```text
Electron
HTML
CSS
JavaScript / TypeScript
```

For a larger production codebase:

```text
React + TypeScript
```

### Desktop

```text
Electron
```

### Download engine

```text
yt-dlp
```

### Media processing

```text
FFmpeg
```

### Database

```text
SQLite
```

### Build

```text
electron-builder
```

### Testing

```text
Vitest / Jest
Playwright
```

---

# 84. Recommended Production Architecture

```text
                    ┌───────────────────┐
                    │      Renderer     │
                    │ React + TS        │
                    └─────────┬─────────┘
                              │
                         Secure IPC
                              │
                    ┌─────────▼─────────┐
                    │ Electron Main     │
                    │                   │
                    │ Queue Service     │
                    │ Download Service  │
                    │ Metadata Service  │
                    │ History Service   │
                    │ Settings Service  │
                    └──────┬──────┬─────┘
                           │      │
                    ┌──────▼─┐  ┌─▼──────┐
                    │ yt-dlp │  │ FFmpeg │
                    └──────┬─┘  └─┬──────┘
                           │      │
                           └──┬───┘
                              ▼
                         Local Storage
                              │
                              ▼
                           SQLite
```

---

# 85. UI Screens Required

The complete application should have at least these screens/views:

```text
01. Main Dashboard
02. Add Download
03. Format Selector
04. Playlist Selector
05. Download Details
06. Active Downloads
07. Completed Downloads
08. Failed Downloads
09. Download History
10. Settings
11. Advanced Settings
12. Diagnostics
13. About
14. First-run Setup
15. Update Dialog
```

---

# 86. Main Dashboard Target

The final dashboard should approximately follow this structure:

```text
┌──────────────────────────────────────────────────────────────┐
│ ▶ Media Downloader                         ─ □ ×             │
├──────────────────────────────────────────────────────────────┤
│ File   Edit   View   Tools   Help                            │
├──────────────────────────────────────────────────────────────┤
│ [ Paste Link ]  Download ▼  Quality ▼  Format ▼  Save ▼  ⚙ │
├──────────────────────────────────────────────────────────────┤
│ All │ Video │ Audio │ Playlists │ Channels │ Completed  🔍  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ [thumb] Video 1                                  ↓  ⋮        │
│        1080p • MP4 • 400 MB                                  │
│                                                              │
│ [thumb] Video 2                                  ↓  ⋮        │
│        720p • MP4 • 220 MB                                   │
│                                                              │
│ [thumb] Video 3                                  ↓  ⋮        │
│        1080p • MP4 • 510 MB                                  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ 3 downloads in progress                                     │
│ 12.4 MB/s • 2 minutes remaining              [ Pause All ]  │
└──────────────────────────────────────────────────────────────┘
```

This preserves the interaction model of the supplied reference while giving the application its own identity.

---

# 87. First-Run Experience

First launch:

```text
Welcome to Media Downloader

1. Select Downloads folder
2. Check yt-dlp
3. Check FFmpeg
4. Choose default quality
5. Choose theme
6. Confirm usage permissions

[Finish]
```

---

# 88. Permission / Responsible-Use Confirmation

First-run screen:

```text
Please confirm:

☑ I will use this application only for media I own,
  am authorized to download, or whose license/platform
  rules explicitly permit downloading.

[Continue]
```

This aligns with the current project's stated usage policy. 

---

# 89. Acceptance Criteria for Final Product

The production application will be accepted only when a tester can:

```text
1. Install application
2. Launch application
3. Paste a permitted supported URL
4. Analyze metadata
5. Select quality
6. Select format
7. Select destination
8. Add to queue
9. Download
10. Observe real-time progress
11. Pause/resume where supported
12. Complete download
13. Open resulting file
14. Close and reopen application
15. See download in history
```

And:

```text
No renderer freeze
No credential leakage
No command injection
No corrupted successful downloads caused by application logic
```

---

# 90. Final Product Definition

The final product should not simply be a “URL downloader.”

It should be positioned technically as:

> **A professional local-first desktop media download manager with queue management, format control, metadata handling, media processing, history, automation and recovery.**

The current starter is a foundation for exactly this direction: Windows-style UI, queue, video/audio modes, quality selection, history, settings and output-folder selection, with yt-dlp/FFmpeg providing the underlying media functionality. 

### Recommended development priority

**MVP → Queue reliability → Playlist/subtitles → Advanced controls → Scheduler/automation → Multi-platform architecture → Pro features.**

This PRD is suitable as the **master product specification for the developer/design team** and can be used to break the project into UI tickets, backend/main-process tickets, QA cases, and release milestones.
