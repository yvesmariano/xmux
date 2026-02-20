import { create } from 'zustand'
import { useMemo, type ReactNode } from 'react'

export type StatusBarAlignment = 'left' | 'center' | 'right'

export interface StatusBarItemConfig {
  id: string
  alignment: StatusBarAlignment
  priority?: number
  render: () => ReactNode
}

interface StatusBarState {
  items: StatusBarItemConfig[]
  register: (item: StatusBarItemConfig) => void
  unregister: (id: string) => void
}

export const useStatusBarStore = create<StatusBarState>()((set) => ({
  items: [],

  register: (item) =>
    set((state) => {
      const idx = state.items.findIndex((i) => i.id === item.id)
      if (idx !== -1) {
        const next = [...state.items]
        next[idx] = item
        return { items: next }
      }
      return { items: [...state.items, item] }
    }),

  unregister: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id)
    }))
}))

/** Hook: returns items for a given alignment, sorted by priority (ascending) */
export function useStatusBarItems(alignment: StatusBarAlignment): StatusBarItemConfig[] {
  const items = useStatusBarStore((s) => s.items)
  return useMemo(
    () =>
      items
        .filter((i) => i.alignment === alignment)
        .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0)),
    [items, alignment]
  )
}
