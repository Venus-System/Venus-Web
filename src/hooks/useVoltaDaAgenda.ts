import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { conectarAgenda } from "../services/agenda";
import {
  enderecoDeVolta,
  lerPedido,
  limparPedido,
} from "../utils/conexaoGoogle";

export type Volta =
  | { status: "conectando" }
  | { status: "conectada" }
  | { status: "erro"; mensagem: string };

export interface EstadoDaVolta {
  volta: Volta;
  returnTo: string;
}

const PAGINA_PADRAO = "/dashboard";

const RECUSADO =
  "Você não autorizou o acesso à agenda. Para conectar, aceite as permissões no Google.";

const PEDIDO_INVALIDO =
  "Este pedido de conexão não vale mais. Comece de novo pela conversa com a Veninha.";

const OUTRA_CONTA =
  "Este pedido de conexão foi feito por outra conta. Comece de novo pela conversa com a Veninha.";

function erroDoPedido(
  recusou: boolean,
  valido: boolean,
  daConta: boolean,
): string | null {
  if (recusou) {
    return RECUSADO;
  }

  if (!valido) {
    return PEDIDO_INVALIDO;
  }

  return daConta ? null : OUTRA_CONTA;
}

export function useVoltaDaAgenda(usuarioId: string | null): EstadoDaVolta {
  const [busca] = useSearchParams();
  const localizacao = useLocation();
  const navigate = useNavigate();
  const iniciouRef = useRef(false);
  const [estado, setEstado] = useState<EstadoDaVolta>({
    volta: { status: "conectando" },
    returnTo: PAGINA_PADRAO,
  });

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

    const erro = erroDoPedido(
      recusou,
      code !== null && pedido !== null && pedido.state === state,
      pedido !== null && pedido.ownerId === usuarioId,
    );

    if (erro !== null || code === null || pedido === null) {
      setEstado({
        volta: { status: "erro", mensagem: erro ?? PEDIDO_INVALIDO },
        returnTo,
      });
      return;
    }

    limparPedido();
    setEstado({ volta: { status: "conectando" }, returnTo });

    conectarAgenda(
      code,
      enderecoDeVolta(),
      pedido.codeVerifier,
      pedido.ownerId,
    )
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
  }, [busca, localizacao.pathname, navigate, usuarioId]);

  return estado;
}
