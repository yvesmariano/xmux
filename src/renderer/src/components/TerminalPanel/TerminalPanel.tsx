import React, { useRef, useEffect, useCallback } from 'react'
import { getOrCreate } from '../../lib/terminalRegistry'
import { usePanelStore } from '../../store/panelStore'
import '@xterm/xterm/css/xterm.css'
import styles from './TerminalPanel.module.css'

interface TerminalPanelProps {
  panelId: string
  isFocused: boolean
}

const TerminalPanel: React.FC<TerminalPanelProps> = ({ panelId, isFocused }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const focusPanel = usePanelStore((s) => s.focusPanel)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const entry = getOrCreate(panelId)
    const { term, fitAddon } = entry
    const api = window.electronAPI.pty

    if (!term.element) {
      // First mount: open xterm in this container
      term.open(container)
    } else {
      // Remount after layout change: move xterm DOM without recreating
      container.appendChild(term.element)
    }

    // Fit to current container size
    requestAnimationFrame(() => {
      try {
        fitAddon.fit()
      } catch {
        // ok
      }
    })

    // Create PTY on first real mount
    const ptyAlreadyRunning = entry.ptyCleanups.length > 0
    if (!ptyAlreadyRunning) {
      const { cols, rows } = term
      api.create(panelId, cols, rows).catch(console.error)

      const removeData = api.onData(panelId, (data) => term.write(data))
      const removeExit = api.onExit(panelId, () => {
        term.write('\r\n\x1b[1;31m[Process exited]\x1b[0m\r\n')
      })
      const disposeInput = term.onData((data) => api.write(panelId, data))

      entry.ptyCleanups.push(removeData, removeExit, () => disposeInput.dispose())
    }

    // ResizeObserver — reconnect on each mount (container may change size)
    let resizeTimer: ReturnType<typeof setTimeout> | null = null
    const ro = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        try {
          fitAddon.fit()
          api.resize(panelId, term.cols, term.rows).catch(console.error)
        } catch {
          // ok
        }
      }, 16)
    })
    ro.observe(container)

    return () => {
      // On unmount: only disconnect the observer.
      // Do NOT destroy the terminal or PTY — the registry keeps them alive.
      ro.disconnect()
      if (resizeTimer) clearTimeout(resizeTimer)
    }
  }, [panelId])

  // Focus terminal when isFocused changes
  useEffect(() => {
    if (isFocused) {
      getOrCreate(panelId).term.focus()
    }
  }, [isFocused, panelId])

  const handleClick = useCallback(() => {
    focusPanel(panelId)
    getOrCreate(panelId).term.focus()
  }, [panelId, focusPanel])

  return (
    <div
      className={`${styles.terminalPanel} ${isFocused ? styles.focused : ''}`}
      onClick={handleClick}
    >
      <div ref={containerRef} className={styles.xtermContainer} />
    </div>
  )
}

export default TerminalPanel
