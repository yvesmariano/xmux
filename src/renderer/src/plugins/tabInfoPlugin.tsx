import React from 'react'
import { registerStatusBarItem } from '../lib/statusBarRegistry'
import { usePanelStore } from '../store/panelStore'

function TabInfo(): React.ReactElement {
  const tabs = usePanelStore((s) => s.tabs)
  const activeTabId = usePanelStore((s) => s.activeTabId)
  const idx = tabs.findIndex((t) => t.id === activeTabId)

  return <span>Tab {idx + 1}/{tabs.length}</span>
}

export function initTabInfoPlugin(): () => void {
  return registerStatusBarItem({
    id: 'builtin:tab-info',
    alignment: 'right',
    priority: 0,
    render: () => <TabInfo />
  })
}
