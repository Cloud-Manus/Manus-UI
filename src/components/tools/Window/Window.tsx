import { ScrollArea } from '@/components/ui/scroll-area';
import styles from './Window.module.scss';

interface WindowProps {
  title: string;
  badge?: string;
  children?: React.ReactNode;
}

export default function Window({ title, badge, children }: WindowProps) {
  return (
    <div className={styles.windowWrapper}>
      <div className={styles.windowHeader}>
        <div className={styles.title}>{title}</div>
        {badge && <div className={styles.badge}>{badge}</div>}
      </div>
      
      <ScrollArea
        className="flex-1 overflow-hidden"
        thumbBg="var(--dark-4)"
      >
        <div className={styles.windowContent}>
        {children}
        </div>
      </ScrollArea>
    </div>
  );
}