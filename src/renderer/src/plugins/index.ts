import { initPanelCountPlugin } from './panelCountPlugin'
import { initFocusedPanelPlugin } from './focusedPanelPlugin'
import { initTabInfoPlugin } from './tabInfoPlugin'

export function initBuiltinPlugins(): void {
  initPanelCountPlugin()
  initFocusedPanelPlugin()
  initTabInfoPlugin()
}
