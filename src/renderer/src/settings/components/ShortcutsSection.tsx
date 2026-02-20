import React, { useState, useCallback, useEffect, useRef } from 'react'
import type { ShortcutConfig } from '../../../../shared/settingsTypes'
import styles from './Section.module.css'

interface Props {
  shortcuts: ShortcutConfig
  onChange: (keyPath: string, value: unknown) => void
}

const shortcutLabels: { key: keyof ShortcutConfig; label: string }[] = [
  { key: 'newTab', label: 'New Tab' },
  { key: 'splitHorizontal', label: 'Split Horizontal' },
  { key: 'splitVertical', label: 'Split Vertical' },
  { key: 'closePanel', label: 'Close Panel' }
]

function keyEventToAccelerator(e: KeyboardEvent): string | null {
  const parts: string[] = []

  if (e.metaKey || e.ctrlKey) parts.push('CommandOrControl')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')

  const key = e.key
  if (['Meta', 'Control', 'Alt', 'Shift'].includes(key)) return null

  if (key.length === 1) {
    parts.push(key.toUpperCase())
  } else {
    const mapped: Record<string, string> = {
      ArrowUp: 'Up',
      ArrowDown: 'Down',
      ArrowLeft: 'Left',
      ArrowRight: 'Right',
      Backspace: 'Backspace',
      Delete: 'Delete',
      Enter: 'Enter',
      Escape: 'Escape',
      Tab: 'Tab'
    }
    parts.push(mapped[key] ?? key)
  }

  return parts.join('+')
}

const ShortcutsSection: React.FC<Props> = ({ shortcuts, onChange }) => {
  const [recording, setRecording] = useState<string | null>(null)
  const recordingRef = useRef<string | null>(null)

  useEffect(() => {
    recordingRef.current = recording
  }, [recording])

  const handleRecord = useCallback(
    (key: string) => {
      if (recording === key) {
        setRecording(null)
        return
      }
      setRecording(key)
    },
    [recording]
  )

  useEffect(() => {
    if (!recording) return

    const handler = (e: KeyboardEvent): void => {
      e.preventDefault()
      e.stopPropagation()

      const accelerator = keyEventToAccelerator(e)
      if (!accelerator) return

      onChange(`shortcuts.${recordingRef.current}`, accelerator)
      setRecording(null)
    }

    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [recording, onChange])

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Shortcuts</h2>

      {shortcutLabels.map(({ key, label }) => (
        <div key={key} className={styles.field}>
          <span className={styles.label}>{label}</span>
          <div className={styles.shortcutRow}>
            <kbd className={styles.kbd}>{shortcuts[key]}</kbd>
            <button
              className={`${styles.recordBtn} ${recording === key ? styles.recordingActive : ''}`}
              onClick={() => handleRecord(key)}
            >
              {recording === key ? 'Press keys...' : 'Record'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ShortcutsSection
