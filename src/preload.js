const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // App
  getDefaults:   ()       => ipcRenderer.invoke('app:get-defaults'),
  getVersion:    ()       => ipcRenderer.invoke('app:get-version'),
  checkDeps:     ()       => ipcRenderer.invoke('app:check-deps'),
  openLogs:      ()       => ipcRenderer.invoke('app:open-logs'),

  // Settings
  getSettings:   ()       => ipcRenderer.invoke('settings:get'),
  setSettings:   p        => ipcRenderer.invoke('settings:set', p),
  resetSettings: ()       => ipcRenderer.invoke('settings:reset'),
  pickFolder:    ()       => ipcRenderer.invoke('settings:pick-folder'),

  // Media
  inspect:       (url, pl) => ipcRenderer.invoke('media:inspect', url, pl),

  // Queue
  getQueue:      ()       => ipcRenderer.invoke('queue:get'),
  addToQueue:    item     => ipcRenderer.invoke('queue:add', item),
  addBatch:      items    => ipcRenderer.invoke('queue:add-batch', items),
  startItem:     id       => ipcRenderer.invoke('queue:start', id),
  pauseItem:     id       => ipcRenderer.invoke('queue:pause', id),
  resumeItem:    id       => ipcRenderer.invoke('queue:resume', id),
  cancelItem:    id       => ipcRenderer.invoke('queue:cancel', id),
  retryItem:     id       => ipcRenderer.invoke('queue:retry', id),
  removeItem:    id       => ipcRenderer.invoke('queue:remove', id),
  clearCompleted: ()      => ipcRenderer.invoke('queue:clear-completed'),
  pauseAll:      ()       => ipcRenderer.invoke('queue:pause-all'),
  resumeAll:     ()       => ipcRenderer.invoke('queue:resume-all'),
  cancelAll:     ()       => ipcRenderer.invoke('queue:cancel-all'),
  retryFailed:   ()       => ipcRenderer.invoke('queue:retry-failed'),

  // History
  getHistory:    ()       => ipcRenderer.invoke('history:get'),
  clearHistory:  ()       => ipcRenderer.invoke('history:clear'),
  removeHistory: id       => ipcRenderer.invoke('history:remove', id),
  exportHistory: ()       => ipcRenderer.invoke('history:export'),

  // Shell
  openFolder:    file     => ipcRenderer.invoke('shell:open-folder', file),
  openFile:      file     => ipcRenderer.invoke('shell:open-file', file),
  openDownloads: ()       => ipcRenderer.invoke('shell:open-downloads'),

  // Window
  minimize:      ()       => ipcRenderer.invoke('window:minimize'),
  maximize:      ()       => ipcRenderer.invoke('window:maximize'),
  closeWindow:   ()       => ipcRenderer.invoke('window:close'),

  // Clipboard
  readClipboard:  ()        => ipcRenderer.invoke('clipboard:read'),
  writeClipboard: text      => ipcRenderer.invoke('clipboard:write', text),

  // File
  importUrls:     ()        => ipcRenderer.invoke('file:import-urls'),

  // Disk
  checkDisk:      bytes     => ipcRenderer.invoke('disk:check', bytes),

  // Duplicate detection
  checkFileExists: (title, ext) => ipcRenderer.invoke('file:check-exists', title, ext),

  // Queue move
  moveItem:       (id, dir) => ipcRenderer.invoke('queue:move', id, dir),

  // Events
  on: (channel, cb) => {
    const allowed = ['queue:updated', 'queue:restored', 'open-settings'];
    if (allowed.includes(channel)) ipcRenderer.on(channel, (_e, data) => cb(data));
  },
  off: (channel, cb) => ipcRenderer.removeListener(channel, cb),
});
