import { NavLink } from "react-router-dom";
import styles from "./styles.module.css";

export interface SegmentedNavItem {
  to: string;
  label: string;
  end?: boolean;
  emBreve?: boolean;
}

interface SegmentedNavProps {
  label: string;
  items: SegmentedNavItem[];
}

function SegmentedNav({ label, items }: SegmentedNavProps) {
  return (
    <nav aria-label={label}>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.to}>
            {item.emBreve === true ? (
              <span className={styles.emBreve}>
                {item.label}
                <span className={styles.selo}>Em breve</span>
              </span>
            ) : (
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.ativo}` : styles.link
                }
              >
                {item.label}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default SegmentedNav;
