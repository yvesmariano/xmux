import React from 'react'
import type { GeneralConfig } from '../../../../shared/settingsTypes'
import styles from './Section.module.css'

interface Props {
  general: GeneralConfig
  onChange: (keyPath: string, value: unknown) => void
}

const GeneralSection: React.FC<Props> = ({ general, onChange }) => (
  <div className={styles.section}>
    <h2 className={styles.title}>General</h2>

    <label className={styles.field}>
      <span className={styles.label}>Shell Path</span>
      <input
        className={styles.input}
        type="text"
        value={general.shellPath}
        placeholder="System default"
        onChange={(e) => onChange('general.shellPath', e.target.value)}
      />
      <span className={styles.hint}>Leave empty to use the system default shell</span>
    </label>

    <label className={styles.field}>
      <span className={styles.label}>Starting Directory</span>
      <input
        className={styles.input}
        type="text"
        value={general.startingDirectory}
        placeholder="$HOME"
        onChange={(e) => onChange('general.startingDirectory', e.target.value)}
      />
      <span className={styles.hint}>Leave empty to use $HOME</span>
    </label>
  </div>
)

export default GeneralSection
