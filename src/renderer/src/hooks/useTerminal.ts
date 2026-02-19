import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'

// Tokyo Night color scheme
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

interface UseTerminalResult {
  terminalRef: React.RefObject<HTMLDivElement | null>
  terminal: Terminal | null
  fitAddon: FitAddon | null
}

export function useTerminal(containerRef: React.RefObject<HTMLDivElement | null>): {
  terminal: Terminal | null
  fitAddon: FitAddon | null
} {
  const terminalRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const term = new Terminal({
      fontFamily: '"JetBrains Mono", "Cascadia Code", "Fira Code", Menlo, monospace',
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
    const webLinksAddon = new WebLinksAddon()

    term.loadAddon(fitAddon)
    term.loadAddon(webLinksAddon)
    term.open(containerRef.current)

    // Fit initial size
    requestAnimationFrame(() => {
      fitAddon.fit()
    })

    terminalRef.current = term
    fitAddonRef.current = fitAddon

    return () => {
      term.dispose()
      terminalRef.current = null
      fitAddonRef.current = null
    }
  }, [containerRef])

  return {
    terminal: terminalRef.current,
    fitAddon: fitAddonRef.current
  }
}
