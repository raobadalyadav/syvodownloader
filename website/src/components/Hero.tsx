import { useMemo } from 'react'
import { DOWNLOAD_LINUX_APPIMAGE, DOWNLOAD_LINUX_DEB, DOWNLOAD_MAC_ZIP, DOWNLOAD_WIN_INSTALLER, DOWNLOAD_WIN_PORTABLE, REPO } from '../constants'

type Platform = 'win' | 'mac' | 'linux'

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  if (/Mac/i.test(ua)) return 'mac'
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return 'linux'
  return 'win'
}

const PRIMARY_CTA: Record<Platform, { label: string; href: string; note: string }> = {
  win: { label: '↓ Download for Windows', href: DOWNLOAD_WIN_INSTALLER, note: 'Installer · .exe' },
  mac: { label: '↓ Download for macOS', href: DOWNLOAD_MAC_ZIP, note: 'Apple Silicon & Intel · .zip' },
  linux: { label: '↓ Download for Linux', href: DOWNLOAD_LINUX_APPIMAGE, note: 'AppImage · no install needed' },
}

export function Hero() {
  const platform = useMemo(() => detectPlatform(), [])
  const primary = PRIMARY_CTA[platform]

  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <h1>Paste a link.<br />Get the <span className="accent">file.</span></h1>
          <p className="lede">
            A local-first desktop downloader for YouTube, Instagram, Facebook, and the 1,800+ other sites{' '}
            <code>yt-dlp</code> understands. Queue, quality picker with size estimates, subtitles, playlists —
            no account, no server, no cloud copy of your media.
          </p>
          <div className="cta-row">
            <a className="btn btn-primary" href={primary.href}>{primary.label}</a>
          </div>
          <div className="cta-note">v1.1.0 · {primary.note} · yt-dlp &amp; ffmpeg bundled</div>

          <div className="platform-row">
            <a href={DOWNLOAD_WIN_PORTABLE} className={platform === 'win' ? 'plink current' : 'plink'}>Windows (portable)</a>
            <span className="plink-sep">·</span>
            <a href={DOWNLOAD_MAC_ZIP} className={platform === 'mac' ? 'plink current' : 'plink'}>macOS</a>
            <span className="plink-sep">·</span>
            <a href={DOWNLOAD_LINUX_APPIMAGE} className={platform === 'linux' ? 'plink current' : 'plink'}>Linux (AppImage)</a>
            <span className="plink-sep">·</span>
            <a href={DOWNLOAD_LINUX_DEB} className="plink">.deb</a>
            <span className="plink-sep">·</span>
            <a href={REPO} target="_blank" rel="noopener noreferrer" className="plink">source</a>
          </div>
        </div>

        <AppWindowDemo />
      </div>
    </section>
  )
}

function AppWindowDemo() {
  return (
    <div className="appwin" aria-hidden="true">
      <div className="appwin-bar">
        <span className="lt" /><span className="lt" /><span className="lt" />
        <span className="name">syvo-downloader.exe</span>
      </div>
      <div className="stage">
        <div className="scene scene1">
          <span className="field-label">Paste URL</span>
          <div className="urlbar"><span className="typed">https://youtu.be/dQw4w9WgXcQ</span></div>
        </div>
        <div className="scene scene2">
          <div className="scene-center">
            <div className="spinner" />
            <p>Analyzing…</p>
            <div className="chiprow">
              <span className="chip ok">yt-dlp ✓</span>
              <span className="chip ok">ffmpeg ✓</span>
            </div>
          </div>
        </div>
        <div className="scene scene3">
          <span className="field-label">Video found</span>
          <div className="infocard">
            <div className="thumb" />
            <div style={{ flex: 1, paddingTop: 4 }}>
              <div className="skel" style={{ width: '82%', marginBottom: 8 }} />
              <div className="skel" style={{ width: '46%', opacity: .5 }} />
            </div>
          </div>
          <div className="qrow">
            <span className="pill hi">1080p — ~184 MB</span>
            <span className="pill">MP4</span>
          </div>
        </div>
        <div className="scene scene4">
          <span className="field-label">Downloading</span>
          <div className="qitem">
            <div className="thumb" />
            <div className="body">
              <div className="title">Rick Astley — Never Gonna Give You Up</div>
              <div className="badges">
                <span className="badge">1080p</span>
                <span className="badge">MP4</span>
              </div>
              <div className="bar"><div className="fill" /></div>
              <div className="qmeta"><span>142 MB / 184 MB</span><span className="mono">6.8 MB/s</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
