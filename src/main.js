const { app, BrowserWindow, ipcMain, dialog, shell, Notification, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const crypto = require('crypto');

// ─── Paths ────────────────────────────────────────────────────────────────────
const DATA_DIR = path.join(app.getPath('userData'), 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const QUEUE_FILE = path.join(DATA_DIR, 'queue.json');
const LOG_DIR = path.join(app.getPath('userData'), 'logs');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(LOG_DIR, { recursive: true });

// ─── Logger ───────────────────────────────────────────────────────────────────
function log(level, msg) {
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${msg}\n`;
  fs.appendFileSync(path.join(LOG_DIR, 'app.log'), line);
}

// ─── Settings ─────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  outputDir: app.getPath('downloads'),
  maxConcurrent: 3,
  preferredContainer: 'mp4',
  preferredQuality: '1080',
  preferredAudioFormat: 'mp3',
  theme: 'dark',
  autoStart: true,
  showNotifications: true,
  autoRetry: true,
  retryCount: 3,
  retryDelay: 10,
  downloadSubtitles: false,
  embedMetadata: true,
  embedThumbnail: false,
  filenameTemplate: '%(title).180B [%(id)s].%(ext)s',
  rateLimitMbps: 0,
  proxy: '',
  minimizeToTray: false,
  startWithSystem: false,
  confirmDelete: true,
  confirmCancel: true,
  firstRunComplete: false,
  windowBounds: null,
  cookiesFromBrowser: 'none',
  subtitleLangs: 'en',
  folderTemplate: '',
};

function loadSettings() {
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { return { ...DEFAULT_SETTINGS }; }
}

function saveSettings(s) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(s, null, 2));
}

let settings = loadSettings();

// ─── History ──────────────────────────────────────────────────────────────────
function loadHistory() {
  try { return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')); }
  catch { return []; }
}

function saveHistory(h) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(h.slice(0, 2000), null, 2));
}

let history = loadHistory();

// ─── Binary Locator ───────────────────────────────────────────────────────────
function locateBinary(name) {
  const exe = process.platform === 'win32' ? `${name}.exe` : name;
  const home = process.env.HOME || process.env.USERPROFILE || '';
  const candidates = [
    path.join(process.resourcesPath || '', 'bin', exe),
    path.join(__dirname, '..', 'bin', exe),
    path.join(home, '.local', 'bin', exe),
    path.join('/usr', 'local', 'bin', exe),
    path.join('/usr', 'bin', exe),
    exe,
  ];
  return candidates.find(p => p === exe || fs.existsSync(p)) || exe;
}

async function checkBinary(name) {
  return new Promise(resolve => {
    const bin = locateBinary(name);
    const args = name === 'ffmpeg' ? ['-version'] : ['--version'];
    const proc = spawn(bin, args, { windowsHide: true });
    let out = '';
    proc.stdout?.on('data', d => out += d.toString());
    proc.stderr?.on('data', d => out += d.toString());
    proc.on('close', code => resolve({ found: code === 0, path: bin, version: out.split('\n')[0] || '' }));
    proc.on('error', () => resolve({ found: false, path: bin, version: '' }));
  });
}

// ─── Job Queue ────────────────────────────────────────────────────────────────
const activeJobs = new Map(); // id -> { proc, paused }
let downloadQueue = []; // ordered list of pending items

function loadQueue() {
  try { return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8')); }
  catch { return []; }
}

function persistQueue() {
  const safe = downloadQueue.filter(i => ['queued', 'paused', 'downloading'].includes(i.status))
    .map(i => ({ ...i, status: i.status === 'downloading' ? 'queued' : i.status, progress: i.status === 'downloading' ? 0 : i.progress }));
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(safe, null, 2));
}

// ─── Windows ──────────────────────────────────────────────────────────────────
let mainWindow;
let tray;

function emit(channel, data) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send(channel, data);
}

function createWindow() {
  const b = settings.windowBounds;
  const validBounds = b && Number.isFinite(b.width) && Number.isFinite(b.height) && b.width >= 1000 && b.height >= 650;
  mainWindow = new BrowserWindow({
    width: validBounds ? b.width : 1480,
    height: validBounds ? b.height : 920,
    x: validBounds && Number.isFinite(b.x) ? b.x : undefined,
    y: validBounds && Number.isFinite(b.y) ? b.y : undefined,
    minWidth: 1100,
    minHeight: 680,
    frame: false,
    backgroundColor: '#0f0f13',
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('close', e => {
    if (settings.minimizeToTray && tray) {
      e.preventDefault();
      mainWindow.hide();
    } else {
      saveWindowBounds();
      persistQueue();
    }
  });
}

function saveWindowBounds() {
  try {
    if (!mainWindow || mainWindow.isDestroyed() || mainWindow.isMinimized()) return;
    settings.windowBounds = mainWindow.getBounds();
    saveSettings(settings);
  } catch {}
}

function createTray() {
  try {
    const iconPath = path.join(__dirname, '..', 'assets', 'icon.png');
    const icon = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty();
    tray = new Tray(icon.resize({ width: 16, height: 16 }));
    tray.setToolTip('Syvo Downloader');
    updateTrayMenu();
    tray.on('double-click', () => { mainWindow?.show(); });
  } catch(e) { log('warn', 'Tray failed: ' + e.message); }
}

function updateTrayMenu() {
  if (!tray) return;
  const active = downloadQueue.filter(i => i.status === 'downloading').length;
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Syvo Downloader', enabled: false },
    { type: 'separator' },
    { label: `${active} download${active === 1 ? '' : 's'} active`, enabled: false },
    { type: 'separator' },
    { label: 'Pause All', click: () => pauseAll() },
    { label: 'Resume All', click: () => resumeAll() },
    { label: 'Open App', click: () => mainWindow?.show() },
    { label: 'Settings', click: () => { mainWindow?.show(); emit('open-settings', {}); } },
    { type: 'separator' },
    { label: 'Exit', click: () => { persistQueue(); app.quit(); } }
  ]));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
function cookieArgs() {
  return settings.cookiesFromBrowser && settings.cookiesFromBrowser !== 'none'
    ? ['--cookies-from-browser', settings.cookiesFromBrowser]
    : [];
}

async function inspectUrl(url, forceSingle = false) {
  return new Promise((resolve, reject) => {
    if (!/^https?:\/\//i.test(url.trim())) return reject(new Error('Please enter a valid URL starting with http:// or https://'));
    const yt = locateBinary('yt-dlp');
    const args = ['--dump-single-json', '--no-warnings', '--skip-download', ...cookieArgs()];
    // Only force single-video mode when explicitly asked; otherwise let yt-dlp
    // auto-detect, which correctly resolves playlist/mix URLs (its own default
    // favors the playlist when a URL refers to both a video and a playlist).
    if (forceSingle) args.push('--no-playlist');
    args.push(url.trim());
    const proc = spawn(yt, args, { windowsHide: true });
    let out = '', err = '';
    proc.stdout.on('data', d => out += d.toString());
    proc.stderr.on('data', d => err += d.toString());
    proc.on('error', e => reject(new Error(`Cannot start yt-dlp. Is it installed?\n${e.message}`)));
    proc.on('close', code => {
      if (code !== 0) {
        const msg = err.trim();
        if (/private/i.test(msg)) return reject(new Error('This content is private or requires authentication.'));
        if (/not.*support/i.test(msg)) return reject(new Error('This URL is not supported.'));
        if (/unavailable/i.test(msg)) return reject(new Error('This content is unavailable.'));
        return reject(new Error(msg || `Metadata lookup failed (exit ${code}).`));
      }
      try {
        const data = JSON.parse(out);
        const isPlaylistResult = data._type === 'playlist' || Array.isArray(data.entries);
        if (isPlaylistResult) {
          return resolve({
            isPlaylist: true,
            playlistTitle: data.title || 'Playlist',
            playlistId: data.id || '',
            uploader: data.uploader || data.channel || '',
            entries: (data.entries || []).map((e, i) => ({
              index: i + 1,
              id: e?.id || String(i),
              title: e?.title || `Video ${i + 1}`,
              duration: e?.duration || 0,
              thumbnail: e?.thumbnail || null,
              url: e?.webpage_url || e?.url || url,
              uploader: e?.uploader || data.uploader || '',
            }))
          });
        }
        resolve({
          isPlaylist: false,
          id: data.id,
          title: data.title || 'Untitled',
          uploader: data.uploader || data.channel || 'Unknown',
          duration: data.duration || 0,
          thumbnail: data.thumbnail || null,
          webpageUrl: data.webpage_url || url,
          extractor: data.extractor_key || data.extractor || 'unknown',
          description: (data.description || '').slice(0, 500),
          viewCount: data.view_count || 0,
          likeCount: data.like_count || 0,
          uploadDate: data.upload_date || null,
          formats: (data.formats || [])
            .filter(f => f.vcodec !== 'none' || f.acodec !== 'none')
            .slice(-60)
            .map(f => ({
              format_id: f.format_id,
              ext: f.ext,
              resolution: f.resolution,
              height: f.height,
              fps: f.fps,
              acodec: f.acodec,
              vcodec: f.vcodec,
              filesize: f.filesize || f.filesize_approx,
              abr: f.abr,
              tbr: f.tbr,
              note: f.format_note,
            })),
          chapters: data.chapters || [],
          subtitles: Object.keys(data.subtitles || {}),
          automaticCaptions: Object.keys(data.automatic_captions || {}),
        });
      } catch (e) {
        reject(new Error('Could not parse media metadata.'));
      }
    });
  });
}

function parseHumanSize(str) {
  if (!str) return 0;
  const m = String(str).trim().match(/^([\d.]+)\s*([KMGT]i?B)$/i);
  if (!m) return 0;
  const mult = { B: 1, KB: 1024, KIB: 1024, MB: 1024 ** 2, MIB: 1024 ** 2, GB: 1024 ** 3, GIB: 1024 ** 3, TB: 1024 ** 4, TIB: 1024 ** 4 }[m[2].toUpperCase()] || 1;
  return Math.round(parseFloat(m[1]) * mult);
}

// ─── Download Engine ──────────────────────────────────────────────────────────
function buildFormatStr(mode, quality, hasFfmpeg, container) {
  if (mode === 'audio') return 'bestaudio/best';
  const h = parseInt(quality) || 1080;
  if (hasFfmpeg) {
    if (container === 'mov') {
      // MOV's muxer only reliably stream-copies H.264 video + AAC audio. Filtering by container
      // extension (ext=mp4) isn't enough — some "mp4" formats are actually AV1 or VP9 (yt-dlp's
      // default codec-preference sort can pick those over H.264 even within mp4-labeled options),
      // and remuxing those into MOV fails with "Error opening output files: Invalid argument".
      // Filter on the real codec instead, and never fall back to an incompatible one.
      return `bestvideo[height<=${h}][vcodec^=avc1]+bestaudio[acodec^=mp4a]/bestvideo[vcodec^=avc1]+bestaudio[acodec^=mp4a]/best[vcodec^=avc1][acodec^=mp4a]`;
    }
    return `bestvideo[height<=${h}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${h}]+bestaudio/best[height<=${h}]/best`;
  }
  // No ffmpeg — download best pre-merged mp4 only
  return `best[height<=${h}][ext=mp4]/best[height<=${h}]/best`;
}

function resolveFolderTemplate(vars = {}) {
  if (!settings.folderTemplate) return '';
  const now = new Date();
  const safe = s => String(s || '').replace(/[\\/:*?"<>|]/g, '_').trim() || 'Unknown';
  return settings.folderTemplate
    .replace(/\{uploader\}/gi, safe(vars.uploader))
    .replace(/\{year\}/gi, String(now.getFullYear()))
    .replace(/\{month\}/gi, String(now.getMonth() + 1).padStart(2, '0'))
    .replace(/\{mode\}/gi, safe(vars.mode))
    .split('/').filter(Boolean).join(path.sep);
}

function computeOutputPath(title, ext, uploader) {
  const template = settings.filenameTemplate || '%(title).180B [%(id)s].%(ext)s';
  const safeTitle = String(title || 'download').replace(/[\\/:*?"<>|]/g, '_').slice(0, 180);
  const name = template
    .replace(/%\(title\)\.?\d*[sB]?/g, safeTitle)
    .replace(/%\(ext\)s/g, ext || 'mp4')
    .replace(/%\(id\)s/g, '')
    .replace(/\s*\[\s*\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return path.join(settings.outputDir, resolveFolderTemplate({ uploader }), name);
}

function buildArgs(item) {
  const yt = locateBinary('yt-dlp');
  const ffmpegPath = locateBinary('ffmpeg');
  const hasFfmpeg = fs.existsSync(ffmpegPath);
  let template = settings.filenameTemplate || '%(title).180B [%(id)s].%(ext)s';
  if (item.forceRename) {
    template = template.replace(/(\.%\(ext\)s)$/, ' (%(autonumber)s)$1');
  }
  const folder = resolveFolderTemplate({ uploader: item.uploader, mode: item.mode });
  const output = path.join(settings.outputDir, folder, template);
  const args = [
    '--newline', '--no-warnings', '--progress',
    '-o', output,
    '--restrict-filenames',
    ...cookieArgs(),
  ];
  if (item.forceRename) args.push('--autonumber-start', '1');
  if (item.forceOverwrite) args.push('--force-overwrites');
  if (hasFfmpeg) args.splice(3, 0, '--ffmpeg-location', ffmpegPath);

  // A per-download choice (from the Info dialog) wins when present; otherwise fall back to the
  // matching global Setting, so a toggle in Settings actually takes effect rather than being ignored.
  const wantEmbedMeta = item.embedMetadata !== undefined ? item.embedMetadata : settings.embedMetadata;
  const wantEmbedSubs = item.embedSubs !== undefined ? item.embedSubs : settings.embedSubs;

  if (item.mode === 'audio') {
    args.push('-f', 'bestaudio/best');
    if (hasFfmpeg) {
      const q = item.quality && item.quality !== 'best' ? `${item.quality}K` : '0';
      args.push('-x', '--audio-format', item.audioFormat || settings.preferredAudioFormat || 'mp3', '--audio-quality', q);
      if (wantEmbedMeta) args.push('--add-metadata');
      if (settings.embedThumbnail) args.push('--embed-thumbnail');
    }
  } else {
    const targetContainer = item.container || settings.preferredContainer || 'mp4';
    args.push('-f', buildFormatStr(item.mode, item.quality, hasFfmpeg, targetContainer));
    if (hasFfmpeg) {
      args.push('--merge-output-format', targetContainer);
      if (wantEmbedMeta) args.push('--add-metadata');
    }
  }
  if (item.subtitles) {
    args.push('--write-subs');
    if (item.autoSubtitles) args.push('--write-auto-subs');
    args.push('--sub-langs', item.subLangs || settings.subtitleLangs || 'en', '--convert-subs', 'srt');
    if (wantEmbedSubs && hasFfmpeg) args.push('--embed-subs');
  }
  if (item.playlist) args.push('--yes-playlist'); else args.push('--no-playlist');
  if (settings.rateLimitMbps > 0) args.push('-r', `${settings.rateLimitMbps}M`);
  if (settings.proxy) args.push('--proxy', settings.proxy);
  args.push(item.url);
  return { yt, args };
}

async function startDownload(item) {
  return new Promise((resolve) => {
    const { yt, args } = buildArgs(item);
    fs.mkdirSync(settings.outputDir, { recursive: true });

    item.status = 'downloading';
    item.startedAt = Date.now();
    emit('queue:updated', downloadQueue);

    const proc = spawn(yt, args, { windowsHide: true, cwd: settings.outputDir });
    activeJobs.set(item.id, { proc, paused: false });

    let stderr = '';
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.stdout.on('data', data => {
      const text = data.toString();
      for (const line of text.split(/\r?\n/)) {
        const withSize = line.match(/(\d+(?:\.\d+)?)%\s+of\s+~?\s*([\d.]+\s*[KMGT]i?B).*?at\s+([^\s]+).*?ETA\s+([^\s]+)/i);
        const plain = withSize || line.match(/(\d+(?:\.\d+)?)%.*?at\s+([^\s]+).*?ETA\s+([^\s]+)/i);
        if (withSize) {
          item.progress = Number(withSize[1]);
          item.totalBytes = parseHumanSize(withSize[2]);
          item.downloadedBytes = Math.round(item.totalBytes * (item.progress / 100));
          item.speed = withSize[3];
          item.eta = withSize[4];
          emit('queue:updated', downloadQueue);
          updateTrayMenu();
        } else if (plain) {
          item.progress = Number(plain[1]);
          item.speed = plain[2];
          item.eta = plain[3];
          emit('queue:updated', downloadQueue);
          updateTrayMenu();
        }
        const dest = line.match(/Destination:\s+(.+)$/i) || line.match(/Merging formats into:\s+"(.+)"/i);
        if (dest) item.file = dest[1].trim().replace(/^"|"$/g, '');
        if (/has already been downloaded/i.test(line)) {
          item.progress = 100;
          emit('queue:updated', downloadQueue);
        }
        // Status labels
        if (/\[Merger\]/i.test(line)) { item.statusLabel = 'Merging'; emit('queue:updated', downloadQueue); }
        if (/\[ExtractAudio\]/i.test(line)) { item.statusLabel = 'Converting'; emit('queue:updated', downloadQueue); }
        if (/\[EmbedThumbnail\]/i.test(line)) { item.statusLabel = 'Embedding'; emit('queue:updated', downloadQueue); }
      }
    });

    proc.on('error', e => {
      activeJobs.delete(item.id);
      item.status = 'failed';
      item.error = `Cannot run yt-dlp: ${e.message}`;
      item.completedAt = Date.now();
      log('error', `Download failed [${item.id}]: ${e.message}`);
      emit('queue:updated', downloadQueue);
      addToHistory(item);
      sendNotification('Download Failed', `${item.title}: ${item.error}`);
      processQueue();
      resolve();
    });

    proc.on('close', code => {
      activeJobs.delete(item.id);
      item.completedAt = Date.now();
      if (item.status === 'canceled') {
        emit('queue:updated', downloadQueue);
        processQueue();
        resolve();
        return;
      }
      if (code === 0) {
        item.status = 'completed';
        item.progress = 100;
        try { if (item.file && fs.existsSync(item.file)) item.fileSize = fs.statSync(item.file).size; } catch {}
        log('info', `Download completed [${item.id}]: ${item.title}`);
        emit('queue:updated', downloadQueue);
        addToHistory(item);
        if (settings.showNotifications) sendNotification('Download Completed', `"${item.title}" is ready.`);
      } else {
        item.status = 'failed';
        item.error = stderr.trim() || `Process exited with code ${code}.`;
        log('error', `Download failed [${item.id}] code=${code}: ${item.error.slice(0, 200)}`);
        emit('queue:updated', downloadQueue);
        addToHistory(item);
        if (settings.showNotifications) sendNotification('Download Failed', `"${item.title}" failed.`);
        // Auto-retry
        if (settings.autoRetry && (item.retries || 0) < (settings.retryCount || 3)) {
          item.retries = (item.retries || 0) + 1;
          item.status = 'queued';
          item.error = '';
          setTimeout(() => { processQueue(); }, (settings.retryDelay || 10) * 1000);
        }
      }
      updateTrayMenu();
      persistQueue();
      processQueue();
      resolve();
    });
  });
}

function processQueue() {
  const active = downloadQueue.filter(i => i.status === 'downloading').length;
  const limit = settings.maxConcurrent || 3;
  if (active >= limit) return;
  const next = downloadQueue.find(i => i.status === 'queued');
  if (!next) {
    const completed = downloadQueue.filter(i => i.status === 'completed').length;
    const total = downloadQueue.length;
    if (completed === total && total > 0 && settings.showNotifications) {
      sendNotification('All Downloads Completed', `${completed} file${completed === 1 ? '' : 's'} downloaded.`);
    }
    return;
  }
  startDownload(next);
  // Fill more slots
  if (active + 1 < limit) processQueue();
}

function pauseAll() {
  downloadQueue.filter(i => i.status === 'downloading').forEach(i => pauseItem(i.id));
}

function resumeAll() {
  downloadQueue.filter(i => i.status === 'paused').forEach(i => { i.status = 'queued'; });
  emit('queue:updated', downloadQueue);
  processQueue();
}

function pauseItem(id) {
  const item = downloadQueue.find(i => i.id === id);
  if (!item) return;
  const job = activeJobs.get(id);
  if (job?.proc && !job.proc.killed) job.proc.kill('SIGTERM');
  activeJobs.delete(id);
  item.status = 'paused';
  item.progress = 0;
  emit('queue:updated', downloadQueue);
}

function cancelItem(id) {
  const item = downloadQueue.find(i => i.id === id);
  if (!item) return;
  const job = activeJobs.get(id);
  if (job?.proc && !job.proc.killed) job.proc.kill('SIGTERM');
  activeJobs.delete(id);
  item.status = 'canceled';
  emit('queue:updated', downloadQueue);
}

// ─── History ──────────────────────────────────────────────────────────────────
function addToHistory(item) {
  const entry = {
    id: item.id,
    url: item.url,
    title: item.title,
    uploader: item.uploader,
    thumbnail: item.thumbnail,
    downloadDate: new Date().toISOString(),
    status: item.status,
    filePath: item.file || '',
    format: item.container || item.audioFormat || '',
    quality: item.quality || '',
    duration: item.duration || 0,
    mode: item.mode,
    error: item.error || '',
    fileSize: item.fileSize || item.totalBytes || 0,
  };
  history.unshift(entry);
  saveHistory(history);
}

// ─── Notifications ────────────────────────────────────────────────────────────
function sendNotification(title, body) {
  try {
    if (!Notification.isSupported()) return;
    new Notification({ title, body, silent: false }).show();
  } catch(e) { log('warn', 'Notification failed: ' + e.message); }
}

// ─── App Init ─────────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  if (settings.minimizeToTray) createTray();

  // Restore queue
  const savedQueue = loadQueue();
  if (savedQueue.length) {
    downloadQueue = savedQueue.map(i => ({ ...i, status: i.status === 'downloading' ? 'queued' : i.status }));
    if (downloadQueue.length) {
      emit('queue:restored', downloadQueue);
    }
  }

  // ─── IPC Handlers ─────────────────────────────────────────────────────────
  ipcMain.handle('app:get-defaults', () => settings);
  ipcMain.handle('app:get-version', () => app.getVersion());
  ipcMain.handle('app:check-deps', async () => {
    const [ytdlp, ffmpeg] = await Promise.all([checkBinary('yt-dlp'), checkBinary('ffmpeg')]);
    return { ytdlp, ffmpeg };
  });
  ipcMain.handle('app:open-logs', () => shell.openPath(LOG_DIR));

  ipcMain.handle('settings:get', () => settings);
  ipcMain.handle('settings:set', (_e, partial) => {
    settings = { ...settings, ...partial };
    saveSettings(settings);
    if (settings.minimizeToTray && !tray) createTray();
    return settings;
  });
  ipcMain.handle('settings:pick-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory', 'createDirectory'] });
    if (!result.canceled && result.filePaths[0]) settings.outputDir = result.filePaths[0];
    return settings.outputDir;
  });
  ipcMain.handle('settings:reset', () => {
    settings = { ...DEFAULT_SETTINGS, outputDir: app.getPath('downloads') };
    saveSettings(settings);
    return settings;
  });

  ipcMain.handle('media:inspect', (_e, url, forceSingle) => inspectUrl(url, forceSingle));

  ipcMain.handle('queue:get', () => downloadQueue);
  ipcMain.handle('queue:add', (_e, item) => {
    const id = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const newItem = { ...item, id, status: 'queued', progress: 0, speed: '', eta: '', file: null, error: '', retries: 0, addedAt: Date.now() };
    downloadQueue.unshift(newItem);
    emit('queue:updated', downloadQueue);
    persistQueue();
    if (settings.autoStart) processQueue();
    return newItem;
  });
  ipcMain.handle('queue:add-batch', (_e, items) => {
    const added = items.map(item => {
      const id = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      return { ...item, id, status: 'queued', progress: 0, speed: '', eta: '', file: null, error: '', retries: 0, addedAt: Date.now() };
    });
    downloadQueue.unshift(...added);
    emit('queue:updated', downloadQueue);
    persistQueue();
    if (settings.autoStart) processQueue();
    return added;
  });
  ipcMain.handle('queue:start', (_e, id) => {
    const item = downloadQueue.find(i => i.id === id);
    if (item && item.status !== 'downloading') { item.status = 'queued'; processQueue(); emit('queue:updated', downloadQueue); }
    return true;
  });
  ipcMain.handle('queue:pause', (_e, id) => { pauseItem(id); return true; });
  ipcMain.handle('queue:resume', (_e, id) => { const i = downloadQueue.find(x=>x.id===id); if(i){i.status='queued';emit('queue:updated',downloadQueue);processQueue();} return true; });
  ipcMain.handle('queue:cancel', (_e, id) => { cancelItem(id); return true; });
  ipcMain.handle('queue:retry', (_e, id) => {
    const item = downloadQueue.find(i => i.id === id);
    if (item) { item.status = 'queued'; item.error = ''; item.progress = 0; item.retries = 0; emit('queue:updated', downloadQueue); processQueue(); }
    return true;
  });
  ipcMain.handle('queue:remove', (_e, id) => {
    cancelItem(id);
    downloadQueue = downloadQueue.filter(i => i.id !== id);
    emit('queue:updated', downloadQueue);
    persistQueue();
    return true;
  });
  ipcMain.handle('queue:clear-completed', () => {
    downloadQueue = downloadQueue.filter(i => !['completed', 'canceled'].includes(i.status));
    emit('queue:updated', downloadQueue);
    persistQueue();
    return true;
  });
  ipcMain.handle('queue:pause-all', () => { pauseAll(); return true; });
  ipcMain.handle('queue:resume-all', () => { resumeAll(); return true; });
  ipcMain.handle('queue:cancel-all', () => {
    downloadQueue.forEach(i => { if (['queued','downloading','paused'].includes(i.status)) cancelItem(i.id); });
    emit('queue:updated', downloadQueue);
    return true;
  });
  ipcMain.handle('queue:retry-failed', () => {
    downloadQueue.filter(i => i.status === 'failed').forEach(i => { i.status = 'queued'; i.error = ''; i.progress = 0; i.retries = 0; });
    emit('queue:updated', downloadQueue);
    processQueue();
    return true;
  });

  ipcMain.handle('history:get', () => history);
  ipcMain.handle('history:clear', () => { history = []; saveHistory(history); return true; });
  ipcMain.handle('history:remove', (_e, id) => { history = history.filter(h => h.id !== id); saveHistory(history); return true; });
  ipcMain.handle('history:export', async () => {
    const result = await dialog.showSaveDialog(mainWindow, { defaultPath: 'download-history.json', filters: [{ name: 'JSON', extensions: ['json'] }] });
    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, JSON.stringify(history, null, 2));
      return result.filePath;
    }
    return null;
  });

  ipcMain.handle('shell:open-folder', (_e, file) => {
    if (file && fs.existsSync(file)) return shell.showItemInFolder(file);
    return shell.openPath(settings.outputDir);
  });
  ipcMain.handle('shell:open-file', (_e, file) => shell.openPath(file));
  ipcMain.handle('shell:open-downloads', () => shell.openPath(settings.outputDir));

  ipcMain.handle('window:minimize', () => mainWindow?.minimize());
  ipcMain.handle('window:maximize', () => { mainWindow?.isMaximized() ? mainWindow.restore() : mainWindow?.maximize(); });
  ipcMain.handle('window:close', () => {
    if (settings.minimizeToTray && tray) mainWindow?.hide();
    else { persistQueue(); mainWindow?.close(); }
  });

  ipcMain.handle('clipboard:read', async () => {
    const { clipboard } = require('electron');
    return clipboard.readText();
  });

  ipcMain.handle('clipboard:write', (_e, text) => {
    const { clipboard } = require('electron');
    clipboard.writeText(text);
    return true;
  });

  ipcMain.handle('file:import-urls', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Import URLs from text file',
      properties: ['openFile'],
      filters: [{ name: 'Text Files', extensions: ['txt', 'csv'] }, { name: 'All Files', extensions: ['*'] }]
    });
    if (result.canceled || !result.filePaths[0]) return [];
    const content = fs.readFileSync(result.filePaths[0], 'utf8');
    const urls = content.split(/\r?\n/).map(l => l.trim()).filter(l => /^https?:\/\//i.test(l));
    return urls;
  });

  ipcMain.handle('file:check-exists', (_e, title, ext, uploader) => {
    const p = computeOutputPath(title, ext, uploader);
    return { exists: fs.existsSync(p), path: p };
  });

  ipcMain.handle('disk:check', async (_e, neededBytes) => {
    try {
      const stat = fs.statfsSync(settings.outputDir);
      const free = stat.bfree * stat.bsize;
      return { free, enough: free > neededBytes };
    } catch { return { free: -1, enough: true }; }
  });

  ipcMain.handle('queue:move', (_e, id, direction) => {
    const idx = downloadQueue.findIndex(i => i.id === id);
    if (idx < 0) return;
    const to = direction === 'up' ? idx - 1 : idx + 1;
    if (to < 0 || to >= downloadQueue.length) return;
    [downloadQueue[idx], downloadQueue[to]] = [downloadQueue[to], downloadQueue[idx]];
    emit('queue:updated', downloadQueue);
    persistQueue();
  });

  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => {
  saveWindowBounds();
  persistQueue();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => { saveWindowBounds(); persistQueue(); });
