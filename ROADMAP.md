# xmux — Roadmap

## Shipped
- [x] Multiple terminal panels with horizontal and vertical split
- [x] Border resize via drag (react-resizable-panels)
- [x] Panel drag-and-drop between positions (@dnd-kit)
- [x] Multiple tabs with independent layouts
- [x] Tokyo Night theme
- [x] Keyboard shortcuts (Cmd+T/D/W)
- [x] Hidden titleBar with native macOS traffic lights

---

## Backlog

### Claude Code Integration
- [ ] **Capture output → Claude**: button in PanelHeader that sends the visible xterm
      buffer to a Claude prompt (Anthropic API) in a side panel
- [ ] **Native chat panel**: new panel type (`ChatPanel`) with a chat UI using the
      Anthropic API, integrated into the layout tree just like TerminalPanel
- [ ] **Status badge**: detect when a panel is running `claude` and show the current
      task (reading `~/.claude/`) in the tab title or panel header
- [ ] **Claude Code hooks → notifications**: Claude Code hooks (`PostToolUse`, etc.)
      send events via IPC so xmux can display non-intrusive notifications

### UX / Terminal
- [ ] **Dynamic tab titles**: update title with the running process
      (via OSC 0/2 xterm sequences or process inspection)
- [ ] **In-terminal search**: Cmd+F opens a search bar using xterm's `SearchAddon`
- [ ] **Copy on select**: configure `copyOnSelect` and Cmd+C without shell conflict
- [ ] **Font zoom**: Cmd++ / Cmd+- adjust `fontSize` globally
- [ ] **Shell profiles**: configure shell per panel (zsh, bash, fish, etc.)
- [ ] **Session restore**: persist layout and scrollback to disk, restore on reopen

### Layout
- [ ] **N-ary splits**: support more than 2 children per split node without deep nesting
- [ ] **Preset layouts**: shortcuts to open 2, 3, or 4 panels at once
- [ ] **Save layout as template**: name and reuse panel arrangements

### Distribution
- [ ] **DMG packaging**: configure electron-builder for arm64 + x64
- [ ] **Auto-update**: electron-updater pointing to GitHub Releases
- [ ] **App icon**: create app.icns with visual identity
