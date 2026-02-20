import React from 'react'
import { Columns3 } from 'lucide-react'
import { registerStatusBarItem } from '../lib/statusBarRegistry'
import { useActiveTab } from '../store/panelStore'
import { allPanelIds } from '../lib/layoutTree'

function PanelCount(): React.ReactElement {
  const tab = useActiveTab()
  const count = allPanelIds(tab.layout).length

  return (
    <>
      <Columns3 size={12} />
      <span>{count}</span>
    </>
  )
}

export function initPanelCountPlugin(): () => void {
  return registerStatusBarItem({
    id: 'builtin:panel-count',
    alignment: 'left',
    priority: 0,
    render: () => <PanelCount />
  })
}
