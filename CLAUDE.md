# xmux — Claude Code Context

## What it is
A macOS terminal emulator with multiple resizable and repositionable panels via drag-and-drop. Graphical equivalent of tmux.

## Stack
- **Electron 33** + **electron-vite** (build tooling)
- **React 18** + **TypeScript** (renderer)
- **node-pty** (native PTY, compiled for Electron ABI via `@electron/rebuild`)
- **xterm.js v5** (terminal rendering)
- **react-resizable-panels** (border resize)
- **@dnd-kit/core** (drag-and-drop)
- **Zustand + Immer** (global state)
- **lucide-react** (icons)

## Architecture

### Electron Processes
```
Main Process
  ├── ptyManager.ts    — Map<id, IPty>; create/destroy PTYs; stream via webContents.send
  ├── ipcHandlers.ts   — ipcMain.handle (create/resize/destroy) + ipcMain.on (write)
  └── index.ts         — BrowserWindow with titleBarStyle: 'hidden'

Preload
  └── index.ts         — contextBridge exposes window.electronAPI.pty

Renderer (React)
  ├── lib/terminalRegistry.ts  — global Map of xterm instances; survives remounts
  ├── lib/layoutTree.ts        — pure binary split tree (immutable functions)
  ├── store/panelStore.ts      — Zustand: tabs, layout, focus, actions
  └── components/
      ├── PanelLayout     — recursive layout tree renderer
      ├── TerminalPanel   — mounts/moves xterm from registry into container
      ├── PanelHeader     — drag handle + split/close buttons
      ├── DropZone        — drop overlays (5 zones per panel)
      └── TabBar          — tabs with webkit-app-region
```

### Critical decision: terminalRegistry
xterm instances and PTYs live in a Map outside React (`terminalRegistry.ts`).
On remount (layout change), the component moves the xterm DOM into the new
container via `container.appendChild(term.element)` — no PTY recreation.
Actual destruction only happens in `closePanel` / `removeTab`.
**Do not revert this** — it fixes StrictMode race conditions and layout remounting issues.

### Layout Tree
```typescript
type LayoutNode = SplitNode | LeafNode
// SplitNode: { direction, sizes: [number, number], children: [LayoutNode, LayoutNode] }
// LeafNode:  { panelId: string }
```
Pure functions in `layoutTree.ts`: `splitLeaf`, `removePanel`, `swapPanels`, `movePanelToSplit`.

## Commands
```bash
pnpm dev          # development with hot reload
pnpm build        # production build
pnpm rebuild      # recompile node-pty after updating Electron
pnpm dist         # generate .dmg
```

## Keyboard Shortcuts
- `Cmd+T` — new tab
- `Cmd+D` — horizontal split
- `Cmd+Shift+D` — vertical split
- `Cmd+W` — close panel

## Theme
Tokyo Night — CSS variables in `global.css`, xterm theme in `terminalRegistry.ts`.

## Watch Out
- `React.StrictMode` is **intentionally disabled** (native resources + PTY lifecycle)
- `node-pty` requires rebuild when switching Electron versions (`pnpm rebuild`)
- Write IPC uses `ipcMain.on` (not `handle`) to avoid Promise overhead on the hot path
