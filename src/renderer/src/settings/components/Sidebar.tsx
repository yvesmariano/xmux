import React from 'react'
import { Settings, Palette, Keyboard } from 'lucide-react'
import styles from './Sidebar.module.css'

export type SettingsSection = 'general' | 'appearance' | 'shortcuts'

interface SidebarProps {
  active: SettingsSection
  onSelect: (section: SettingsSection) => void
}

const sections: { id: SettingsSection; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: 'General', icon: <Settings size={16} /> },
  { id: 'appearance', label: 'Appearance', icon: <Palette size={16} /> },
  { id: 'shortcuts', label: 'Shortcuts', icon: <Keyboard size={16} /> }
]

const Sidebar: React.FC<SidebarProps> = ({ active, onSelect }) => (
  <nav className={styles.sidebar}>
    {sections.map((s) => (
      <button
        key={s.id}
        className={`${styles.item} ${active === s.id ? styles.active : ''}`}
        onClick={() => onSelect(s.id)}
      >
        {s.icon}
        <span>{s.label}</span>
      </button>
    ))}
  </nav>
)

export default Sidebar
