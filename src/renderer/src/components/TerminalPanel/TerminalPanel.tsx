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
      // Primeira montagem: abrir xterm neste container
      term.open(container)
    } else {
      // Remontagem após mudança de layout: mover DOM do xterm sem recriar
      container.appendChild(term.element)
    }

    // Ajustar tamanho ao container atual
    requestAnimationFrame(() => {
      try {
        fitAddon.fit()
      } catch {
        // ok
      }
    })

    // Criar PTY na primeira montagem real
    const ptyAlreadyRunning = entry.ptyCleanups.length > 0
    if (!ptyAlreadyRunning) {
      const { cols, rows } = term
      api.create(panelId, cols, rows).catch(console.error)

      const removeData = api.onData(panelId, (data) => term.write(data))
      const removeExit = api.onExit(panelId, () => {
        term.write('\r\n\x1b[1;31m[Processo encerrado]\x1b[0m\r\n')
      })
      const disposeInput = term.onData((data) => api.write(panelId, data))

      entry.ptyCleanups.push(removeData, removeExit, () => disposeInput.dispose())
    }

    // ResizeObserver — reconectar a cada montagem (container pode mudar de tamanho)
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
      // Ao desmontar: apenas desconectar o observer.
      // NÃO destruir o terminal nem o PTY — o registry os mantém vivos.
      ro.disconnect()
      if (resizeTimer) clearTimeout(resizeTimer)
    }
  }, [panelId])

  // Focar o terminal quando isFocused muda
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
