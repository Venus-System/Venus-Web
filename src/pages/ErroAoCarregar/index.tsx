import Button from "../../components/Button";
import LayoutSimples from "../../components/LayoutSimples";
import { useTituloDaPagina } from "../../hooks/useTituloDaPagina";
import styles from "./styles.module.css";

function ErroAoCarregar() {
  useTituloDaPagina("Erro ao abrir a página");

  return (
    <LayoutSimples>
      <div className={styles.page}>
        <h1 className={styles.title}>Não deu para abrir esta página.</h1>

        <p className={styles.texto} role="alert">
          Pode ser a conexão com a internet ou uma versão nova do site.
          Recarregar a página costuma resolver.
        </p>

        <Button onClick={() => window.location.reload()}>
          Recarregar a página
        </Button>
      </div>
    </LayoutSimples>
  );
}

export default ErroAoCarregar;
