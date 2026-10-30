import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
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
      <nav aria-label="Atalhos">
        <ul className={styles.atalhos}>
          <li>
            <a href="#main-content" className={styles.skipLink} accessKey="1">
              Ir para o conteúdo [1]
            </a>
          </li>
          <li>
            <a
              href={telaLarga ? "#navegacao-principal" : "#botao-do-menu"}
              className={styles.skipLink}
              accessKey="2"
            >
              Ir para o menu [2]
            </a>
          </li>
          <li>
            {telaLarga ? (
              <a href="#sidebar-search" className={styles.skipLink} accessKey="3">
                Ir para a busca [3]
              </a>
            ) : (
              <Link
                to={{ pathname: "/pesquisa", hash: "#termo-busca" }}
                className={styles.skipLink}
                accessKey="3"
              >
                Ir para a busca [3]
              </Link>
            )}
          </li>
          <li>
            <a href="#rodape" className={styles.skipLink} accessKey="4">
              Ir para o rodapé [4]
            </a>
          </li>
        </ul>
      </nav>

      {telaLarga ? null : (
        <TopBar
          menuId={ID_DO_MENU}
          menuOpen={menuAberto}
          onOpenMenu={() => setMenuAberto(true)}
        />
      )}

      <div className={styles.columns}>
        {telaLarga ? (
          <header className={styles.aside}>
            <Sidebar />
          </header>
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
