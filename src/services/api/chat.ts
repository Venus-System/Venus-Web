import { URL_IA } from "../../config/ambiente";
import type { RespostaDoChat } from "../../types/chat";
import {
  ErroDeOrientacao,
  ErroMuitasMensagens,
  repassarErro,
} from "../erros";
import { comoObjeto, texto } from "./leitura";
import { pedir, verificarResposta } from "./requisicao";

const CAMINHO = "/v1/chat";

function segundosDeEspera(resposta: Response): number | null {
  const segundos = Number(resposta.headers.get("Retry-After"));

  return Number.isFinite(segundos) && segundos > 0 ? Math.ceil(segundos) : null;
}

function lerResposta(valor: unknown): RespostaDoChat | null {
  const dados = comoObjeto(valor);
  const reply = texto(dados.resposta);
  const conversationId = texto(dados.conversation_id);

  if (reply === null || conversationId === null) {
    return null;
  }

  return {
    reply,
    conversationId,
    expression: dados.expressao === "magoada" ? "magoada" : "neutra",
  };
}

export async function enviarMensagemNaApi(
  mensagem: string,
  conversationId: string | null,
  sinal?: AbortSignal,
): Promise<RespostaDoChat> {
  try {
    const corpo =
      conversationId === null
        ? { mensagem }
        : { mensagem, conversation_id: conversationId };

    const resposta = await pedir(`${URL_IA}${CAMINHO}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
      signal: sinal,
    });

    if (resposta.status === 401 || resposta.status === 403) {
      throw new ErroDeOrientacao("Entre de novo para conversar com a Veninha.");
    }

    if (resposta.status === 422) {
      throw new ErroDeOrientacao(
        "A Veninha não conseguiu ler essa mensagem. Confira se ela não está vazia nem longa demais.",
      );
    }

    if (resposta.status === 429) {
      throw new ErroMuitasMensagens(segundosDeEspera(resposta));
    }

    verificarResposta(resposta, CAMINHO);

    const lida = lerResposta(await resposta.json());

    if (lida === null) {
      throw new Error("A resposta da Veninha não veio no formato esperado.");
    }

    return lida;
  } catch (erro) {
    repassarErro(erro, "Não foi possível falar com a Veninha.");
  }
}
