import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { enviarMensagem } from "../services/chat";
import { ErroMuitasMensagens } from "../services/erros";
import type {
  AutorDaMensagem,
  ExpressaoDaVeninha,
  MensagemDoChat,
} from "../types/chat";
import {
  apagarConversa,
  guardarConversa,
  lerConversa,
} from "../utils/conversaGuardada";

export type EnvioDoChat =
  | { status: "ocioso" }
  | { status: "esperando" }
  | { status: "erro"; mensagem: string }
  | { status: "limite"; mensagem: string; liberaEm: number | null };

interface EstadoDoChat {
  dono: string | null;
  aberto: boolean;
  mensagens: MensagemDoChat[];
  conversationId: string | null;
  expression: ExpressaoDaVeninha;
  envio: EnvioDoChat;
  geracao: string;
}

interface ValorDoChat {
  aberto: boolean;
  mensagens: MensagemDoChat[];
  expression: ExpressaoDaVeninha;
  envio: EnvioDoChat;
  abrir: () => void;
  fechar: () => void;
  enviar: (texto: string) => void;
  tentarDeNovo: () => void;
  novaConversa: () => void;
}

interface ProvedorChatProps {
  children: ReactNode;
}

function estadoInicial(): EstadoDoChat {
  return {
    dono: null,
    aberto: false,
    mensagens: [],
    conversationId: null,
    expression: "neutra",
    envio: { status: "ocioso" },
    geracao: crypto.randomUUID(),
  };
}

const FALHA = "Não foi possível enviar a mensagem para a Veninha.";
const UM_SEGUNDO = 1000;

function novaMensagem(author: AutorDaMensagem, text: string): MensagemDoChat {
  return {
    id: crypto.randomUUID(),
    author,
    text,
    sentAt: new Date().toISOString(),
  };
}

function envioComErro(erro: unknown): EnvioDoChat {
  if (erro instanceof ErroMuitasMensagens) {
    return {
      status: "limite",
      mensagem: erro.message,
      liberaEm:
        erro.segundos === null ? null : Date.now() + erro.segundos * UM_SEGUNDO,
    };
  }

  return {
    status: "erro",
    mensagem: erro instanceof Error ? erro.message : FALHA,
  };
}

function aindaNoLimite(envio: EnvioDoChat): boolean {
  return (
    envio.status === "limite" &&
    envio.liberaEm !== null &&
    Date.now() < envio.liberaEm
  );
}

export const ContextoChat = createContext<ValorDoChat | null>(null);

export function ProvedorChat({ children }: ProvedorChatProps) {
  const { usuario } = useAutenticacao();
  const usuarioId = usuario === null ? null : usuario.id;
  const [estado, setEstado] = useState<EstadoDoChat>(estadoInicial);

  useEffect(() => {
    if (estado.dono === usuarioId) {
      return;
    }

    if (estado.dono !== null) {
      apagarConversa(estado.dono);
    }

    if (usuarioId === null) {
      setEstado(estadoInicial());
      return;
    }

    const guardada = lerConversa(usuarioId);

    setEstado({
      ...estadoInicial(),
      dono: usuarioId,
      mensagens: guardada === null ? [] : guardada.mensagens,
      conversationId: guardada === null ? null : guardada.conversationId,
    });
  }, [usuarioId, estado.dono]);

  useEffect(() => {
    if (usuarioId === null || estado.dono !== usuarioId) {
      return;
    }

    guardarConversa(usuarioId, {
      mensagens: estado.mensagens,
      conversationId: estado.conversationId,
    });
  }, [usuarioId, estado.dono, estado.mensagens, estado.conversationId]);

  function pedirResposta(
    texto: string,
    conversationId: string,
    geracao: string,
  ) {
    enviarMensagem(texto, conversationId)
      .then((resposta) => {
        setEstado((atual) =>
          atual.geracao !== geracao
            ? atual
            : {
                ...atual,
                mensagens: [
                  ...atual.mensagens,
                  novaMensagem("veninha", resposta.reply),
                ],
                conversationId: resposta.conversationId,
                expression: resposta.expression,
                envio: { status: "ocioso" },
              },
        );
      })
      .catch((erro: unknown) => {
        setEstado((atual) =>
          atual.geracao !== geracao
            ? atual
            : { ...atual, envio: envioComErro(erro) },
        );
      });
  }

  function podeEnviar(): boolean {
    return (
      usuarioId !== null &&
      estado.dono === usuarioId &&
      estado.envio.status !== "esperando" &&
      !aindaNoLimite(estado.envio)
    );
  }

  function enviar(texto: string) {
    const limpo = texto.trim();

    if (limpo === "" || !podeEnviar()) {
      return;
    }

    const conversationId = estado.conversationId ?? crypto.randomUUID();

    setEstado((atual) => ({
      ...atual,
      mensagens: [...atual.mensagens, novaMensagem("pessoa", limpo)],
      conversationId,
      envio: { status: "esperando" },
    }));

    pedirResposta(limpo, conversationId, estado.geracao);
  }

  function tentarDeNovo() {
    const ultima = estado.mensagens[estado.mensagens.length - 1];

    if (ultima === undefined || ultima.author !== "pessoa" || !podeEnviar()) {
      return;
    }

    const conversationId = estado.conversationId ?? crypto.randomUUID();

    setEstado((atual) => ({
      ...atual,
      conversationId,
      envio: { status: "esperando" },
    }));

    pedirResposta(ultima.text, conversationId, estado.geracao);
  }

  function novaConversa() {
    if (estado.envio.status === "esperando") {
      return;
    }

    setEstado((atual) => ({
      ...atual,
      mensagens: [],
      conversationId: null,
      expression: "neutra",
      envio: { status: "ocioso" },
      geracao: crypto.randomUUID(),
    }));
  }

  function abrir() {
    setEstado((atual) => ({ ...atual, aberto: true }));
  }

  function fechar() {
    setEstado((atual) => ({ ...atual, aberto: false }));
  }

  return (
    <ContextoChat.Provider
      value={{
        aberto: estado.aberto,
        mensagens: estado.mensagens,
        expression: estado.expression,
        envio: estado.envio,
        abrir,
        fechar,
        enviar,
        tentarDeNovo,
        novaConversa,
      }}
    >
      {children}
    </ContextoChat.Provider>
  );
}
