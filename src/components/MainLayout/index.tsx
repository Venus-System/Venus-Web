import type { ReactNode } from "react";
import Footer from "../Footer";
import Sidebar from "../Sidebar";
import styles from "./styles.module.css";

interface MainLayoutUser {
  name: string;
}

interface MainLayoutProps {
  children: ReactNode;
  user?: MainLayoutUser | null;
}

function MainLayout({ children, user = null }: MainLayoutProps) {
  return (
    <div className={styles.layout}>
      <a href="#main-content" className={styles.skipLink}>
        Pular para o conteúdo
      </a>

      <div className={styles.columns}>
        <div className={styles.aside}>
          <Sidebar user={user} />
        </div>

        <main id="main-content" className={styles.content}>
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default MainLayout;
