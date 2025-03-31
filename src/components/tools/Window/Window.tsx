import styles from './Window.module.scss';

interface WindowProps {
  title: string;
  badge?: string;
  children?: React.ReactNode;
  headerClassName?: string;
  contentClassName?: string;
}

export default function Window({ title, badge, children, headerClassName, contentClassName }: WindowProps) {
  return (
    <div className={`${styles.windowWrapper}`}>
      <div className={`${styles.windowHeader} ${headerClassName}`}>
        <div className="font-subtle-medium">{title}</div>
        {badge && <div className={styles.badge}>{badge}</div>}
      </div>      
      <div className={`${styles.windowContent} ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}