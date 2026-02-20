import { contextBridge, ipcRenderer } from 'electron'
import type { XmuxSettings } from '../shared/settingsTypes'

export type PtyAPI = {
  create: (id: string, cols: number, rows: number) => Promise<void>
  write: (id: string, data: string) => void
  resize: (id: string, cols: number, rows: number) => Promise<void>
  destroy: (id: string) => Promise<void>
  onData: (id: string, callback: (data: string) => void) => () => void
  onExit: (id: string, callback: (exitCode: number) => void) => () => void
}

export type SettingsAPI = {
  get: (keyPath?: string) => Promise<XmuxSettings | unknown>
  set: (keyPath: string, value: unknown) => Promise<void>
  reset: () => Promise<void>
  onChange: (callback: (settings: XmuxSettings) => void) => () => void
  openSettings: () => void
}

const ptyAPI: PtyAPI = {
  create: (id, cols, rows) => ipcRenderer.invoke('pty:create', id, cols, rows),
  write: (id, data) => ipcRenderer.send('pty:write', id, data),
  resize: (id, cols, rows) => ipcRenderer.invoke('pty:resize', id, cols, rows),
  destroy: (id) => ipcRenderer.invoke('pty:destroy', id),
  onData: (id, callback) => {
    const channel = `pty:data:${id}`
    const handler = (_: Electron.IpcRendererEvent, data: string): void => callback(data)
    ipcRenderer.on(channel, handler)
    return () => ipcRenderer.removeListener(channel, handler)
  },
  onExit: (id, callback) => {
    const channel = `pty:exit:${id}`
    const handler = (_: Electron.IpcRendererEvent, exitCode: number): void => callback(exitCode)
    ipcRenderer.on(channel, handler)
    return () => ipcRenderer.removeListener(channel, handler)
  }
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
  pty: ptyAPI,
  settings: settingsAPI
})
