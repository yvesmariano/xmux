/**
 * Global registry of xterm.js instances.
 * Keeps terminals alive between component remounts, preventing
 * layout tree changes from destroying active PTYs.
 */
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import type { AppearanceConfig } from '../../../shared/settingsTypes'
import { resolveTheme } from '../../../shared/themes'
import { getSettingsSync, registerAppearanceChangeHandler } from './settingsCache'

export interface TerminalEntry {
  term: Terminal
  fitAddon: FitAddon
  /** Cleanups registered when the PTY was created (IPC listeners, etc.) */
  ptyCleanups: (() => void)[]
}

const registry = new Map<string, TerminalEntry>()

function getTerminalOptions(appearance: AppearanceConfig): Record<string, unknown> {
  const theme = resolveTheme(appearance.theme, appearance.customTheme)
  return {
    fontFamily: appearance.fontFamily,
    fontSize: appearance.fontSize,
    lineHeight: appearance.lineHeight,
    cursorBlink: appearance.cursorBlink,
    cursorStyle: appearance.cursorStyle,
    scrollback: appearance.scrollback,
    theme,
    allowTransparency: false,
    allowProposedApi: true
  }
}

/**
 * Updates all existing terminals when appearance settings change.
 */
function updateAllTerminals(appearance: AppearanceConfig): void {
  const theme = resolveTheme(appearance.theme, appearance.customTheme)
  for (const [, entry] of registry) {
    entry.term.options.fontFamily = appearance.fontFamily
    entry.term.options.fontSize = appearance.fontSize
    entry.term.options.lineHeight = appearance.lineHeight
    entry.term.options.cursorBlink = appearance.cursorBlink
    entry.term.options.cursorStyle = appearance.cursorStyle
    entry.term.options.scrollback = appearance.scrollback
    entry.term.options.theme = theme
    entry.fitAddon.fit()
  }
}

// Register live update handler
registerAppearanceChangeHandler(updateAllTerminals)

/**
 * Returns the existing entry or creates a new xterm instance.
 * Does NOT call `term.open()` — that is done by the component.
 */
export function getOrCreate(panelId: string): TerminalEntry {
  if (!registry.has(panelId)) {
    const { appearance } = getSettingsSync()
    const opts = getTerminalOptions(appearance)
    const term = new Terminal(opts)
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
