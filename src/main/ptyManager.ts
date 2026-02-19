import * as pty from 'node-pty'
import { WebContents } from 'electron'

interface PtySession {
  pty: pty.IPty
  webContents: WebContents
}

const sessions = new Map<string, PtySession>()

export function createPty(
  id: string,
  cols: number,
  rows: number,
  webContents: WebContents
): void {
  const shell = process.env.SHELL ?? (process.platform === 'win32' ? 'cmd.exe' : '/bin/bash')

  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols,
    rows,
    cwd: process.env.HOME ?? '/',
    env: {
      ...process.env,
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor',
      TERM_PROGRAM: 'xmux',
      LANG: process.env.LANG ?? 'en_US.UTF-8'
    } as Record<string, string>
  })

  ptyProcess.onData((data) => {
    if (!webContents.isDestroyed()) {
      webContents.send(`pty:data:${id}`, data)
    }
  })

  ptyProcess.onExit(({ exitCode }) => {
    sessions.delete(id)
    if (!webContents.isDestroyed()) {
      webContents.send(`pty:exit:${id}`, exitCode)
    }
  })

  sessions.set(id, { pty: ptyProcess, webContents })
}

export function writePty(id: string, data: string): void {
  const session = sessions.get(id)
  if (session) {
    session.pty.write(data)
  }
}

export function resizePty(id: string, cols: number, rows: number): void {
  const session = sessions.get(id)
  if (session) {
    try {
      session.pty.resize(cols, rows)
    } catch {
      // PTY may be closing
    }
  }
}

export function destroyPty(id: string): void {
  const session = sessions.get(id)
  if (session) {
    try {
      session.pty.kill()
    } catch {
      // already dead
    }
    sessions.delete(id)
  }
}

export function destroyAllPty(): void {
  for (const [id] of sessions) {
    destroyPty(id)
  }
}
