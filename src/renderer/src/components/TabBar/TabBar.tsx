import React, { useCallback } from 'react'
import { usePanelStore, useTabs, useActiveTabId } from '../../store/panelStore'
import styles from './TabBar.module.css'

const TabBar: React.FC = () => {
  const tabs = useTabs()
  const activeTabId = useActiveTabId()
  const setActiveTab = usePanelStore((s) => s.setActiveTab)
  const addTab = usePanelStore((s) => s.addTab)
  const removeTab = usePanelStore((s) => s.removeTab)

  const handleTabClick = useCallback(
    (tabId: string) => {
      setActiveTab(tabId)
    },
    [setActiveTab]
  )

  const handleTabClose = useCallback(
    (e: React.MouseEvent, tabId: string) => {
      e.stopPropagation()
      removeTab(tabId)
    },
    [removeTab]
  )

  return (
    <div className={`${styles.tabBar} tab-bar`}>
      {/* Space reserved for macOS traffic lights */}
      <div className={styles.trafficLightSpace} style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

      {/* Tabs */}
      <div className={styles.tabs} style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tab"
            className={`${styles.tab} ${tab.id === activeTabId ? styles.active : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            <span className={styles.tabTitle}>{tab.title}</span>
            <button
              className={styles.tabClose}
              onClick={(e) => handleTabClose(e, tab.id)}
              title="Close tab"
            >
              ×
            </button>
          </div>
        ))}

        {/* New tab button */}
        <button
          className={styles.newTabBtn}
          onClick={addTab}
          title="New tab (Cmd+T)"
        >
          +
        </button>
      </div>

      {/* Remaining drag area */}
      <div className={styles.dragArea} style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />
    </div>
  )
}

export default TabBar
