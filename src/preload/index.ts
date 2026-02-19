import { contextBridge, ipcRenderer } from 'electron'

export type PtyAPI = {
  create: (id: string, cols: number, rows: number) => Promise<void>
  write: (id: string, data: string) => void
  resize: (id: string, cols: number, rows: number) => Promise<void>
  destroy: (id: string) => Promise<void>
  onData: (id: string, callback: (data: string) => void) => () => void
  onExit: (id: string, callback: (exitCode: number) => void) => () => void
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

contextBridge.exposeInMainWorld('electronAPI', {
  pty: ptyAPI
})
