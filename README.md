# xmux

A graphical tmux for macOS — multiple terminal panels in one window, resizable and repositionable via drag-and-drop.

![xmux screenshot placeholder](https://placehold.co/800x500/1a1b26/c0caf5?text=xmux)

## Features

- **Multiple panels** — split any panel horizontally or vertically, infinitely
- **Drag-and-drop** — grab a panel by its header and drop it into any edge or center of another panel to reorder
- **Border resize** — drag the divider between panels to resize
- **Multiple tabs** — independent layouts per tab, like tmux windows
- **Tokyo Night theme** — consistent dark theme across UI and terminal
- **Native macOS feel** — hidden title bar with traffic lights, native PTY via `node-pty`

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd+T` | New tab |
| `Cmd+D` | Split panel horizontally |
| `Cmd+Shift+D` | Split panel vertically |
| `Cmd+W` | Close panel |

## Stack

- **Electron** + **electron-vite**
- **React 18** + **TypeScript**
- **xterm.js** — terminal rendering
- **node-pty** — native PTY
- **react-resizable-panels** — panel resizing
- **@dnd-kit** — drag-and-drop
- **Zustand** + **Immer** — state management

## Getting Started

**Requirements:** Node.js 18+, pnpm

```bash
git clone https://github.com/yvesmariano/xmux.git
cd xmux
pnpm install
node node_modules/electron/install.js   # download Electron binary
pnpm rebuild                            # compile node-pty for Electron ABI
pnpm dev
```

## Build

```bash
pnpm build    # production build
pnpm dist     # generate .dmg (macOS arm64 + x64)
```

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for planned features, including Claude Code integration.

## License

MIT
