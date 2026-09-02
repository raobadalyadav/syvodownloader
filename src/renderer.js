const state = { items: [], activeTab: 'all', defaults: null };
const $ = s => document.querySelector(s);
const list = $('#downloadList');

function fmtDuration(sec) {
  if (!sec) return '—';
  const h = Math.floor(sec/3600), m = Math.floor(sec%3600/60), s = Math.floor(sec%60);
  return h ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function fmtSize(bytes){ if(!bytes) return '—'; const u=['B','KB','MB','GB']; let i=0,n=bytes; while(n>=1024&&i<3){n/=1024;i++} return `${n.toFixed(i?1:0)} ${u[i]}`; }

function render() {
  const items = state.items.filter(x => {
    if (state.activeTab === 'all') return true;
    if (state.activeTab === 'video') return x.mode === 'video';
    if (state.activeTab === 'audio') return x.mode === 'audio';
    if (state.activeTab === 'processed') return x.status === 'complete';
    return true;
  });
  list.innerHTML = '';
  $('#emptyState').style.display = items.length ? 'none' : 'flex';
  $('#itemCount').textContent = `${items.length} item${items.length === 1 ? '' : 's'}`;
  for (const item of items) {
    const el = document.createElement('div'); el.className='item'; el.dataset.id=item.id;
    el.innerHTML = `
      <img class="thumb" src="${item.thumbnail || ''}" onerror="this.style.opacity=.15" />
      <div><div class="title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</div>
      <div class="meta">${fmtDuration(item.duration)} · ${item.size ? fmtSize(item.size)+' · ' : ''}${item.container.toUpperCase()} · ${item.quality || 'Best'} · ${escapeHtml(item.uploader || '')}</div>
      <div class="progress"><div style="width:${item.progress||0}%"></div></div>
      ${item.error ? `<div class="error">${escapeHtml(item.error)}</div>` : ''}</div>
      <button class="download-btn" title="Download" ${item.status==='downloading'?'disabled':''}>↓</button>
      <button class="more" title="Open folder">⋮</button>`;
    el.querySelector('.download-btn').onclick=()=>start(item);
    el.querySelector('.more').onclick=()=>window.downloader.openFolder(item.file);
    list.appendChild(el);
  }
  const active = state.items.filter(x=>x.status==='downloading');
  $('#progressText').textContent = `${active.length} download${active.length===1?'':'s'} in progress`;
  $('#speedText').textContent = active.length ? `${active[0].speed||'Starting…'} · ${active[0].eta||'calculating ETA'}` : 'Ready';
}
function escapeHtml(v=''){return v.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}

async function addFromUrl(url) {
  try {
    $('#emptyState').style.display='none';
    const info = await window.downloader.inspect(url);
    const item = { ...info, id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, url, mode:'video', quality:'1080p', container:'mp4', status:'queued', progress:0 };
    state.items.unshift(item); render();
    await start(item);
  } catch (e) {
    alert(e.message || e);
  }
}
async function start(item){
  if(item.status==='downloading') return;
  item.status='downloading'; item.error=''; render();
  try {
    await window.downloader.start({id:item.id,url:item.url,title:item.title,mode:item.mode,quality:parseInt(item.quality),container:item.container,subtitles:false,playlist:false});
  } catch(e) { item.status='error'; item.error=e.message; render(); }
}

$('#pasteBtn').onclick=async()=>{
  const text = await navigator.clipboard.readText();
  if (!text) return alert('Clipboard does not contain a link.');
  addFromUrl(text.trim());
};

$('#tabs').addEventListener('click', e=>{ if(e.target.matches('button[data-tab]')){state.activeTab=e.target.dataset.tab; document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active')); e.target.classList.add('active'); render();}});
$('#settingsBtn').onclick=()=>openSettings();
$('#browseBtn').onclick=async()=>{ $('#folderInput').value=await window.downloader.pickFolder(); };
$('#saveSettings').onclick=async(e)=>{e.preventDefault(); await window.downloader.setSettings({outputDir:$('#folderInput').value,maxConcurrent:Number($('#concurrency').value),preferredContainer:$('#container').value}); $('#settingsDialog').close(); updatePathLabel();};
async function openSettings(){ const d=await window.downloader.defaults(); $('#folderInput').value=d.outputDir; $('#concurrency').value=d.maxConcurrent; $('#container').value=d.preferredContainer; $('#settingsDialog').showModal(); }
function updatePathLabel(){ const p=state.defaults?.outputDir||''; $('#pathLabel').textContent=p.split(/[\\/]/).pop()||'Downloads'; }

window.downloader.onProgress(d=>{const i=state.items.find(x=>x.id===d.id);if(i){i.progress=d.progress;i.speed=d.speed;i.eta=d.eta;render();}});
window.downloader.onComplete(d=>{const i=state.items.find(x=>x.id===d.id);if(i){i.status='complete';i.progress=100;i.file=d.file;render();}});
window.downloader.onError(d=>{const i=state.items.find(x=>x.id===d.id);if(i){i.status='error';i.error=d.error;render();}});

(async()=>{state.defaults=await window.downloader.defaults();updatePathLabel();render();})();
