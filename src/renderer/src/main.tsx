import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'
import { initBuiltinPlugins } from './plugins'
import { initSettingsCache } from './lib/settingsCache'

// Register built-in status bar plugins before render to avoid empty flash
initBuiltinPlugins()

// Load settings into sync cache, then render
// StrictMode is intentionally disabled: it would cause double-mount/unmount
// and race conditions with native resources (PTY, xterm). Standard in Electron apps.
initSettingsCache().then(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)
})
