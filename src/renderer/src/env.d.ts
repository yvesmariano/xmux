/// <reference types="vite/client" />

import type { PtyAPI } from '../../preload/index'

declare global {
  interface Window {
    electronAPI: {
      pty: PtyAPI
    }
  }
}
