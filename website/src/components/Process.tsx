const STEPS = [
  { n: '01', title: 'Paste', body: 'Drop a link, drag it onto the window, or bulk-import a .txt of URLs. Playlist links are detected automatically.' },
  { n: '02', title: 'Analyze', body: 'yt-dlp resolves title, thumbnail, duration, and every format actually available — no guessed resolutions.' },
  { n: '03', title: 'Configure', body: 'Pick quality or audio bitrate with the size shown inline, choose a container, add subtitles in up to 8 languages.' },
  { n: '04', title: 'Download', body: 'Queued with live speed, ETA, and downloaded/total size. Pause, resume, retry, or reorder anytime.' },
]

export function Process() {
  return (
    <section id="how">
      <div className="wrap">
        <p className="eyebrow">Workflow</p>
        <h2 style={{ fontSize: 34, marginBottom: 44 }}>Four steps, start to file</h2>
        <div className="steps">
          {STEPS.map(s => (
            <div className="step" key={s.n}>
              <div className="n">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
