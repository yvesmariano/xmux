import React, { useState } from 'react'
import { useSettings } from './settings/hooks/useSettings'
import Sidebar, { SettingsSection } from './settings/components/Sidebar'
import GeneralSection from './settings/components/GeneralSection'
import AppearanceSection from './settings/components/AppearanceSection'
import ShortcutsSection from './settings/components/ShortcutsSection'
import styles from './SettingsApp.module.css'

const SettingsApp: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general')
  const { settings, setSetting, resetAll } = useSettings()

  return (
    <div className={styles.root}>
      <div className={styles.titleBar}>
        <span className={styles.titleText}>Settings</span>
      </div>
      <div className={styles.body}>
        <Sidebar active={activeSection} onSelect={setActiveSection} />
        <div className={styles.content}>
          {activeSection === 'general' && (
            <GeneralSection general={settings.general} onChange={setSetting} />
          )}
          {activeSection === 'appearance' && (
            <AppearanceSection appearance={settings.appearance} onChange={setSetting} />
          )}
          {activeSection === 'shortcuts' && (
            <ShortcutsSection shortcuts={settings.shortcuts} onChange={setSetting} />
          )}
          <div className={styles.footer}>
            <button className={styles.resetBtn} onClick={resetAll}>
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsApp
