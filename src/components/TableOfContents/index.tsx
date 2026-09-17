import styles from "./styles.module.css";

export interface TocItem {
  id: string;
  text: string;
}

interface TableOfContentsProps {
  items: TocItem[];
  label: string;
}

function TableOfContents({ items, label }: TableOfContentsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className={styles.nav} aria-label={label}>
      <ol className={styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <a className={styles.link} href={`#${item.id}`}>
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default TableOfContents;
