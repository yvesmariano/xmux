import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'
import { destroyEntry } from '../lib/terminalRegistry'
import {
  LayoutNode,
  LeafNode,
  makeLeaf,
  splitLeaf,
  removePanel,
  swapPanels,
  movePanelToSplit,
  updateSizes,
  findLeafByPanelId,
  allPanelIds
} from '../lib/layoutTree'

export interface Tab {
  id: string
  title: string
  layout: LayoutNode
  focusedPanelId: string
}

interface PanelState {
  tabs: Tab[]
  activeTabId: string

  // Seletores
  activeTab: () => Tab
  getTab: (id: string) => Tab | undefined

  // Ações de aba
  addTab: () => void
  removeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  renameTab: (tabId: string, title: string) => void

  // Ações de painel
  splitPanel: (
    panelId: string,
    direction: 'horizontal' | 'vertical',
    insertAfter?: boolean
  ) => void
  closePanel: (panelId: string) => void
  focusPanel: (panelId: string) => void
  swapPanels: (panelIdA: string, panelIdB: string) => void
  movePanelToZone: (
    sourcePanelId: string,
    targetLeafId: string,
    zone: 'top' | 'bottom' | 'left' | 'right'
  ) => void
  updateSplitSizes: (splitId: string, sizes: [number, number]) => void
}

function makeInitialTab(): Tab {
  const panelId = uuidv4()
  return {
    id: uuidv4(),
    title: 'Terminal 1',
    layout: makeLeaf(panelId),
    focusedPanelId: panelId
  }
}

export const usePanelStore = create<PanelState>()(
  immer((set, get) => {
    const initialTab = makeInitialTab()

    return {
      tabs: [initialTab],
      activeTabId: initialTab.id,

      activeTab: () => {
        const { tabs, activeTabId } = get()
        return tabs.find((t) => t.id === activeTabId)!
      },

      getTab: (id) => get().tabs.find((t) => t.id === id),

      addTab: () => {
        set((state) => {
          const newTab = makeInitialTab()
          newTab.title = `Terminal ${state.tabs.length + 1}`
          state.tabs.push(newTab)
          state.activeTabId = newTab.id
        })
      },

      removeTab: (tabId) => {
        // Destruir todos os terminais da aba antes de remover
        const tab = get().tabs.find((t) => t.id === tabId)
        if (tab) {
          for (const pid of allPanelIds(tab.layout)) destroyEntry(pid)
        }
        set((state) => {
          const idx = state.tabs.findIndex((t) => t.id === tabId)
          if (idx === -1) return
          state.tabs.splice(idx, 1)
          if (state.tabs.length === 0) {
            const newTab = makeInitialTab()
            state.tabs.push(newTab)
            state.activeTabId = newTab.id
          } else if (state.activeTabId === tabId) {
            state.activeTabId = state.tabs[Math.min(idx, state.tabs.length - 1)].id
          }
        })
      },

      setActiveTab: (tabId) => {
        set((state) => {
          state.activeTabId = tabId
        })
      },

      renameTab: (tabId, title) => {
        set((state) => {
          const tab = state.tabs.find((t) => t.id === tabId)
          if (tab) tab.title = title
        })
      },

      splitPanel: (panelId, direction, insertAfter = true) => {
        set((state) => {
          const tab = state.tabs.find((t) => t.id === state.activeTabId)
          if (!tab) return

          const leaf = findLeafByPanelId(tab.layout, panelId)
          if (!leaf) return

          const newPanelId = uuidv4()
          tab.layout = splitLeaf(
            tab.layout,
            leaf.id,
            newPanelId,
            direction,
            insertAfter
          )
          tab.focusedPanelId = newPanelId
        })
      },

      closePanel: (panelId) => {
        // Destruir terminal e PTY imediatamente
        destroyEntry(panelId)

        set((state) => {
          const tab = state.tabs.find((t) => t.id === state.activeTabId)
          if (!tab) return

          const remaining = allPanelIds(tab.layout).filter((id) => id !== panelId)
          const newLayout = removePanel(tab.layout, panelId)
          if (!newLayout) {
            // última janela — fecha a aba
            const idx = state.tabs.findIndex((t) => t.id === state.activeTabId)
            state.tabs.splice(idx, 1)
            if (state.tabs.length === 0) {
              const newTab = makeInitialTab()
              state.tabs.push(newTab)
              state.activeTabId = newTab.id
            } else {
              state.activeTabId = state.tabs[Math.min(idx, state.tabs.length - 1)].id
            }
            return
          }

          tab.layout = newLayout
          if (tab.focusedPanelId === panelId) {
            tab.focusedPanelId = remaining[0] ?? ''
          }
        })
      },

      focusPanel: (panelId) => {
        set((state) => {
          const tab = state.tabs.find((t) => t.id === state.activeTabId)
          if (tab) tab.focusedPanelId = panelId
        })
      },

      swapPanels: (panelIdA, panelIdB) => {
        set((state) => {
          const tab = state.tabs.find((t) => t.id === state.activeTabId)
          if (!tab) return
          tab.layout = swapPanels(tab.layout, panelIdA, panelIdB)
        })
      },

      movePanelToZone: (sourcePanelId, targetLeafId, zone) => {
        set((state) => {
          const tab = state.tabs.find((t) => t.id === state.activeTabId)
          if (!tab) return
          tab.layout = movePanelToSplit(tab.layout, sourcePanelId, targetLeafId, zone)
          tab.focusedPanelId = sourcePanelId
        })
      },

      updateSplitSizes: (splitId, sizes) => {
        set((state) => {
          const tab = state.tabs.find((t) => t.id === state.activeTabId)
          if (!tab) return
          tab.layout = updateSizes(tab.layout, splitId, sizes)
        })
      }
    }
  })
)

// Selector helpers
export const useActiveTab = (): Tab => usePanelStore((s) => s.activeTab())
export const useActiveTabId = (): string => usePanelStore((s) => s.activeTabId)
export const useTabs = (): Tab[] => usePanelStore((s) => s.tabs)

export function useLeafIdForPanel(panelId: string): string | null {
  return usePanelStore((s) => {
    const tab = s.activeTab()
    const leaf = findLeafByPanelId(tab.layout, panelId)
    return leaf ? (leaf as LeafNode).id : null
  })
}
