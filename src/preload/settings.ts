import { contextBridge, ipcRenderer } from 'electron'
import type { XmuxSettings } from '../shared/settingsTypes'

export type SettingsAPI = {
  get: (keyPath?: string) => Promise<XmuxSettings | unknown>
  set: (keyPath: string, value: unknown) => Promise<void>
  reset: () => Promise<void>
  onChange: (callback: (settings: XmuxSettings) => void) => () => void
  openSettings: () => void
}

const settingsAPI: SettingsAPI = {
  get: (keyPath?) => ipcRenderer.invoke('settings:get', keyPath),
  set: (keyPath, value) => ipcRenderer.invoke('settings:set', keyPath, value),
  reset: () => ipcRenderer.invoke('settings:reset'),
  onChange: (callback) => {
    const handler = (_: Electron.IpcRendererEvent, settings: XmuxSettings): void =>
      callback(settings)
    ipcRenderer.on('settings:changed', handler)
    return () => ipcRenderer.removeListener('settings:changed', handler)
  },
  openSettings: () => ipcRenderer.send('open-settings')
}

contextBridge.exposeInMainWorld('electronAPI', {
  settings: settingsAPI
})
