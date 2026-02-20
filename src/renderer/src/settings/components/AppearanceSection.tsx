import React, { useCallback, useRef } from 'react'
import type { AppearanceConfig } from '../../../../shared/settingsTypes'
import type { TerminalTheme } from '../../../../shared/themes'
import { themes, themeNames, resolveTheme } from '../../../../shared/themes'
import { Pipette } from 'lucide-react'
import styles from './Section.module.css'

interface Props {
  appearance: AppearanceConfig
  onChange: (keyPath: string, value: unknown) => void
}

const colorKeys: { key: keyof TerminalTheme; label: string }[] = [
  { key: 'background', label: 'BG' },
  { key: 'foreground', label: 'FG' },
  { key: 'cursor', label: 'Cur' },
  { key: 'black', label: 'Blk' },
  { key: 'red', label: 'Red' },
  { key: 'green', label: 'Grn' },
  { key: 'yellow', label: 'Yel' },
  { key: 'blue', label: 'Blu' },
  { key: 'magenta', label: 'Mag' },
  { key: 'cyan', label: 'Cyn' },
  { key: 'white', label: 'Wht' },
  { key: 'brightBlack', label: 'B.Blk' },
  { key: 'brightRed', label: 'B.Red' },
  { key: 'brightGreen', label: 'B.Grn' },
  { key: 'brightYellow', label: 'B.Yel' },
  { key: 'brightBlue', label: 'B.Blu' },
  { key: 'brightMagenta', label: 'B.Mag' },
  { key: 'brightCyan', label: 'B.Cyn' },
  { key: 'brightWhite', label: 'B.Wht' }
]

const AppearanceSection: React.FC<Props> = ({ appearance, onChange }) => {
  const activeTheme = resolveTheme(appearance.theme, appearance.customTheme)
  const colorInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const handleColorChange = useCallback(
    (key: keyof TerminalTheme, color: string) => {
      // Build the new custom theme: start from current active theme, override the color
      const base =
        appearance.theme === 'Custom' && appearance.customTheme
          ? appearance.customTheme
          : { ...activeTheme }
      const updated: TerminalTheme = { ...base, [key]: color }

      // Sync cursorAccent with background, selectionForeground with foreground
      if (key === 'background') updated.cursorAccent = color
      if (key === 'foreground' && !appearance.customTheme?.selectionForeground) {
        updated.selectionForeground = color
      }

      onChange('appearance.customTheme', updated)
      if (appearance.theme !== 'Custom') {
        onChange('appearance.theme', 'Custom')
      }
    },
    [appearance, activeTheme, onChange]
  )

  const openColorPicker = useCallback((key: string) => {
    colorInputRefs.current[key]?.click()
  }, [])

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Appearance</h2>

      <div className={styles.field}>
        <span className={styles.label}>Theme</span>
        <div className={styles.themeGrid}>
          {themeNames.map((name) => {
            const t = themes[name]
            const isActive = appearance.theme === name
            return (
              <button
                key={name}
                className={`${styles.themeCard} ${isActive ? styles.themeCardActive : ''}`}
                onClick={() => onChange('appearance.theme', name)}
              >
                <div className={styles.themePreview} style={{ background: t.background }}>
                  <span style={{ color: t.foreground }}>ab</span>
                  <span style={{ color: t.red }}>c</span>
                  <span style={{ color: t.green }}>d</span>
                  <span style={{ color: t.blue }}>e</span>
                  <span style={{ color: t.yellow }}>f</span>
                </div>
                <span className={styles.themeName}>{name}</span>
              </button>
            )
          })}
          {/* Custom theme card */}
          <button
            className={`${styles.themeCard} ${appearance.theme === 'Custom' ? styles.themeCardActive : ''}`}
            onClick={() => {
              if (appearance.theme !== 'Custom') {
                // Initialize custom theme from current theme before switching
                onChange('appearance.customTheme', { ...activeTheme })
                onChange('appearance.theme', 'Custom')
              }
            }}
          >
            <div
              className={styles.themePreview}
              style={{
                background: appearance.customTheme?.background ?? activeTheme.background
              }}
            >
              <Pipette size={16} style={{ color: appearance.customTheme?.foreground ?? activeTheme.foreground }} />
            </div>
            <span className={styles.themeName}>Custom</span>
          </button>
        </div>

        <span className={styles.label} style={{ marginTop: 8 }}>Colors</span>
        <div className={styles.colorEditor}>
          {colorKeys.map(({ key, label }) => (
            <div key={key} className={styles.colorCell}>
              <button
                className={styles.colorDot}
                style={{ background: activeTheme[key] as string }}
                onClick={() => openColorPicker(key)}
                title={label}
              />
              <input
                ref={(el) => { colorInputRefs.current[key] = el }}
                type="color"
                className={styles.hiddenColorInput}
                value={activeTheme[key] as string}
                onChange={(e) => handleColorChange(key, e.target.value)}
              />
              <span className={styles.colorLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Font Family</span>
        <input
          className={styles.input}
          type="text"
          value={appearance.fontFamily}
          onChange={(e) => onChange('appearance.fontFamily', e.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Font Size</span>
        <input
          className={styles.inputSmall}
          type="number"
          min={8}
          max={32}
          value={appearance.fontSize}
          onChange={(e) => onChange('appearance.fontSize', Number(e.target.value))}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Line Height</span>
        <input
          className={styles.inputSmall}
          type="number"
          min={1.0}
          max={2.0}
          step={0.1}
          value={appearance.lineHeight}
          onChange={(e) => onChange('appearance.lineHeight', Number(e.target.value))}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Cursor Style</span>
        <select
          className={styles.select}
          value={appearance.cursorStyle}
          onChange={(e) => onChange('appearance.cursorStyle', e.target.value)}
        >
          <option value="block">Block</option>
          <option value="bar">Bar</option>
          <option value="underline">Underline</option>
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Cursor Blink</span>
        <input
          type="checkbox"
          checked={appearance.cursorBlink}
          onChange={(e) => onChange('appearance.cursorBlink', e.target.checked)}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Scrollback Lines</span>
        <input
          className={styles.inputSmall}
          type="number"
          min={500}
          max={100000}
          step={500}
          value={appearance.scrollback}
          onChange={(e) => onChange('appearance.scrollback', Number(e.target.value))}
        />
      </label>
    </div>
  )
}

export default AppearanceSection
