import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/Logo.svg";
import styles from "./styles.module.css";

interface LayoutAutenticacaoProps {
  children: ReactNode;
}

function LayoutAutenticacao({ children }: LayoutAutenticacaoProps) {
  return (
    <div className={styles.pagina}>
      <section className={styles.painelFormulario}>
        <Link className={styles.marcaTopo} to="/">
          <img className={styles.logo} src={logo} alt="" />
          <span className={styles.nomeMarca}>Venus</span>
        </Link>

        <div className={styles.conteudo}>{children}</div>
      </section>
      <aside className={styles.painelMarca} aria-hidden="true">
        <span className={styles.marca}>Venus</span>
      </aside>
    </div>
  );
}

export default LayoutAutenticacao;
