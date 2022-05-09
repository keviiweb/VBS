import { useState } from 'react';
import TextLink from '../../components/TextLink'
import styles from './styles.module.css'
import Image from 'next/image';

export default function Header() {
  const [open, setOpen] = useState(false)
  const activeClass = open ? styles.active : ''

  function toggleMobileMenu() {
    const [body] = document.getElementsByTagName('body')
    setOpen((prev) => {
      if (prev) {
        body.classList.remove('no-overflow')
        return false
      }
      body.classList.add('no-overflow')
      return true
    })
  }

  return (
    <header className={`${styles.header} ${activeClass}`}>
      <button
        className={styles.hamburger}
        type="button"
        aria-label="Open or close mobile menu"
        onClick={toggleMobileMenu}
      >
        {open ? (
          <Image src="/images/close.svg" alt="close icon" />
        ) : (
          <Image src="/images/hamburger.svg" alt="hamburger icon" />
        )}
      </button>

      <nav className={styles.navigation}>
        <ul>
          <li>
            <TextLink href="">
              Community
            </TextLink>
          </li>
        </ul>
      </nav>
    </header>
  )
}