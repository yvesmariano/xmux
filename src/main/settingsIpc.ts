import { ipcMain, BrowserWindow } from 'electron'
import { settingsStore } from './settingsStore'
import { settingsDefaults } from '../shared/settingsTypes'

function broadcastSettingsChanged(): void {
  const settings = settingsStore.store
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send('settings:changed', settings)
    }
  }
}

export function registerSettingsIpc(): void {
  ipcMain.handle('settings:get', (_event, keyPath?: string) => {
    if (keyPath) {
      return settingsStore.get(keyPath as any)
    }
    return settingsStore.store
  })

  ipcMain.handle('settings:set', (_event, keyPath: string, value: unknown) => {
    settingsStore.set(keyPath as any, value as any)
    broadcastSettingsChanged()
  })

  ipcMain.handle('settings:reset', () => {
    settingsStore.store = { ...settingsDefaults }
    broadcastSettingsChanged()
  })
}
