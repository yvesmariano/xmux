/**
 * Global registry of xterm.js instances.
 * Keeps terminals alive between component remounts, preventing
 * layout tree changes from destroying active PTYs.
 */
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'

// Tokyo Night theme
const tokyoNightTheme = {
  background: '#1a1b26',
  foreground: '#c0caf5',
  cursor: '#c0caf5',
  cursorAccent: '#1a1b26',
  selectionBackground: '#364a82',
  selectionForeground: '#c0caf5',
  black: '#15161e',
  red: '#f7768e',
  green: '#9ece6a',
  yellow: '#e0af68',
  blue: '#7aa2f7',
  magenta: '#bb9af7',
  cyan: '#7dcfff',
  white: '#a9b1d6',
  brightBlack: '#414868',
  brightRed: '#f7768e',
  brightGreen: '#9ece6a',
  brightYellow: '#e0af68',
  brightBlue: '#7aa2f7',
  brightMagenta: '#bb9af7',
  brightCyan: '#7dcfff',
  brightWhite: '#c0caf5'
}

export interface TerminalEntry {
  term: Terminal
  fitAddon: FitAddon
  /** Cleanups registered when the PTY was created (IPC listeners, etc.) */
  ptyCleanups: (() => void)[]
}

const registry = new Map<string, TerminalEntry>()

/**
 * Returns the existing entry or creates a new xterm instance.
 * Does NOT call `term.open()` — that is done by the component.
 */
export function getOrCreate(panelId: string): TerminalEntry {
  if (!registry.has(panelId)) {
    const term = new Terminal({
      fontFamily:
        '"JetBrains Mono", "Cascadia Code", "Fira Code", Menlo, monospace',
      fontSize: 13,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      theme: tokyoNightTheme,
      allowTransparency: false,
      scrollback: 5000,
      allowProposedApi: true
    })
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.loadAddon(new WebLinksAddon())
    registry.set(panelId, { term, fitAddon, ptyCleanups: [] })
  }
  return registry.get(panelId)!
}

/**
 * Destroys the xterm instance and its associated PTY.
 * Call when truly closing a panel — not on remount.
 */
export function destroyEntry(panelId: string): void {
  const entry = registry.get(panelId)
  if (!entry) return
  for (const fn of entry.ptyCleanups) fn()
  entry.ptyCleanups = []
  entry.term.dispose()
  registry.delete(panelId)
  window.electronAPI.pty.destroy(panelId).catch(console.error)
}

export function has(panelId: string): boolean {
  return registry.has(panelId)
}
