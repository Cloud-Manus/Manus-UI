import { Link, Outlet } from 'react-router-dom';
import { HomeIcon, ListIcon } from 'lucide-react';
import styles from './MainLayout.module.scss';

const MainLayout = () => {
  return (
    <div className={styles.layoutContainer}>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout; 