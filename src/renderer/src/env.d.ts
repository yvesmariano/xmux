/// <reference types="vite/client" />

import type { PtyAPI, SettingsAPI } from '../../preload/index'

declare global {
  interface Window {
    electronAPI: {
      pty: PtyAPI
      settings: SettingsAPI
    }
  }
}
