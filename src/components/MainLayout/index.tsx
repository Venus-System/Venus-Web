import type { ReactNode } from "react";
import ChatButton from "../ChatButton";
import ChatDrawer from "../ChatDrawer";
import Footer from "../Footer";
import Sidebar from "../Sidebar";
import styles from "./styles.module.css";
import { useChat } from "../../hooks/useChat";
import { useRolagemDaRota } from "../../hooks/useRolagemDaRota";

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const { abrir } = useChat();

  useRolagemDaRota();

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

      <ChatButton onOpen={abrir} />
      <ChatDrawer />

      <Footer />
    </div>
  );
}

export default MainLayout;
