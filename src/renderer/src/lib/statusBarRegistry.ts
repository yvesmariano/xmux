/**
 * Imperative API for registering status bar items.
 * Usable outside React components (e.g. plugin init functions).
 */
import { type StatusBarItemConfig, useStatusBarStore } from '../store/statusBarStore'

export type { StatusBarItemConfig, StatusBarAlignment } from '../store/statusBarStore'

/**
 * Registers a status bar item. Returns a cleanup function that unregisters it.
 */
export function registerStatusBarItem(config: StatusBarItemConfig): () => void {
  useStatusBarStore.getState().register(config)
  return () => useStatusBarStore.getState().unregister(config.id)
}
