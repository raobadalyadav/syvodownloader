import { ISSUES_PAGE, RELEASES_PAGE, REPO } from '../constants'

export function Footer() {
  return (
    <footer className="wrap">
      <div className="fbrand">© Syvo Downloader — local-first, no account, no cloud copy.</div>
      <div className="flinks">
        <a href={REPO} target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href={RELEASES_PAGE} target="_blank" rel="noopener noreferrer">Releases</a>
        <a href={ISSUES_PAGE} target="_blank" rel="noopener noreferrer">Report an issue</a>
      </div>
    </footer>
  )
}
