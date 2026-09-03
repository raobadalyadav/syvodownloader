export const REPO = 'https://github.com/raobadalyadav/syvodownloader'
export const RELEASE_TAG = 'v1.1.0'
export const RELEASE_BASE = `${REPO}/releases/download/${RELEASE_TAG}`

export const DOWNLOAD_WIN_INSTALLER = `${RELEASE_BASE}/Syvo.Downloader.Setup.1.1.0.exe`
export const DOWNLOAD_WIN_PORTABLE = `${RELEASE_BASE}/Syvo.Downloader.1.1.0.exe`
export const DOWNLOAD_LINUX_APPIMAGE = `${RELEASE_BASE}/Syvo.Downloader-1.1.0.AppImage`
export const DOWNLOAD_LINUX_DEB = `${RELEASE_BASE}/syvo-downloader_1.1.0_amd64.deb`
export const DOWNLOAD_MAC_ZIP = `${RELEASE_BASE}/Syvo.Downloader-1.1.0-mac.zip`

// Back-compat aliases used by existing components.
export const DOWNLOAD_INSTALLER = DOWNLOAD_WIN_INSTALLER
export const DOWNLOAD_PORTABLE = DOWNLOAD_WIN_PORTABLE

export const RELEASES_PAGE = `${REPO}/releases`
export const ISSUES_PAGE = `${REPO}/issues`
