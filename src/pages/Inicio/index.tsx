import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../../assets/Logo.svg";
import celular from "../../assets/landing/celular.png";
import ContrastToggle from "../../components/ContrastToggle";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import { useRolagemDaRota } from "../../hooks/useRolagemDaRota";
import { useTelaLarga } from "../../hooks/useTelaLarga";
import { useTituloDaPagina } from "../../hooks/useTituloDaPagina";
import styles from "./styles.module.css";

interface SecaoDoMenu {
  id: string;
  texto: string;
}

const SECOES_DO_MENU: SecaoDoMenu[] = [
  { id: "inicio", texto: "Início" },
  { id: "como-funciona", texto: "Como funciona" },
  { id: "sobre-nos", texto: "Sobre nós" },
];

const ID_DO_MENU = "menu-da-landing";

function Inicio() {
  const { usuario } = useAutenticacao();
  const telaLarga = useTelaLarga();
  const [menuAberto, setMenuAberto] = useState(false);
  const botaoDoMenuRef = useRef<HTMLButtonElement>(null);

  useTituloDaPagina("");
  useRolagemDaRota();

  useEffect(() => {
    setMenuAberto(false);
  }, [telaLarga]);

  function fecharComEsc(evento: KeyboardEvent<HTMLElement>) {
    if (evento.key === "Escape" && menuAberto) {
      setMenuAberto(false);
      botaoDoMenuRef.current?.focus();
    }
  }

  return (
    <div className={styles.pagina}>
      <a className={styles.skipLink} href="#conteudo" accessKey="1">
        Ir para o conteúdo [1]
      </a>

      <header className={styles.cabecalho} onKeyDown={fecharComEsc}>
        <a className={styles.marca} href="#inicio">
          <img className={styles.logo} src={logo} alt="" />
          <span className={styles.nomeDaMarca}>Venus</span>
        </a>

        <button
          ref={botaoDoMenuRef}
          type="button"
          className={styles.botaoMenu}
          aria-label="Menu"
          aria-expanded={menuAberto}
          aria-controls={ID_DO_MENU}
          onClick={() => setMenuAberto((aberto) => !aberto)}
        >
          {menuAberto ? (
            <X className={styles.iconeMenu} aria-hidden="true" />
          ) : (
            <Menu className={styles.iconeMenu} aria-hidden="true" />
          )}
        </button>

        <nav
          id={ID_DO_MENU}
          aria-label="Seções da página"
          className={menuAberto ? `${styles.nav} ${styles.navAberto}` : styles.nav}
        >
          <ul className={styles.menu}>
            {SECOES_DO_MENU.map((secao) => (
              <li key={secao.id}>
                <a
                  className={styles.menuLink}
                  href={`#${secao.id}`}
                  onClick={() => setMenuAberto(false)}
                >
                  {secao.texto}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.acoes}>
          <ContrastToggle className={styles.contraste} />

          {usuario === null ? (
            <Link className={styles.entrar} to="/login">
              Login
            </Link>
          ) : (
            <Link className={styles.entrar} to="/dashboard">
              Meu painel
            </Link>
          )}
        </div>
      </header>

      <main id="conteudo" tabIndex={-1}>
        <section className={styles.inicio} aria-labelledby="inicio">
          <div className={styles.inicioConteudo}>
            <div className={styles.textoDoInicio}>
              <h1 id="inicio" className={styles.titulo} tabIndex={-1}>
                Venus
              </h1>
              <p className={styles.subtitulo}>
                Escaneie. Analise.
                <br />
                Escolha com
                <br />
                confiança.
              </p>
            </div>

            <div className={styles.midia}>
              <img
                className={styles.celular}
                src={celular}
                alt="Celular com a tela de boas-vindas do aplicativo Venus"
                width={591}
                height={693}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Inicio;
