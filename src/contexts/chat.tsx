import { createContext, useEffect, useReducer } from "react";
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

type AcaoDoChat =
  | {
      tipo: "trocarDeConta";
      dono: string | null;
      mensagens: MensagemDoChat[];
      conversationId: string | null;
      geracao: string;
    }
  | { tipo: "abrir" }
  | { tipo: "fechar" }
  | { tipo: "enviar"; mensagem: MensagemDoChat; conversationId: string }
  | { tipo: "tentarDeNovo"; conversationId: string }
  | {
      tipo: "respostaChegou";
      geracao: string;
      mensagem: MensagemDoChat;
      conversationId: string;
      expression: ExpressaoDaVeninha;
    }
  | { tipo: "respostaFalhou"; geracao: string; envio: EnvioDoChat }
  | { tipo: "novaConversa"; geracao: string };

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

function reduzirChat(estado: EstadoDoChat, acao: AcaoDoChat): EstadoDoChat {
  switch (acao.tipo) {
    case "trocarDeConta":
      return {
        dono: acao.dono,
        aberto: false,
        mensagens: acao.mensagens,
        conversationId: acao.conversationId,
        expression: "neutra",
        envio: { status: "ocioso" },
        geracao: acao.geracao,
      };
    case "abrir":
      return { ...estado, aberto: true };
    case "fechar":
      return { ...estado, aberto: false };
    case "enviar":
      return {
        ...estado,
        mensagens: [...estado.mensagens, acao.mensagem],
        conversationId: acao.conversationId,
        envio: { status: "esperando" },
      };
    case "tentarDeNovo":
      return {
        ...estado,
        conversationId: acao.conversationId,
        envio: { status: "esperando" },
      };
    case "respostaChegou":
      if (acao.geracao !== estado.geracao) {
        return estado;
      }

      return {
        ...estado,
        mensagens: [...estado.mensagens, acao.mensagem],
        conversationId: acao.conversationId,
        expression: acao.expression,
        envio: { status: "ocioso" },
      };
    case "respostaFalhou":
      if (acao.geracao !== estado.geracao) {
        return estado;
      }

      return { ...estado, envio: acao.envio };
    case "novaConversa":
      return {
        ...estado,
        mensagens: [],
        conversationId: null,
        expression: "neutra",
        envio: { status: "ocioso" },
        geracao: acao.geracao,
      };
  }
}

export const ContextoChat = createContext<ValorDoChat | null>(null);

export function ProvedorChat({ children }: ProvedorChatProps) {
  const { usuario } = useAutenticacao();
  const usuarioId = usuario === null ? null : usuario.id;
  const [estado, despachar] = useReducer(reduzirChat, undefined, estadoInicial);

  useEffect(() => {
    if (estado.dono === usuarioId) {
      return;
    }

    if (estado.dono !== null) {
      apagarConversa(estado.dono);
    }

    const guardada = usuarioId === null ? null : lerConversa(usuarioId);

    despachar({
      tipo: "trocarDeConta",
      dono: usuarioId,
      mensagens: guardada === null ? [] : guardada.mensagens,
      conversationId: guardada === null ? null : guardada.conversationId,
      geracao: crypto.randomUUID(),
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
        despachar({
          tipo: "respostaChegou",
          geracao,
          mensagem: novaMensagem("veninha", resposta.reply),
          conversationId: resposta.conversationId,
          expression: resposta.expression,
        });
      })
      .catch((erro: unknown) => {
        despachar({
          tipo: "respostaFalhou",
          geracao,
          envio: envioComErro(erro),
        });
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

    despachar({
      tipo: "enviar",
      mensagem: novaMensagem("pessoa", limpo),
      conversationId,
    });

    pedirResposta(limpo, conversationId, estado.geracao);
  }

  function tentarDeNovo() {
    const ultima = estado.mensagens[estado.mensagens.length - 1];

    if (ultima === undefined || ultima.author !== "pessoa" || !podeEnviar()) {
      return;
    }

    const conversationId = estado.conversationId ?? crypto.randomUUID();

    despachar({ tipo: "tentarDeNovo", conversationId });

    pedirResposta(ultima.text, conversationId, estado.geracao);
  }

  function novaConversa() {
    if (estado.envio.status === "esperando") {
      return;
    }

    despachar({ tipo: "novaConversa", geracao: crypto.randomUUID() });
  }

  function abrir() {
    despachar({ tipo: "abrir" });
  }

  function fechar() {
    despachar({ tipo: "fechar" });
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
