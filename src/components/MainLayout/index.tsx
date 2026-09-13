import type { ReactNode } from "react";
import Footer from "../Footer";
import Sidebar from "../Sidebar";
import styles from "./styles.module.css";

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className={styles.layout}>
      <a href="#main-content" className={styles.skipLink}>
        Pular para o conteúdo
      </a>

      <div className={styles.columns}>
        <div className={styles.aside}>
          <Sidebar />
        </div>

        <main id="main-content" className={styles.content} tabIndex={-1}>
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default MainLayout;
