import { useTheme } from '../useTheme'

export function Header() {
  const { theme, toggle } = useTheme()
  return (
    <div className="wrap topbar">
      <div className="brand"><span className="dot" />Syvo Downloader</div>
      <nav>
        <a href="#how">How it works</a>
        <a href="#features">Features</a>
        <a href="#requirements">Requirements</a>
        <a href="#usage">Usage</a>
        <button
          className="theme-toggle"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </nav>
    </div>
  )
}
