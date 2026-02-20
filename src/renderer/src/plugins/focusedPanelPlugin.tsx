import React from 'react'
import { Terminal } from 'lucide-react'
import { registerStatusBarItem } from '../lib/statusBarRegistry'
import { useActiveTab } from '../store/panelStore'

function FocusedPanel(): React.ReactElement {
  const tab = useActiveTab()
  const short = tab.focusedPanelId.slice(0, 8)

  return (
    <>
      <Terminal size={12} />
      <span>{short}</span>
    </>
  )
}

export function initFocusedPanelPlugin(): () => void {
  return registerStatusBarItem({
    id: 'builtin:focused-panel',
    alignment: 'left',
    priority: 10,
    render: () => <FocusedPanel />
  })
}
