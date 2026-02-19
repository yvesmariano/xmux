import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'

export function usePty(
  panelId: string,
  terminal: Terminal | null,
  fitAddon: FitAddon | null,
  containerRef: React.RefObject<HTMLDivElement | null>
): void {
  const cleanupRef = useRef<(() => void)[]>([])

  useEffect(() => {
    if (!terminal || !fitAddon) return

    const api = window.electronAPI.pty

    // Tamanho inicial
    const { cols, rows } = terminal

    // Criar sessão PTY
    api.create(panelId, cols, rows).catch(console.error)

    // PTY → xterm (dados de saída)
    const removeDataListener = api.onData(panelId, (data) => {
      terminal.write(data)
    })

    // PTY → xterm (exit)
    const removeExitListener = api.onExit(panelId, (_exitCode) => {
      terminal.write('\r\n\x1b[1;31m[Processo encerrado]\x1b[0m\r\n')
    })

    // xterm → PTY (input do usuário)
    const disposeInput = terminal.onData((data) => {
      api.write(panelId, data)
    })

    // Sync de resize: ResizeObserver → fitAddon.fit() → pty.resize()
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null
    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        try {
          fitAddon.fit()
          const { cols, rows } = terminal
          api.resize(panelId, cols, rows).catch(console.error)
        } catch {
          // terminal pode estar sendo destruído
        }
      }, 16) // debounce de um frame
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    // Cleanup
    cleanupRef.current = [
      removeDataListener,
      removeExitListener,
      () => disposeInput.dispose(),
      () => resizeObserver.disconnect(),
      () => {
        if (resizeTimeout) clearTimeout(resizeTimeout)
      }
    ]

    return () => {
      for (const fn of cleanupRef.current) fn()
      cleanupRef.current = []
      api.destroy(panelId).catch(console.error)
    }
  }, [panelId, terminal, fitAddon, containerRef])
}
