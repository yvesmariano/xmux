import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

// StrictMode desativado: causaria double-mount/unmount e race conditions
// com recursos nativos (PTY, xterm). Padrão em apps Electron.
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)
