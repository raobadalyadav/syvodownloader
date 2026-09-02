/* ─── State ─────────────────────────────────────────── */
const S = { queue: [], history: [], tab: 'all', search: '', settings: {}, pendingMeta: null, analyzeAbort: false };
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ─── Helpers ───────────────────────────────────────── */
function fmtDur(sec) {
  if (!sec) return '—';
  const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = Math.floor(sec % 60);
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
function pad(n) { return String(n).padStart(2, '0'); }
function fmtSize(b) {
  if (!b) return '—';
  const u = ['B','KB','MB','GB']; let i = 0, n = b;
  while (n >= 1024 && i < 3) { n /= 1024; i++; }
  return `${n.toFixed(i ? 1 : 0)} ${u[i]}`;
}
function esc(v = '') { return String(v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
function fmtDate(iso) { if (!iso) return '—'; try { return new Date(iso).toLocaleDateString(); } catch { return iso; } }

/* ─── Modal helpers ─────────────────────────────────── */
function openModal(id) { $(id).classList.remove('hidden'); }
function closeModal(id) { $(id).classList.add('hidden'); }
const UNDISMISSABLE = ['analyzingOverlay', 'firstRunModalOverlay', 'dupModalOverlay'];
document.addEventListener('click', e => {
  if (e.target.dataset.close) closeModal('#' + e.target.dataset.close);
  if (e.target.classList.contains('modal-overlay') && !UNDISMISSABLE.includes(e.target.id)) closeModal('#' + e.target.id);
});

/* ─── Menubar dropdowns ─────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') $$('.modal-overlay').forEach(m => { if (!m.classList.contains('hidden') && !UNDISMISSABLE.includes(m.id)) closeModal('#' + m.id); });
  if ((e.ctrlKey || e.metaKey) && e.key === 'v') { e.preventDefault(); showUrlModal(); }
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'n') { e.preventDefault(); showUrlModal(); }
  if ((e.ctrlKey || e.metaKey) && e.key === ',') openSettings();
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') $('#searchInput').focus();
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') { e.preventDefault(); window.api.pauseAll(); }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r') { e.preventDefault(); window.api.resumeAll(); }
});

/* ─── Menu actions ──────────────────────────────────── */
document.querySelectorAll('[data-action]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const a = btn.dataset.action;
    if (a === 'paste-url') showUrlModal();
    else if (a === 'add-playlist') showUrlModal(true);
    else if (a === 'import-file') importUrlsFromFile();
    else if (a === 'open-downloads') window.api.openDownloads();
    else if (a === 'export-history') window.api.exportHistory();
    else if (a === 'quit') window.api.closeWindow();
    else if (a === 'clear-completed') { window.api.clearCompleted(); }
    else if (a === 'retry-failed') window.api.retryFailed();
    else if (a === 'cancel-all') window.api.cancelAll();
    else if (a === 'tab-all') setTab('all');
    else if (a === 'tab-video') setTab('video');
    else if (a === 'tab-audio') setTab('audio');
    else if (a === 'tab-completed') setTab('completed');
    else if (a === 'tab-history') setTab('history');
    else if (a === 'open-settings') openSettings();
    else if (a === 'check-deps') { openSettings(); activateSettingsSection('advanced'); }
    else if (a === 'open-logs') window.api.openLogs();
    else if (a === 'about') { openSettings(); activateSettingsSection('about'); }
  });
});

/* ─── Titlebar ──────────────────────────────────────── */
$('#btnMin').onclick = () => window.api.minimize();
$('#btnMax').onclick = () => window.api.maximize();
$('#btnClose').onclick = () => window.api.closeWindow();

/* ─── Toolbar ───────────────────────────────────────── */
$('#pasteBtn').onclick = showUrlModal;
$('#emptyAddBtn').onclick = showUrlModal;
$('#settingsBtn').onclick = openSettings;
$('#pathPill').onclick = async () => {
  const p = await window.api.pickFolder();
  if (p) { S.settings.outputDir = p; updatePathLabel(); }
};

/* ─── Tabs ──────────────────────────────────────────── */
$('#tabs').addEventListener('click', e => {
  const t = e.target.closest('.tab');
  if (t) setTab(t.dataset.tab);
});
function setTab(tab) {
  S.tab = tab;
  $$('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  if (tab === 'history') { renderHistory(); $('#queueList').classList.add('hidden'); $('#historyList').classList.remove('hidden'); }
  else { $('#historyList').classList.add('hidden'); $('#queueList').classList.remove('hidden'); renderQueue(); }
}

/* ─── Search ────────────────────────────────────────── */
$('#searchInput').oninput = e => { S.search = e.target.value.toLowerCase(); if (S.tab === 'history') renderHistory(); else renderQueue(); };

/* ─── Toolbar controls ──────────────────────────────── */
$('#pauseAllBtn').onclick = () => window.api.pauseAll();
$('#resumeAllBtn').onclick = () => window.api.resumeAll();
$('#clearCompletedBtn').onclick = () => window.api.clearCompleted();
$('#pauseAllFooter').onclick = () => window.api.pauseAll();
$('#resumeAllFooter').onclick = () => window.api.resumeAll();

/* ─── URL Modal ─────────────────────────────────────── */
function showUrlModal(playlist = false) {
  openModal('#urlModalOverlay');
  if (playlist) $('#dlPlaylist').checked = true;
  setTimeout(() => $('#urlInput').focus(), 100);
}
$('#clipboardBtn').onclick = async () => {
  const text = await window.api.readClipboard();
  if (text) $('#urlInput').value = text.trim();
};
$('#analyzeBtn').onclick = async () => {
  const url = $('#urlInput').value.trim();
  if (!url) return;
  closeModal('#urlModalOverlay');
  S.analyzeAbort = false;
  openModal('#analyzingOverlay');
  try {
    const isPlaylist = $('#dlPlaylist').checked;
    const meta = await window.api.inspect(url, isPlaylist);
    if (S.analyzeAbort) return;
    closeModal('#analyzingOverlay');
    if (meta.isPlaylist) {
      showPlaylistModal(meta, url);
    } else {
      showInfoModal(meta, url);
    }
  } catch (err) {
    closeModal('#analyzingOverlay');
    showError(err.message || 'Failed to analyze URL');
  }
};
$('#cancelAnalyze').onclick = () => { S.analyzeAbort = true; closeModal('#analyzingOverlay'); };

/* ─── Import URLs from file ─────────────────────────── */
$('#importFileBtn').onclick = importUrlsFromFile;
async function importUrlsFromFile() {
  const urls = await window.api.importUrls();
  if (!urls || !urls.length) { toast('warn', 'No valid URLs found in that file.'); return; }
  const mode = $('#modeSelect').value, quality = $('#qualitySelect').value, container = $('#formatSelect').value;
  let added = 0, failed = 0;
  openModal('#analyzingOverlay');
  const items = [];
  for (let i = 0; i < urls.length; i++) {
    $('.analyzing-box p').textContent = `Importing ${i + 1} of ${urls.length}…`;
    if (S.analyzeAbort) break;
    try {
      const meta = await window.api.inspect(urls[i], false);
      if (meta.isPlaylist) { failed++; continue; }
      items.push({ url: urls[i], title: meta.title, thumbnail: meta.thumbnail, uploader: meta.uploader, duration: meta.duration, mode, quality, container, subtitles: false, playlist: false });
      added++;
    } catch { failed++; }
  }
  S.analyzeAbort = false;
  $('.analyzing-box p').textContent = 'Analyzing URL…';
  closeModal('#analyzingOverlay');
  if (items.length) await window.api.addBatch(items);
  toast(failed && !added ? 'error' : failed ? 'warn' : 'success', `${added} added${failed ? `, ${failed} failed` : ''}.`);
}

/* ─── Video Info Modal ──────────────────────────────── */
function showInfoModal(meta, url) {
  S.pendingMeta = { meta, url };
  $('#infoThumb').src = meta.thumbnail || '';
  $('#infoThumb').onerror = () => { $('#infoThumb').style.display = 'none'; };
  $('#infoTitle').textContent = meta.title;
  $('#infoMeta').textContent = `${meta.uploader} · ${fmtDur(meta.duration)} · ${meta.extractor}`;
  const badges = $('#infoBadges');
  badges.innerHTML = '';
  if (meta.subtitles?.length) badges.innerHTML += `<span class="badge">Subs: ${meta.subtitles.slice(0,3).join(', ')}</span>`;
  if (meta.chapters?.length) badges.innerHTML += `<span class="badge">${meta.chapters.length} Chapters</span>`;

  const qs = $('#infoQuality');
  qs.innerHTML = '';
  const heights = [...new Set((meta.formats || []).filter(f => f.height).map(f => f.height))].sort((a,b) => b-a);
  if (heights.length) {
    heights.forEach(h => { const o = document.createElement('option'); o.value = h; o.textContent = `${h}p`; if (h <= 1080) o.selected = true; qs.appendChild(o); });
  } else {
    ['2160','1440','1080','720','480','360'].forEach((h,i) => { const o = document.createElement('option'); o.value = h; o.textContent = `${h}p`; if (i===2) o.selected=true; qs.appendChild(o); });
  }

  // Format table
  const wrap = $('#formatTableInner');
  if (meta.formats?.length) {
    wrap.innerHTML = `<table class="format-table"><thead><tr><th>ID</th><th>Ext</th><th>Resolution</th><th>FPS</th><th>VCodec</th><th>ACodec</th><th>Size</th></tr></thead><tbody>${
      meta.formats.slice(-30).reverse().map(f => `<tr><td>${esc(f.format_id)}</td><td>${esc(f.ext)}</td><td>${esc(f.resolution||'audio')}</td><td>${f.fps||'—'}</td><td>${esc((f.vcodec||'—').split('.')[0])}</td><td>${esc((f.acodec||'—').split('.')[0])}</td><td>${fmtSize(f.filesize)}</td></tr>`).join('')
    }</tbody></table>`;
  }
  openModal('#infoModalOverlay');
}

$('#toggleFormats').onclick = () => {
  const inner = $('#formatTableInner');
  const hidden = inner.classList.toggle('hidden');
  $('#toggleFormats').textContent = hidden ? '▼ Show available formats' : '▲ Hide formats';
};

/* ─── Duplicate detection ────────────────────────────── */
let dupResolver = null;
function askDupAction() {
  return new Promise(resolve => { dupResolver = resolve; openModal('#dupModalOverlay'); });
}
function resolveDup(action) {
  closeModal('#dupModalOverlay');
  if (dupResolver) { dupResolver(action); dupResolver = null; }
}
$('#dupSkip').onclick = () => resolveDup('skip');
$('#dupRename').onclick = () => resolveDup('rename');
$('#dupReplace').onclick = () => resolveDup('replace');
$('#dupDownload').onclick = () => resolveDup('download-anyway');

/* ─── Disk space advisory ────────────────────────────── */
async function warnIfLowDisk(meta, mode, quality) {
  let bytes = 0;
  if (mode === 'audio') {
    bytes = Math.max(...(meta.formats || []).filter(f => f.abr).map(f => f.filesize || 0), 0);
  } else {
    const match = (meta.formats || []).filter(f => f.height && f.height <= +quality).sort((a, b) => b.height - a.height)[0];
    bytes = match?.filesize || 0;
  }
  if (!bytes) return;
  try {
    const { enough, free } = await window.api.checkDisk(bytes);
    if (!enough) toast('warn', `Low disk space: need ~${fmtSize(bytes)}, only ${fmtSize(free)} free.`);
  } catch {}
}

async function queueSingleItem(base) {
  const ext = base.mode === 'audio' ? (S.settings.preferredAudioFormat || 'mp3') : (base.container || 'mp4');
  try {
    const { exists } = await window.api.checkFileExists(base.title, ext);
    if (exists) {
      const action = await askDupAction();
      if (action === 'skip') return;
      if (action === 'rename') base.forceRename = true;
      if (action === 'replace' || action === 'download-anyway') base.forceOverwrite = true;
    }
  } catch {}
  await window.api.addToQueue(base);
  toast('success', `Added "${base.title}" to queue.`);
}

$('#addToQueueBtn').onclick = async () => {
  if (!S.pendingMeta) return;
  const { meta, url } = S.pendingMeta;
  const mode = $('#infoMode').value;
  const quality = $('#infoQuality').value;
  const container = $('#infoFormat').value;
  const subtitles = $('#infoSubs').checked;
  closeModal('#infoModalOverlay');
  warnIfLowDisk(meta, mode, quality);
  await queueSingleItem({ url, title: meta.title, thumbnail: meta.thumbnail, uploader: meta.uploader, duration: meta.duration, mode, quality, container, subtitles, playlist: false });
};

/* ─── Playlist Modal ─────────────────────────────────── */
function showPlaylistModal(data, url) {
  $('#playlistTitle').textContent = esc(data.playlistTitle);
  $('#playlistInfo').textContent = `${data.entries.length} videos · ${data.uploader}`;
  const container = $('#playlistItems');
  container.innerHTML = data.entries.map((e, i) => `
    <div class="pl-item">
      <input type="checkbox" class="pl-check" data-idx="${i}" checked style="accent-color:var(--accent)"/>
      <span class="pl-num">${e.index}</span>
      <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(e.title)}</span>
      <span class="pl-dur">${fmtDur(e.duration)}</span>
    </div>`).join('');
  S.pendingMeta = { data, url };
  $('#selectAll').onchange = e => { $$('.pl-check').forEach(c => c.checked = e.target.checked); };
  openModal('#playlistModalOverlay');
}

$('#downloadPlaylistBtn').onclick = async () => {
  const { data } = S.pendingMeta;
  const mode = $('#plMode').value, quality = $('#plQuality').value, container = $('#plFormat').value;
  const selected = $$('.pl-check').filter(c => c.checked).map(c => data.entries[+c.dataset.idx]);
  if (!selected.length) return;
  const items = selected.map(e => ({ url: e.url, title: e.title, thumbnail: e.thumbnail, uploader: e.uploader, duration: e.duration, mode, quality, container, subtitles: false, playlist: false }));
  await window.api.addBatch(items);
  closeModal('#playlistModalOverlay');
};

/* ─── Settings Modal ────────────────────────────────── */
async function openSettings() {
  const s = await window.api.getSettings();
  S.settings = s;
  $('#sTheme').value = s.theme || 'dark';
  $('#sNotifications').checked = !!s.showNotifications;
  $('#sMinimizeTray').checked = !!s.minimizeToTray;
  $('#sConfirmDelete').checked = !!s.confirmDelete;
  $('#sConfirmCancel').checked = !!s.confirmCancel;
  $('#sFolder').value = s.outputDir || '';
  $('#sConcurrent').value = String(s.maxConcurrent || 3);
  $('#sAutoStart').checked = !!s.autoStart;
  $('#sAutoRetry').checked = !!s.autoRetry;
  $('#sRetryCount').value = String(s.retryCount || 3);
  $('#sTemplate').value = s.filenameTemplate || '';
  $('#sQuality').value = String(s.preferredQuality || '1080');
  $('#sContainer').value = s.preferredContainer || 'mp4';
  $('#sEmbedMeta').checked = !!s.embedMetadata;
  $('#sEmbedThumb').checked = !!s.embedThumbnail;
  $('#sAudioFormat').value = s.preferredAudioFormat || 'mp3';
  $('#sSubtitles').checked = !!s.downloadSubtitles;
  $('#sEmbedSubs').checked = !!s.embedSubs;
  $('#sRateLimit').value = s.rateLimitMbps || 0;
  $('#sProxy').value = s.proxy || '';
  const ver = await window.api.getVersion();
  $('#aboutVersion').textContent = `v${ver}`;
  loadDeps();
  openModal('#settingsModalOverlay');
}

async function loadDeps() {
  const deps = await window.api.checkDeps();
  const row = $('#depRow');
  row.innerHTML = `
    <span class="dep-chip ${deps.ytdlp.found ? 'ok' : 'missing'}">yt-dlp ${deps.ytdlp.found ? '✓' : '✗ Missing'}</span>
    <span class="dep-chip ${deps.ffmpeg.found ? 'ok' : 'missing'}">FFmpeg ${deps.ffmpeg.found ? '✓' : '✗ Missing'}</span>`;
  $('#depsStatus').innerHTML = `
    <div class="dep-item"><span class="${deps.ytdlp.found ? 'dep-ok' : 'dep-fail'}">${deps.ytdlp.found ? '✓' : '✗'}</span> yt-dlp — ${esc(deps.ytdlp.version || 'Not found')}</div>
    <div class="dep-item"><span class="${deps.ffmpeg.found ? 'dep-ok' : 'dep-fail'}">${deps.ffmpeg.found ? '✓' : '✗'}</span> FFmpeg — ${esc(deps.ffmpeg.version || 'Not found')}</div>`;
}

$('#sBrowse').onclick = async () => { const p = await window.api.pickFolder(); if (p) $('#sFolder').value = p; };
$('#sReset').onclick = async () => { const s = await window.api.resetSettings(); S.settings = s; openSettings(); };

$('#settingsNav').addEventListener('click', e => {
  const btn = e.target.closest('.snav-btn');
  if (btn) activateSettingsSection(btn.dataset.section);
});
function activateSettingsSection(sec) {
  $$('.snav-btn').forEach(b => b.classList.toggle('active', b.dataset.section === sec));
  $$('.settings-section').forEach(s => s.classList.toggle('active', s.id === `sec-${sec}`));
}

$('#saveSettingsBtn').onclick = async () => {
  const s = {
    theme: $('#sTheme').value,
    showNotifications: $('#sNotifications').checked,
    minimizeToTray: $('#sMinimizeTray').checked,
    confirmDelete: $('#sConfirmDelete').checked,
    confirmCancel: $('#sConfirmCancel').checked,
    outputDir: $('#sFolder').value,
    maxConcurrent: +$('#sConcurrent').value,
    autoStart: $('#sAutoStart').checked,
    autoRetry: $('#sAutoRetry').checked,
    retryCount: +$('#sRetryCount').value,
    filenameTemplate: $('#sTemplate').value,
    preferredQuality: $('#sQuality').value,
    preferredContainer: $('#sContainer').value,
    embedMetadata: $('#sEmbedMeta').checked,
    embedThumbnail: $('#sEmbedThumb').checked,
    preferredAudioFormat: $('#sAudioFormat').value,
    downloadSubtitles: $('#sSubtitles').checked,
    embedSubs: $('#sEmbedSubs').checked,
    rateLimitMbps: +$('#sRateLimit').value,
    proxy: $('#sProxy').value,
  };
  S.settings = await window.api.setSettings(s);
  applyTheme(s.theme);
  updatePathLabel();
  closeModal('#settingsModalOverlay');
};

function applyTheme(theme) {
  document.body.classList.toggle('light', theme === 'light');
}
function updatePathLabel() {
  const p = S.settings.outputDir || '';
  const parts = p.split(/[\\/]/);
  $('#pathLabel').textContent = parts[parts.length - 1] || 'Downloads';
}

/* ─── Queue Render ──────────────────────────────────── */
function filterQueue() {
  const q = S.search;
  return S.queue.filter(item => {
    const matchTab =
      S.tab === 'all' ||
      (S.tab === 'video' && item.mode === 'video') ||
      (S.tab === 'audio' && item.mode === 'audio') ||
      (S.tab === 'completed' && item.status === 'completed') ||
      (S.tab === 'failed' && item.status === 'failed');
    const matchSearch = !q || (item.title || '').toLowerCase().includes(q) || (item.uploader || '').toLowerCase().includes(q);
    return matchTab && matchSearch;
  });
}

function renderQueue() {
  const items = filterQueue();
  const list = $('#queueList');
  if (!items.length && S.tab !== 'history') {
    list.innerHTML = '';
    $('#emptyState').classList.remove('hidden');
    updateStatusBar();
    updateCount(0);
    return;
  }
  $('#emptyState').classList.add('hidden');
  list.innerHTML = items.map(item => queueItemHTML(item)).join('');
  list.querySelectorAll('.queue-item').forEach(el => bindItemEvents(el));
  updateStatusBar();
  updateCount(items.length);
}

function queueItemHTML(item) {
  const isActive = item.status === 'downloading';
  const isDone = item.status === 'completed';
  const isFailed = item.status === 'failed';
  const isPaused = item.status === 'paused';
  const pct = Math.round(item.progress || 0);
  const fillClass = isDone ? 'done' : isFailed ? 'failed' : '';
  const slClass = `sl-${item.status}`;
  const slLabel = { queued:'Queued', downloading:'Downloading', completed:'Done', failed:'Failed', paused:'Paused', canceled:'Canceled' }[item.status] || item.status;
  return `<div class="queue-item status-${item.status}" data-id="${item.id}">
    ${item.thumbnail ? `<img class="item-thumb" src="${esc(item.thumbnail)}" onerror="this.classList.add('hidden')"/>` : '<div class="item-thumb-placeholder">▶</div>'}
    <div class="item-body">
      <div class="item-title" title="${esc(item.title)}">${esc(item.title)}</div>
      <div class="item-meta">
        ${item.uploader ? `<span>${esc(item.uploader)}</span>` : ''}
        ${item.duration ? `<span>${fmtDur(item.duration)}</span>` : ''}
        ${item.mode === 'audio' ? `<span class="meta-badge">🎵 Audio</span>` : `<span class="meta-badge">🎬 ${item.quality || 'Best'}p</span>`}
        <span class="meta-badge">${(item.container || item.audioFormat || 'mp4').toUpperCase()}</span>
      </div>
      <div class="item-progress-wrap">
        <div class="progress-bar"><div class="progress-fill ${fillClass}" style="width:${pct}%"></div></div>
        <span class="progress-pct">${pct}%</span>
      </div>
      ${isActive ? `<div class="item-sub">${esc(item.speed || '')} ${item.eta ? '· ETA ' + esc(item.eta) : ''} ${item.statusLabel ? '· ' + esc(item.statusLabel) : ''}</div>` : ''}
      ${isFailed ? `<div class="item-error" title="${esc(item.error)}">${esc(item.error)}</div>` : ''}
    </div>
    <div class="item-actions">
      <span class="status-label ${slClass}">${slLabel}</span>
      <div class="action-row">
        ${isActive ? `<button class="act-btn" data-act="pause" title="Pause">⏸</button>` : ''}
        ${isPaused ? `<button class="act-btn success" data-act="resume" title="Resume">▶</button>` : ''}
        ${isFailed ? `<button class="act-btn" data-act="retry" title="Retry">↺</button>` : ''}
        ${item.status === 'queued' ? `<button class="act-btn success" data-act="start" title="Start now">▶</button>` : ''}
        ${isDone ? `<button class="act-btn" data-act="open-file" title="Open file">📄</button>` : ''}
        <button class="act-btn" data-act="open-folder" title="Open folder">📁</button>
        <button class="act-btn danger" data-act="remove" title="Remove">✕</button>
      </div>
    </div>
  </div>`;
}

function bindItemEvents(el) {
  const id = el.dataset.id;
  el.querySelectorAll('[data-act]').forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      const act = btn.dataset.act;
      const item = S.queue.find(i => i.id === id);
      if (act === 'pause') window.api.pauseItem(id);
      else if (act === 'resume') window.api.resumeItem(id);
      else if (act === 'retry') window.api.retryItem(id);
      else if (act === 'start') window.api.startItem(id);
      else if (act === 'open-folder') window.api.openFolder(item?.file || null);
      else if (act === 'open-file' && item?.file) window.api.openFile(item.file);
      else if (act === 'remove') window.api.removeItem(id);
    };
  });
}

/* ─── History Render ────────────────────────────────── */
function renderHistory() {
  const q = S.search;
  const items = S.history.filter(h => !q || h.title?.toLowerCase().includes(q) || h.uploader?.toLowerCase().includes(q));
  const list = $('#historyList');
  if (!items.length) { list.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text3)">No history yet</div>'; updateCount(0); return; }
  updateCount(items.length);
  list.innerHTML = items.map(h => `
    <div class="history-item" data-hid="${esc(h.id)}">
      <img class="hist-thumb" src="${esc(h.thumbnail || '')}" onerror="this.style.opacity=.2"/>
      <div style="min-width:0">
        <div class="hist-title">${esc(h.title)}</div>
        <div class="hist-meta">${esc(h.uploader || '')} · ${fmtDate(h.downloadDate)} · ${esc(h.quality || '')} ${esc(h.format || '')} · <span style="color:${h.status==='completed'?'var(--green)':'var(--red)'}">${h.status}</span></div>
      </div>
      <div class="hist-actions">
        ${h.filePath ? `<button class="act-btn" data-hact="open-folder" title="Open folder">📁</button>` : ''}
        <button class="act-btn danger" data-hact="remove" title="Remove">✕</button>
      </div>
    </div>`).join('');
  list.querySelectorAll('.history-item').forEach(el => {
    const hid = el.dataset.hid;
    const item = S.history.find(h => h.id === hid);
    el.querySelectorAll('[data-hact]').forEach(btn => {
      btn.onclick = async () => {
        if (btn.dataset.hact === 'open-folder') window.api.openFolder(item?.filePath || null);
        else if (btn.dataset.hact === 'remove') { await window.api.removeHistory(hid); S.history = await window.api.getHistory(); renderHistory(); }
      };
    });
  });
}

/* ─── Status Bar ────────────────────────────────────── */
function updateStatusBar() {
  const active = S.queue.filter(i => i.status === 'downloading');
  const queued = S.queue.filter(i => i.status === 'queued').length;
  const completed = S.queue.filter(i => i.status === 'completed').length;
  const dot = $('#statusDot');
  dot.classList.toggle('active', active.length > 0);
  $('#progressText').textContent = active.length ? `${active.length} downloading…` : completed ? `${completed} completed` : 'Ready';
  const first = active[0];
  $('#speedText').textContent = first ? `${first.speed || ''} ${first.eta ? '· ETA ' + first.eta : ''}` : '';
  $('#queueStats').textContent = `Queued: ${queued}  Completed: ${completed}`;
}

function updateCount(n) {
  $('#itemCount').textContent = `${n} item${n === 1 ? '' : 's'}`;
}

/* ─── Toast helper ──────────────────────────────────── */
function toast(type, msg, ms = 5000) {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  const icon = { success: '✓', error: '✕', warn: '⚠', info: 'ℹ' }[type] || '';
  el.innerHTML = `<span>${icon}</span><span>${esc(msg)}</span><button class="toast-close">✕</button>`;
  el.querySelector('.toast-close').onclick = () => el.remove();
  $('#toastContainer').appendChild(el);
  setTimeout(() => el.remove(), ms);
}
function showError(msg) { toast('error', msg); }

/* ─── IPC listeners ─────────────────────────────────── */
window.api.on('queue:updated', queue => {
  S.queue = queue;
  if (S.tab !== 'history') renderQueue();
  updateStatusBar();
});
window.api.on('queue:restored', queue => {
  S.queue = queue;
  renderQueue();
  if (queue.length) toast('info', `${queue.length} interrupted download(s) restored.`);
});
window.api.on('open-settings', () => openSettings());

/* ─── Toolbar selects sync ──────────────────────────── */
$('#modeSelect').onchange = e => { $('#dlMode').value = e.target.value; };
$('#qualitySelect').onchange = e => { $('#dlQuality').value = e.target.value; };
$('#formatSelect').onchange = e => { $('#dlFormat').value = e.target.value; };

/* ─── Drag & drop URL ────────────────────────────────── */
let dragDepth = 0;
window.addEventListener('dragenter', e => {
  e.preventDefault();
  dragDepth++;
  $('#dropOverlay').classList.remove('hidden');
});
window.addEventListener('dragover', e => e.preventDefault());
window.addEventListener('dragleave', () => {
  dragDepth = Math.max(0, dragDepth - 1);
  if (dragDepth === 0) $('#dropOverlay').classList.add('hidden');
});
window.addEventListener('drop', e => {
  e.preventDefault();
  dragDepth = 0;
  $('#dropOverlay').classList.add('hidden');
  const text = (e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain') || '').trim();
  if (!/^https?:\/\//i.test(text)) { toast('warn', 'Drop a valid http(s) link.'); return; }
  showUrlModal();
  $('#urlInput').value = text;
});

/* ─── First-run ──────────────────────────────────────── */
$('#frConsent').onchange = e => { $('#frFinish').disabled = !e.target.checked; };
$('#frBrowse').onclick = async () => { const p = await window.api.pickFolder(); if (p) $('#frFolder').value = p; };
$('#frFinish').onclick = async () => {
  S.settings = await window.api.setSettings({
    firstRunComplete: true,
    outputDir: $('#frFolder').value || S.settings.outputDir,
    theme: $('#frTheme').value,
  });
  applyTheme(S.settings.theme);
  updatePathLabel();
  closeModal('#firstRunModalOverlay');
};
async function showFirstRun() {
  $('#frFolder').value = S.settings.outputDir || '';
  $('#frTheme').value = S.settings.theme || 'dark';
  const deps = await window.api.checkDeps();
  $('#frDepRow').innerHTML = `
    <span class="dep-chip ${deps.ytdlp.found ? 'ok' : 'missing'}">yt-dlp ${deps.ytdlp.found ? '✓' : '✗ Missing'}</span>
    <span class="dep-chip ${deps.ffmpeg.found ? 'ok' : 'missing'}">FFmpeg ${deps.ffmpeg.found ? '✓' : '✗ Missing'}</span>`;
  openModal('#firstRunModalOverlay');
}

/* ─── Boot ──────────────────────────────────────────── */
(async () => {
  S.settings = await window.api.getSettings();
  S.queue = await window.api.getQueue();
  S.history = await window.api.getHistory();
  applyTheme(S.settings.theme);
  updatePathLabel();
  renderQueue();
  if (!S.settings.firstRunComplete) showFirstRun();
})();
