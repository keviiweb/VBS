
import Link from 'next/link'
import styles from './styles.module.css'

/**
 * Components
 */
export default function TextLink({ children, onClick, ...props }) {
  function handleClick(e) {
    if (typeof onClick === 'function') {
      e.preventDefault()
      onClick(e)
    }
  }

  return (
    <Link {...props}>
      <a className={styles.link} onClick={handleClick} rel="noopener noreferrer" target="_blank">
        {children}
      </a>
    </Link>
  )
}