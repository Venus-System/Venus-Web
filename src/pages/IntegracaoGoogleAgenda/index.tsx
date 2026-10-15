import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/Button";
import MainLayout from "../../components/MainLayout";
import Veninha from "../../components/Veninha";
import { useChat } from "../../hooks/useChat";
import { useLinkDaAgenda } from "../../hooks/useLinkDaAgenda";
import { conectarAgenda } from "../../services/agenda";
import type { HumorDaVeninha } from "../../types/chat";
import {
  enderecoDeVolta,
  lerPedido,
  limparPedido,
} from "../../utils/conexaoGoogle";
import styles from "./styles.module.css";

type Volta =
  | { status: "conectando" }
  | { status: "conectada" }
  | { status: "erro"; mensagem: string };

interface EstadoDaVolta {
  volta: Volta;
  returnTo: string;
}

const PAGINA_PADRAO = "/dashboard";

const HUMOR_DA_VOLTA: Record<Volta["status"], HumorDaVeninha> = {
  conectando: "pensando",
  conectada: "feliz",
  erro: "chorando",
};

const RECUSADO =
  "Você não autorizou o acesso à agenda. Para conectar, aceite as permissões no Google.";

const PEDIDO_INVALIDO =
  "Este pedido de conexão não vale mais. Comece de novo pela conversa com a Veninha.";

function IntegracaoGoogleAgenda() {
  const [busca] = useSearchParams();
  const localizacao = useLocation();
  const navigate = useNavigate();
  const { abrir } = useChat();
  const iniciouRef = useRef(false);
  const [estado, setEstado] = useState<EstadoDaVolta>({
    volta: { status: "conectando" },
    returnTo: PAGINA_PADRAO,
  });
  const linkDeNovo = useLinkDaAgenda(
    estado.volta.status === "erro",
    estado.returnTo,
  );

  useEffect(() => {
    if (iniciouRef.current) {
      return;
    }

    iniciouRef.current = true;

    const code = busca.get("code");
    const state = busca.get("state");
    const recusou = busca.get("error") !== null;
    const pedido = lerPedido();
    const returnTo = pedido === null ? PAGINA_PADRAO : pedido.returnTo;

    navigate(localizacao.pathname, { replace: true });

    if (recusou || code === null || pedido === null || pedido.state !== state) {
      setEstado({
        volta: { status: "erro", mensagem: recusou ? RECUSADO : PEDIDO_INVALIDO },
        returnTo,
      });
      return;
    }

    limparPedido();
    setEstado({ volta: { status: "conectando" }, returnTo });

    conectarAgenda(code, enderecoDeVolta(), pedido.codeVerifier)
      .then(() => {
        setEstado({ volta: { status: "conectada" }, returnTo });
      })
      .catch((erro: unknown) => {
        setEstado({
          volta: {
            status: "erro",
            mensagem:
              erro instanceof Error
                ? erro.message
                : "Não foi possível conectar a sua agenda.",
          },
          returnTo,
        });
      });
  }, [busca, localizacao.pathname, navigate]);

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
            speaking={false}
            mouthOpen={false}
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

            <div className={styles.acoes}>
              {linkDeNovo !== null ? (
                <Button href={linkDeNovo}>Tentar de novo</Button>
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
