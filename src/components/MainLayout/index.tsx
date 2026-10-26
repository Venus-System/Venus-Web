import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import ChatButton from "../ChatButton";
import ChatDrawer from "../ChatDrawer";
import Footer from "../Footer";
import NavigationDrawer from "../NavigationDrawer";
import Sidebar from "../Sidebar";
import TopBar from "../TopBar";
import styles from "./styles.module.css";
import { useChat } from "../../hooks/useChat";
import { useRolagemDaRota } from "../../hooks/useRolagemDaRota";
import { useTelaLarga } from "../../hooks/useTelaLarga";

interface MainLayoutProps {
  children: ReactNode;
  chatProductName?: string;
}

const ID_DO_MENU = "menu-principal";

function MainLayout({ children, chatProductName }: MainLayoutProps) {
  const { abrir } = useChat();
  const { key } = useLocation();
  const telaLarga = useTelaLarga();
  const [menuAberto, setMenuAberto] = useState(false);

  useRolagemDaRota();

  useEffect(() => {
    setMenuAberto(false);
  }, [key, telaLarga]);

  return (
    <div className={styles.layout}>
      <a href="#main-content" className={styles.skipLink}>
        Pular para o conteúdo
      </a>

      {telaLarga ? null : (
        <TopBar
          menuId={ID_DO_MENU}
          menuOpen={menuAberto}
          onOpenMenu={() => setMenuAberto(true)}
        />
      )}

      <div className={styles.columns}>
        {telaLarga ? (
          <div className={styles.aside}>
            <Sidebar />
          </div>
        ) : (
          <NavigationDrawer
            id={ID_DO_MENU}
            open={menuAberto}
            onClose={() => setMenuAberto(false)}
          />
        )}

        <main id="main-content" className={styles.content} tabIndex={-1}>
          {children}
        </main>
      </div>

      <ChatButton onOpen={abrir} />
      <ChatDrawer productName={chatProductName} />

      <Footer />
    </div>
  );
}

export default MainLayout;
