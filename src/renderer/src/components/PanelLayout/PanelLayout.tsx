import React, { useCallback } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useDndContext } from '@dnd-kit/core'
import { LayoutNode, SplitNode, LeafNode } from '../../lib/layoutTree'
import { usePanelStore } from '../../store/panelStore'
import TerminalPanel from '../TerminalPanel/TerminalPanel'
import PanelHeader from '../PanelHeader/PanelHeader'
import DropZone, { DropZonePosition } from '../DropZone/DropZone'
import styles from './PanelLayout.module.css'

interface LeafRendererProps {
  node: LeafNode
  focusedPanelId: string
  isDragging: boolean
}

const DROP_POSITIONS: DropZonePosition[] = ['top', 'bottom', 'left', 'right', 'center']

const LeafRenderer: React.FC<LeafRendererProps> = ({ node, focusedPanelId, isDragging }) => {
  const isFocused = node.panelId === focusedPanelId

  return (
    <div className={styles.leafContainer}>
      <PanelHeader panelId={node.panelId} isFocused={isFocused} />
      <div className={styles.terminalWrapper}>
        <TerminalPanel panelId={node.panelId} isFocused={isFocused} />

        {/* Drop zones visíveis apenas durante drag */}
        {isDragging && DROP_POSITIONS.map((pos) => (
          <DropZone
            key={pos}
            leafId={node.id}
            position={pos}
            isVisible={isDragging}
          />
        ))}
      </div>
    </div>
  )
}

interface SplitRendererProps {
  node: SplitNode
  focusedPanelId: string
  isDragging: boolean
  onResize: (splitId: string, sizes: [number, number]) => void
}

const SplitRenderer: React.FC<SplitRendererProps> = ({
  node,
  focusedPanelId,
  isDragging,
  onResize
}) => {
  const handleResize = useCallback(
    (sizes: number[]) => {
      onResize(node.id, [sizes[0], sizes[1]] as [number, number])
    },
    [node.id, onResize]
  )

  return (
    <PanelGroup
      direction={node.direction}
      onLayout={handleResize}
      className={styles.panelGroup}
    >
      <Panel defaultSize={node.sizes[0]} minSize={10}>
        <LayoutRenderer
          node={node.children[0]}
          focusedPanelId={focusedPanelId}
          isDragging={isDragging}
          onResize={onResize}
        />
      </Panel>
      <PanelResizeHandle className={styles.resizeHandle} />
      <Panel defaultSize={node.sizes[1]} minSize={10}>
        <LayoutRenderer
          node={node.children[1]}
          focusedPanelId={focusedPanelId}
          isDragging={isDragging}
          onResize={onResize}
        />
      </Panel>
    </PanelGroup>
  )
}

interface LayoutRendererProps {
  node: LayoutNode
  focusedPanelId: string
  isDragging: boolean
  onResize: (splitId: string, sizes: [number, number]) => void
}

const LayoutRenderer: React.FC<LayoutRendererProps> = ({
  node,
  focusedPanelId,
  isDragging,
  onResize
}) => {
  if (node.type === 'leaf') {
    return (
      <LeafRenderer
        node={node}
        focusedPanelId={focusedPanelId}
        isDragging={isDragging}
      />
    )
  }

  return (
    <SplitRenderer
      node={node}
      focusedPanelId={focusedPanelId}
      isDragging={isDragging}
      onResize={onResize}
    />
  )
}

const PanelLayout: React.FC = () => {
  const activeTab = usePanelStore((s) => s.activeTab())
  const updateSplitSizes = usePanelStore((s) => s.updateSplitSizes)
  const { active } = useDndContext()

  const isDragging = active !== null

  const handleResize = useCallback(
    (splitId: string, sizes: [number, number]) => {
      updateSplitSizes(splitId, sizes)
    },
    [updateSplitSizes]
  )

  if (!activeTab) return null

  return (
    <div className={styles.root}>
      <LayoutRenderer
        node={activeTab.layout}
        focusedPanelId={activeTab.focusedPanelId}
        isDragging={isDragging}
        onResize={handleResize}
      />
    </div>
  )
}

export default PanelLayout
