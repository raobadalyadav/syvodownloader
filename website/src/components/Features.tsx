import type { ReactNode } from 'react'

type Feature = { title: string; body: ReactNode }
type Group = { label: string; heading: string; items: Feature[] }

const GROUPS: Group[] = [
  {
    label: 'Download engine',
    heading: 'Wherever the link is from',
    items: [
      { title: '1,800+ sites', body: 'One generic engine — yt-dlp — handles YouTube, Instagram, Facebook, and everything else it supports. No per-site code, no missing platforms.' },
      { title: 'Cookies from browser', body: <>Point it at Chrome, Firefox, Edge, Brave, or Opera and it reads your existing login session — needed for private or gated Instagram/Facebook content.</> },
      { title: 'Playlist auto-detection', body: 'A playlist or "Mix" link is recognized automatically and offers per-video selection — or grab it all. No manual toggle to remember.' },
      { title: 'Bundled dependencies', body: <><code>yt-dlp</code> and <code>FFmpeg</code> ship inside the installer. Nothing to download or configure separately.</> },
    ],
  },
  {
    label: 'Quality & formats',
    heading: 'Pick exactly what you want',
    items: [
      { title: 'Size shown inline', body: 'Every resolution or audio bitrate option shows its estimated file size right in the picker — no separate format table to dig through.' },
      { title: 'Video: MP4 · MKV · WebM', body: 'Full resolution ladder from 144p up to 4K, whatever the source actually offers.' },
      { title: 'Audio: MP3 · M4A · Opus · WAV · FLAC', body: 'Bitrate choices from 96 to 320 kbps, or best available — actually applied to the encode, not just cosmetic.' },
      { title: 'Subtitles, 8 languages', body: 'English, Hindi, Spanish, French, German, Japanese, Korean, Arabic — embedded in the file or saved alongside it.' },
      { title: 'Metadata & thumbnail embedding', body: 'Title, uploader, and cover art written into the file on completion, optional per download.' },
    ],
  },
  {
    label: 'Queue & reliability',
    heading: 'Built for many downloads, not one',
    items: [
      { title: 'Concurrent, 1–6 at once', body: 'Run several downloads in parallel; the limit is yours to set.' },
      { title: 'Pause · resume · cancel · retry', body: 'Per item or all at once, plus manual ▲▼ reordering to bump priority.' },
      { title: 'Auto-retry on failure', body: 'Configurable retry count and delay for transient network or extractor errors — permanent failures aren\'t retried forever.' },
      { title: 'Survives a restart', body: 'The queue is restored automatically if the app closes mid-download, with interrupted jobs clearly flagged.' },
      { title: 'Duplicate-file handling', body: 'Skip, rename, or replace — asked before a re-download starts, never silently overwritten.' },
      { title: 'Disk-space advisory', body: 'A warning appears before you queue something bigger than the free space on your drive.' },
    ],
  },
  {
    label: 'Organization',
    heading: 'Files land where you want them',
    items: [
      { title: 'Filename template builder', body: <>Insert real tokens — title, uploader, upload date, ID — with buttons instead of hand-typing <code>%(title)s</code> syntax.</> },
      { title: 'Folder templates', body: <>Auto-sort into subfolders like <code>{'{uploader}/{year}'}</code> as files download.</> },
      { title: 'Searchable history', body: 'Every completed and failed download logged with file size, quality, and date — searchable, exportable.' },
      { title: 'Queue + history filters', body: 'Tabs for All / Video / Audio / Completed / Failed keep a long queue scannable.' },
    ],
  },
  {
    label: 'Desktop-native',
    heading: 'Feels like it belongs on Windows',
    items: [
      { title: 'System tray', body: 'Pause all, resume all, or reopen the app without it living in your taskbar.' },
      { title: 'Desktop notifications', body: 'Told when a download — or the whole queue — finishes, without needing the window in focus.' },
      { title: 'Dark & light themes', body: 'Follows your system setting or switch manually.' },
      { title: 'Window state remembered', body: 'Reopens at the size and position you left it.' },
      { title: 'Keyboard-driven', body: <><code>Ctrl+V</code> paste, <code>Ctrl+N</code> new download, <code>Ctrl+F</code> search, <code>Ctrl+Shift+P/R</code> pause/resume all.</> },
    ],
  },
  {
    label: 'Privacy',
    heading: 'Nothing leaves your machine',
    items: [
      { title: 'No account, no server', body: 'Every download goes straight from the source to your disk — this app never proxies or stores your media.' },
      { title: 'Local settings & history', body: 'Everything lives in a local file under your own Windows profile, not a cloud account.' },
      { title: 'First-run consent', body: 'A one-time responsible-use confirmation before the app is used at all.' },
      { title: 'Diagnostics panel', body: 'See the exact yt-dlp and FFmpeg versions in use — no hidden black box.' },
    ],
  },
]

export function Features() {
  return (
    <section id="features">
      <div className="wrap">
        <p className="eyebrow">What's inside</p>
        <h2 style={{ fontSize: 34, marginBottom: 44 }}>Everything the app actually does</h2>
        {GROUPS.map(group => (
          <div className="feat-group" key={group.label}>
            <div className="feat-group-head">
              <span className="feat-group-label">{group.label}</span>
              <h3>{group.heading}</h3>
            </div>
            <div className="feat-grid">
              {group.items.map(item => (
                <div className="feat" key={item.title}>
                  <h4>{item.title}</h4>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
