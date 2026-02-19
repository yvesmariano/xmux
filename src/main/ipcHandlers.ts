import { ipcMain, BrowserWindow } from 'electron'
import { createPty, writePty, resizePty, destroyPty } from './ptyManager'

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle('pty:create', (_event, id: string, cols: number, rows: number) => {
    createPty(id, cols, rows, mainWindow.webContents)
  })

  // write usa ipcMain.on (sem Promise overhead no hot path)
  ipcMain.on('pty:write', (_event, id: string, data: string) => {
    writePty(id, data)
  })

  ipcMain.handle('pty:resize', (_event, id: string, cols: number, rows: number) => {
    resizePty(id, cols, rows)
  })

  ipcMain.handle('pty:destroy', (_event, id: string) => {
    destroyPty(id)
  })
}
