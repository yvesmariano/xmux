import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import styles from './DropZone.module.css'

export type DropZonePosition = 'top' | 'bottom' | 'left' | 'right' | 'center'

interface DropZoneProps {
  leafId: string
  position: DropZonePosition
  isVisible: boolean
}

const DropZone: React.FC<DropZoneProps> = ({ leafId, position, isVisible }) => {
  const droppableId = `drop:${leafId}:${position}`

  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
    data: { leafId, position }
  })

  if (!isVisible) return null

  return (
    <div
      ref={setNodeRef}
      className={`${styles.dropZone} ${styles[position]} ${isOver ? styles.over : ''}`}
    />
  )
}

export default DropZone
