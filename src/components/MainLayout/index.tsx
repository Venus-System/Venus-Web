import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import ChatButton from "../ChatButton";
import ChatDrawer from "../ChatDrawer";
import Footer from "../Footer";
import Sidebar from "../Sidebar";
import TopBar from "../TopBar";
import styles from "./styles.module.css";
import { useChat } from "../../hooks/useChat";
import { useRolagemDaRota } from "../../hooks/useRolagemDaRota";
import { useTravaDeRolagem } from "../../hooks/useTravaDeRolagem";

interface MainLayoutProps {
  children: ReactNode;
  chatProductName?: string;
}

const ID_DO_MENU = "menu-principal";
const TELA_LARGA = "(min-width: 64rem)";

function MainLayout({ children, chatProductName }: MainLayoutProps) {
  const { abrir } = useChat();
  const { pathname } = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);
  const botaoDoMenuRef = useRef<HTMLButtonElement>(null);
  const fecharDoMenuRef = useRef<HTMLButtonElement>(null);

  useRolagemDaRota();
  useTravaDeRolagem(menuAberto);

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  useEffect(() => {
    const telaLarga = window.matchMedia(TELA_LARGA);

    function aoMudar() {
      if (telaLarga.matches) {
        setMenuAberto(false);
      }
    }

    telaLarga.addEventListener("change", aoMudar);

    return () => telaLarga.removeEventListener("change", aoMudar);
  }, []);

  useEffect(() => {
    if (!menuAberto) {
      return;
    }

    fecharDoMenuRef.current?.focus();

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setMenuAberto(false);
        botaoDoMenuRef.current?.focus();
      }
    }

    document.addEventListener("keydown", aoTeclar);

    return () => document.removeEventListener("keydown", aoTeclar);
  }, [menuAberto]);

  function fecharMenu() {
    setMenuAberto(false);
    botaoDoMenuRef.current?.focus();
  }

  return (
    <div className={styles.layout}>
      <a href="#main-content" className={styles.skipLink}>
        Pular para o conteúdo
      </a>

      <TopBar
        menuId={ID_DO_MENU}
        menuOpen={menuAberto}
        buttonRef={botaoDoMenuRef}
        onOpenMenu={() => setMenuAberto(true)}
      />

      <div className={styles.columns}>
        {menuAberto ? (
          <button
            type="button"
            className={styles.fundo}
            onClick={fecharMenu}
            tabIndex={-1}
            aria-label="Fechar menu"
          />
        ) : null}

        <div
          id={ID_DO_MENU}
          className={menuAberto ? `${styles.aside} ${styles.aberto}` : styles.aside}
        >
          <button
            ref={fecharDoMenuRef}
            type="button"
            className={styles.fechar}
            onClick={fecharMenu}
          >
            <X className={styles.fecharIcone} aria-hidden="true" />
            Fechar menu
          </button>

          <Sidebar />
        </div>

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
