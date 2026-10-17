import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import MainLayout from "../../components/MainLayout";
import Veninha from "../../components/Veninha";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import { useChat } from "../../hooks/useChat";
import { useLinkDaAgenda } from "../../hooks/useLinkDaAgenda";
import { useVoltaDaAgenda } from "../../hooks/useVoltaDaAgenda";
import type { Volta } from "../../hooks/useVoltaDaAgenda";
import type { HumorDaVeninha } from "../../types/chat";
import styles from "./styles.module.css";

const HUMOR_DA_VOLTA: Record<Volta["status"], HumorDaVeninha> = {
  conectando: "pensando",
  conectada: "feliz",
  erro: "chorando",
};

function IntegracaoGoogleAgenda() {
  const navigate = useNavigate();
  const { usuario } = useAutenticacao();
  const usuarioId = usuario === null ? null : usuario.id;
  const { abrir } = useChat();
  const estado = useVoltaDaAgenda(usuarioId);
  const linkDeNovo = useLinkDaAgenda(
    estado.volta.status === "erro",
    estado.returnTo,
    usuarioId,
  );

  function voltarParaConversa() {
    abrir();
    navigate(estado.returnTo);
  }

  const { volta } = estado;

  return (
    <MainLayout>
      <div className={styles.page}>
        <div className={styles.veninha}>
          <Veninha
            mood={HUMOR_DA_VOLTA[volta.status]}
            speaking={volta.status === "conectada"}
            mouthOpen={volta.status === "conectada"}
          />
        </div>

        {volta.status === "conectando" ? (
          <>
            <h1 className={styles.title}>
              Conectando a sua <span className={styles.destaque}>agenda.</span>
            </h1>

            <p className={styles.texto} role="status">
              Isso leva só alguns segundos. Não feche esta página.
            </p>
          </>
        ) : null}

        {volta.status === "conectada" ? (
          <>
            <h1 className={styles.title}>
              Agenda <span className={styles.destaque}>conectada.</span>
            </h1>

            <p className={styles.texto} role="status">
              A Veninha já pode montar a sua rotina de cuidados na agenda. É só
              pedir na conversa.
            </p>

            <div className={styles.acoes}>
              <Button onClick={voltarParaConversa}>Voltar para a conversa</Button>
            </div>
          </>
        ) : null}

        {volta.status === "erro" ? (
          <>
            <h1 className={styles.title}>
              Não deu para <span className={styles.destaque}>conectar.</span>
            </h1>

            <p className={styles.texto} role="alert">
              {volta.mensagem}
            </p>

            {linkDeNovo.link.status === "erro" ? (
              <p className={styles.texto} role="alert">
                Não foi possível preparar uma nova conexão. Volte para a
                conversa e tente por lá.
              </p>
            ) : null}

            <div className={styles.acoes}>
              {linkDeNovo.link.status === "pronto" ? (
                <Button href={linkDeNovo.link.url}>Tentar de novo</Button>
              ) : null}

              <Button variant="secondary" onClick={voltarParaConversa}>
                Voltar para a conversa
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default IntegracaoGoogleAgenda;
