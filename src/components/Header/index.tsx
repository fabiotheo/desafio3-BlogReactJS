import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link href="/">
          <img
            src="/images/spacetraveling-logo.svg"
            alt="spacetraveling logo"
          />
        </Link>
      </div>
    </header>
  );
}
