import React from 'react'
import { useStatusBarItems } from '../../store/statusBarStore'
import styles from './StatusBar.module.css'

const StatusBar: React.FC = () => {
  const leftItems = useStatusBarItems('left')
  const centerItems = useStatusBarItems('center')
  const rightItems = useStatusBarItems('right')

  return (
    <div className={styles.statusBar}>
      <div className={`${styles.section} ${styles.left}`}>
        {leftItems.map((item) => (
          <div key={item.id} className={styles.item}>
            {item.render()}
          </div>
        ))}
      </div>
      <div className={`${styles.section} ${styles.center}`}>
        {centerItems.map((item) => (
          <div key={item.id} className={styles.item}>
            {item.render()}
          </div>
        ))}
      </div>
      <div className={`${styles.section} ${styles.right}`}>
        {rightItems.map((item) => (
          <div key={item.id} className={styles.item}>
            {item.render()}
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatusBar
