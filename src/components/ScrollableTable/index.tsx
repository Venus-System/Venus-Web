import type { ReactNode } from "react";
import styles from "./styles.module.css";

interface ScrollableTableProps {
  children?: ReactNode;
}

function ScrollableTable({ children }: ScrollableTableProps) {
  return (
    <div
      className={styles.container}
      role="region"
      aria-label="Tabela com rolagem horizontal"
      tabIndex={0}
    >
      <table className={styles.table}>{children}</table>
    </div>
  );
}

export default ScrollableTable;
