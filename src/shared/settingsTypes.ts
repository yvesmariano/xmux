import type { ThemeChoice, TerminalTheme } from './themes'

export interface AppearanceConfig {
  theme: ThemeChoice
  customTheme: TerminalTheme
  fontFamily: string
  fontSize: number
  lineHeight: number
  cursorStyle: 'block' | 'bar' | 'underline'
  cursorBlink: boolean
  scrollback: number
}

export interface ShortcutConfig {
  newTab: string
  splitHorizontal: string
  splitVertical: string
  closePanel: string
}

export interface GeneralConfig {
  shellPath: string
  startingDirectory: string
}

export interface XmuxSettings {
  appearance: AppearanceConfig
  shortcuts: ShortcutConfig
  general: GeneralConfig
}

export const settingsDefaults: XmuxSettings = {
  appearance: {
    theme: 'Tokyo Night',
    customTheme: {
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
    },
    fontFamily: '"JetBrains Mono", "Cascadia Code", "Fira Code", Menlo, monospace',
    fontSize: 13,
    lineHeight: 1.2,
    cursorStyle: 'block',
    cursorBlink: true,
    scrollback: 5000
  },
  shortcuts: {
    newTab: 'CommandOrControl+T',
    splitHorizontal: 'CommandOrControl+D',
    splitVertical: 'CommandOrControl+Shift+D',
    closePanel: 'CommandOrControl+W'
  },
  general: {
    shellPath: '',
    startingDirectory: ''
  }
}
