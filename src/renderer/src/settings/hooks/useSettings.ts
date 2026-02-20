import { useState, useEffect, useCallback } from 'react'
import type { XmuxSettings } from '../../../../shared/settingsTypes'
import { settingsDefaults } from '../../../../shared/settingsTypes'

export function useSettings() {
  const [settings, setSettings] = useState<XmuxSettings>(settingsDefaults)

  useEffect(() => {
    window.electronAPI.settings.get().then((s) => {
      setSettings(s as XmuxSettings)
    }).catch(() => {
      // Keep defaults on error
    })

    const cleanup = window.electronAPI.settings.onChange((s) => {
      setSettings(s)
    })

    return cleanup
  }, [])

  const setSetting = useCallback((keyPath: string, value: unknown) => {
    window.electronAPI.settings.set(keyPath, value)
  }, [])

  const resetAll = useCallback(() => {
    window.electronAPI.settings.reset()
  }, [])

  return { settings, setSetting, resetAll }
}
