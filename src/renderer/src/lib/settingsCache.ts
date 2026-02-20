import type { XmuxSettings, AppearanceConfig } from '../../../shared/settingsTypes'
import { settingsDefaults } from '../../../shared/settingsTypes'

let cache: XmuxSettings = { ...settingsDefaults }
let onAppearanceChange: ((appearance: AppearanceConfig) => void) | null = null

export function registerAppearanceChangeHandler(
  handler: (appearance: AppearanceConfig) => void
): void {
  onAppearanceChange = handler
}

export async function initSettingsCache(): Promise<void> {
  const settings = (await window.electronAPI.settings.get()) as XmuxSettings
  cache = settings

  window.electronAPI.settings.onChange((newSettings) => {
    const appearanceChanged =
      JSON.stringify(cache.appearance) !== JSON.stringify(newSettings.appearance)
    cache = newSettings
    if (appearanceChanged && onAppearanceChange) {
      onAppearanceChange(newSettings.appearance)
    }
  })
}

export function getSettingsSync(): XmuxSettings {
  return cache
}
