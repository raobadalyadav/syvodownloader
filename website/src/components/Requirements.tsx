const SYSTEM_SPECS: [string, string][] = [
  ['OS', 'Windows 10 64-bit (1909+)'],
  ['Processor', '64-bit dual-core, 1.6 GHz'],
  ['Memory', '4 GB RAM'],
  ['Disk', '500 MB + downloads'],
  ['Display', '1280 × 720'],
  ['Network', 'Broadband, required'],
]

const IN_THE_BOX: [string, string][] = [
  ['Syvo Downloader', '1.0.0'],
  ['yt-dlp', 'bundled'],
  ['FFmpeg', 'bundled, essentials'],
  ['Electron', '38'],
  ['Install size', '~250 MB'],
]

function SpecTable({ head, rows }: { head: [string, string]; rows: [string, string][] }) {
  return (
    <table>
      <tbody>
        <tr><th>{head[0]}</th><th>{head[1]}</th></tr>
        {rows.map(([label, value]) => (
          <tr key={label}><td>{label}</td><td className="mono-val">{value}</td></tr>
        ))}
      </tbody>
    </table>
  )
}

export function Requirements() {
  return (
    <section id="requirements">
      <div className="wrap spec-wrap">
        <div>
          <p className="eyebrow">System requirements</p>
          <h2 style={{ fontSize: 28, marginBottom: 26 }}>To run the installed app</h2>
          <SpecTable head={['Spec', 'Minimum']} rows={SYSTEM_SPECS} />
        </div>
        <div>
          <p className="eyebrow">&nbsp;</p>
          <h2 style={{ fontSize: 28, marginBottom: 26 }}>In the box</h2>
          <SpecTable head={['Component', 'Version']} rows={IN_THE_BOX} />
        </div>
      </div>
    </section>
  )
}
