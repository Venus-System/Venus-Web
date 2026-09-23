import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/Logo.svg";
import { useRolagemDaRota } from "../../hooks/useRolagemDaRota";
import styles from "./styles.module.css";

interface LayoutSimplesProps {
  children: ReactNode;
}

function LayoutSimples({ children }: LayoutSimplesProps) {
  useRolagemDaRota();

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#conteudo">
        Pular para o conteúdo
      </a>

      <header>
        <Link className={styles.brand} to="/">
          <img className={styles.logo} src={logo} alt="" />
          <span>Venus</span>
        </Link>
      </header>

      <main id="conteudo" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}

export default LayoutSimples;
