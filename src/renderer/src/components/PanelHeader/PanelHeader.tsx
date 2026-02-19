import React, { useCallback } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Bot, GripVertical, PanelLeftOpen, PanelTopOpen, X } from 'lucide-react'
import { usePanelStore } from '../../store/panelStore'
import styles from './PanelHeader.module.css'

interface PanelHeaderProps {
  panelId: string
  isFocused: boolean
}

const PanelHeader: React.FC<PanelHeaderProps> = ({ panelId, isFocused }) => {
  const closePanel = usePanelStore((s) => s.closePanel)
  const focusPanel = usePanelStore((s) => s.focusPanel)
  const splitPanel = usePanelStore((s) => s.splitPanel)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `panel-${panelId}`,
    data: { panelId }
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1
  }

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      closePanel(panelId)
    },
    [panelId, closePanel]
  )

  const handleSplitH = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      splitPanel(panelId, 'horizontal')
    },
    [panelId, splitPanel]
  )

  const handleSplitV = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      splitPanel(panelId, 'vertical')
    },
    [panelId, splitPanel]
  )

  const handleOpenClaude = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      focusPanel(panelId)
      window.electronAPI.pty.write(panelId, 'claude\n')
    },
    [panelId, focusPanel]
  )

  const handleHeaderClick = useCallback(() => {
    focusPanel(panelId)
  }, [panelId, focusPanel])

  return (
    <div
      className={`${styles.header} ${isFocused ? styles.focused : ''} panel-header`}
      style={style}
      onClick={handleHeaderClick}
    >
      {/* Drag handle */}
      <div
        ref={setNodeRef}
        className={styles.dragHandle}
        {...listeners}
        {...attributes}
        title="Drag panel"
      >
        <GripVertical size={12} />
      </div>

      {/* Title */}
      <span className={styles.title}>Terminal</span>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={`${styles.actionBtn} ${styles.claudeBtn}`}
          onClick={handleOpenClaude}
          title="Open Claude Code"
        >
          <Bot size={13} />
        </button>
        <button
          className={styles.actionBtn}
          onClick={handleSplitH}
          title="Split horizontal (Cmd+D)"
        >
          <PanelLeftOpen size={13} />
        </button>
        <button
          className={styles.actionBtn}
          onClick={handleSplitV}
          title="Split vertical (Cmd+Shift+D)"
        >
          <PanelTopOpen size={13} />
        </button>
        <button
          className={`${styles.actionBtn} ${styles.closeBtn}`}
          onClick={handleClose}
          title="Close panel (Cmd+W)"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}

export default PanelHeader
