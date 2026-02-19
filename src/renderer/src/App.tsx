import React, { useCallback, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { usePanelStore, useActiveTab } from './store/panelStore'
import PanelLayout from './components/PanelLayout/PanelLayout'
import TabBar from './components/TabBar/TabBar'
import { DropZonePosition } from './components/DropZone/DropZone'
import styles from './App.module.css'

const App: React.FC = () => {
  const activeTab = useActiveTab()
  const addTab = usePanelStore((s) => s.addTab)
  const splitPanel = usePanelStore((s) => s.splitPanel)
  const closePanel = usePanelStore((s) => s.closePanel)
  const swapPanelsAction = usePanelStore((s) => s.swapPanels)
  const movePanelToZone = usePanelStore((s) => s.movePanelToZone)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8 // drag starts only after 8px of movement
      }
    })
  )

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const meta = e.metaKey || e.ctrlKey

      // Cmd+T — new tab
      if (meta && e.key === 't' && !e.shiftKey) {
        e.preventDefault()
        addTab()
        return
      }

      const focusedPanelId = activeTab?.focusedPanelId
      if (!focusedPanelId) return

      // Cmd+D — horizontal split
      if (meta && e.key === 'd' && !e.shiftKey) {
        e.preventDefault()
        splitPanel(focusedPanelId, 'horizontal')
        return
      }

      // Cmd+Shift+D — vertical split
      if (meta && e.key === 'd' && e.shiftKey) {
        e.preventDefault()
        splitPanel(focusedPanelId, 'vertical')
        return
      }

      // Cmd+W — close panel
      if (meta && e.key === 'w') {
        e.preventDefault()
        closePanel(focusedPanelId)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, addTab, splitPanel, closePanel])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (!over) return

      const sourcePanelId = (active.data.current as { panelId: string })?.panelId
      if (!sourcePanelId) return

      const overData = over.data.current as { leafId: string; position: DropZonePosition }
      if (!overData) return

      const { leafId: targetLeafId, position } = overData

      if (position === 'center') {
        // Swap: find the panelId of the target leaf
        const targetPanel = findPanelIdByLeafId(activeTab.layout, targetLeafId)
        if (targetPanel && targetPanel !== sourcePanelId) {
          swapPanelsAction(sourcePanelId, targetPanel)
        }
      } else {
        // Move to edge
        movePanelToZone(sourcePanelId, targetLeafId, position as 'top' | 'bottom' | 'left' | 'right')
      }
    },
    [activeTab, swapPanelsAction, movePanelToZone]
  )

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className={styles.app}>
        <TabBar />
        <div className={styles.content}>
          <PanelLayout />
        </div>
      </div>
      <DragOverlay>
        {/* Minimal drag preview */}
        <div className={styles.dragOverlay}>
          <span>Terminal</span>
        </div>
      </DragOverlay>
    </DndContext>
  )
}

// Helper: finds the panelId of a LeafNode by its node id
function findPanelIdByLeafId(
  node: import('./lib/layoutTree').LayoutNode,
  leafId: string
): string | null {
  if (node.type === 'leaf') {
    return node.id === leafId ? node.panelId : null
  }
  return (
    findPanelIdByLeafId(node.children[0], leafId) ??
    findPanelIdByLeafId(node.children[1], leafId)
  )
}

export default App
