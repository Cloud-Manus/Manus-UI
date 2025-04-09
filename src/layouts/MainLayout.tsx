import { Outlet } from 'react-router-dom';
import styles from './MainLayout.module.scss';
import { Sidebar } from '../components/ui/sidebar/Sidebar';

const MainLayout = () => {
  return (
    <div className={styles.layoutContainer}>
      <div className="flex h-full">
        <Sidebar />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 