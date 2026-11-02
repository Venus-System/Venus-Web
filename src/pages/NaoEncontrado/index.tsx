import Button from "../../components/Button";
import MainLayout from "../../components/MainLayout";
import Veninha from "../../components/Veninha";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import { useTituloDaPagina } from "../../hooks/useTituloDaPagina";
import styles from "./styles.module.css";

function NaoEncontrado() {
  useTituloDaPagina("Página não encontrada");
  const { usuario } = useAutenticacao();

  return (
    <MainLayout>
      <div className={styles.page}>
        <div className={styles.veninha}>
          <Veninha mood="chorando" speaking={false} mouthOpen={false} />
        </div>

        <h1 className={styles.title}>
          Página não <span className={styles.destaque}>encontrada.</span>
        </h1>

        <p className={styles.texto}>
          O endereço que você abriu não existe na Venus. Ele pode ter mudado ou
          ter sido digitado errado.
        </p>

        <div className={styles.acoes}>
          <Button to="/pesquisa">Buscar produto</Button>
          {usuario === null ? (
            <Button variant="secondary" to="/">
              Voltar ao início
            </Button>
          ) : (
            <Button variant="secondary" to="/dashboard">
              Ir para o dashboard
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default NaoEncontrado;
