import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'
import { initBuiltinPlugins } from './plugins'

// Register built-in status bar plugins before render to avoid empty flash
initBuiltinPlugins()

// StrictMode is intentionally disabled: it would cause double-mount/unmount
// and race conditions with native resources (PTY, xterm). Standard in Electron apps.
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)
