import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/Logo.svg";
import styles from "./styles.module.css";

interface LayoutAdminProps {
  children: ReactNode;
  onSair: () => void;
}

function LayoutAdmin({ children, onSair }: LayoutAdminProps) {
  return (
    <div className={styles.layout}>
      <a href="#conteudo-admin" className={styles.pular}>
        Pular para o conteúdo
      </a>

      <header className={styles.cabecalho}>
        <Link to="/admin/fila" className={styles.marca}>
          <img className={styles.logo} src={logo} alt="" />
          <span className={styles.nomeMarca}>Venus</span>
        </Link>

        <span className={styles.etiqueta}>Área administrativa</span>

        <button type="button" className={styles.sair} onClick={onSair}>
          Sair
        </button>
      </header>

      <main id="conteudo-admin" className={styles.conteudo} tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}

export default LayoutAdmin;
