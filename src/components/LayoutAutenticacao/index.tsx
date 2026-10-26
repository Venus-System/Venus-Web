import type { ReactNode } from "react";
import logo from "../../assets/Logo.svg";
import ContrastToggle from "../ContrastToggle";
import styles from "./styles.module.css";

interface LayoutAutenticacaoProps {
  children: ReactNode;
  painel?: ReactNode;
}

function LayoutAutenticacao({ children, painel }: LayoutAutenticacaoProps) {
  return (
    <div className={styles.pagina}>
      <div className={styles.painelFormulario}>
        <header className={styles.marcaTopo}>
          <img className={styles.logo} src={logo} alt="" />
          <span className={styles.nomeMarca}>Venus</span>
          <ContrastToggle />
        </header>

        <main className={styles.conteudo} tabIndex={-1}>
          {children}
        </main>
      </div>

      <aside
        className={styles.painelMarca}
        aria-hidden={painel === undefined ? true : undefined}
      >
        {painel === undefined ? null : (
          <div className={styles.painelTexto}>{painel}</div>
        )}

        <span className={styles.marca} aria-hidden="true">
          Venus
        </span>
      </aside>
    </div>
  );
}

export default LayoutAutenticacao;
