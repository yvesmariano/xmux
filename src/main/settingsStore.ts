import Store from 'electron-store'
import { XmuxSettings, settingsDefaults } from '../shared/settingsTypes'

export const settingsStore = new Store<XmuxSettings>({
  name: 'settings',
  defaults: settingsDefaults,
  schema: {
    appearance: {
      type: 'object',
      properties: {
        theme: { type: 'string' },
        customTheme: { type: 'object' },
        fontFamily: { type: 'string' },
        fontSize: { type: 'number', minimum: 8, maximum: 32 },
        lineHeight: { type: 'number', minimum: 1.0, maximum: 2.0 },
        cursorStyle: { type: 'string', enum: ['block', 'bar', 'underline'] },
        cursorBlink: { type: 'boolean' },
        scrollback: { type: 'number', minimum: 500, maximum: 100000 }
      }
    },
    shortcuts: {
      type: 'object',
      properties: {
        newTab: { type: 'string' },
        splitHorizontal: { type: 'string' },
        splitVertical: { type: 'string' },
        closePanel: { type: 'string' }
      }
    },
    general: {
      type: 'object',
      properties: {
        shellPath: { type: 'string' },
        startingDirectory: { type: 'string' }
      }
    }
  } as any
})
