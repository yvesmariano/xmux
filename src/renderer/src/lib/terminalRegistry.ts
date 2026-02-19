/**
 * Registry global de instâncias xterm.js.
 * Mantém terminais vivos entre remontagens de componentes, evitando
 * que mudanças na árvore de layout destruam PTYs ativos.
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
  /** Limpezas registradas ao criar o PTY (listeners IPC, etc.) */
  ptyCleanups: (() => void)[]
}

const registry = new Map<string, TerminalEntry>()

/**
 * Retorna a entrada existente ou cria uma nova instância de xterm.
 * NÃO chama `term.open()` — isso é feito pelo componente.
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
 * Destrói a instância xterm e o PTY associado.
 * Chamar ao fechar um painel de verdade (não ao remontar).
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
