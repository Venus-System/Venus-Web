import type { ReactNode } from "react";
import logo from "../../assets/Logo.svg";
import styles from "./styles.module.css";

interface LayoutAutenticacaoProps {
  children: ReactNode;
  painel?: ReactNode;
}

function LayoutAutenticacao({ children, painel }: LayoutAutenticacaoProps) {
  return (
    <div className={styles.pagina}>
      <section className={styles.painelFormulario}>
        <div className={styles.marcaTopo}>
          <img className={styles.logo} src={logo} alt="" />
          <span className={styles.nomeMarca}>Venus</span>
        </div>

        <main className={styles.conteudo}>{children}</main>
      </section>

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
