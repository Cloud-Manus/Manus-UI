import { Link, Outlet } from 'react-router-dom';
import { HomeIcon, ListIcon } from 'lucide-react';
import styles from './MainLayout.module.scss';

const MainLayout = () => {
  return (
    <div className={styles.layoutContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>Manus AI</h1>
          <nav className={styles.nav}>
            <Link to="/" className={styles.navLink}>
              <HomeIcon size={18} />
              <span>Chat</span>
            </Link>
            <Link to="/tasks" className={styles.navLink}>
              <ListIcon size={18} />
              <span>Tasks</span>
            </Link>
          </nav>
        </div>
      </header>
      
      <main className={styles.main}>
        <Outlet />
      </main>
      
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>© {new Date().getFullYear()} Manus AI - AI Assistant</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 