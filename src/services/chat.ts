import { URL_IA, USAR_MOCK } from "../config/ambiente";
import type { RespostaDoChat } from "../types/chat";
import { enviarMensagemNaApi } from "./api/chat";
import {
  ErroDeOrientacao,
  ErroMuitasMensagens,
  ErroServicoIndisponivel,
} from "./erros";
import { respostaDoMock } from "./mocks/chat";

export async function enviarMensagem(
  mensagem: string,
  conversationId: string | null,
  sinal?: AbortSignal,
): Promise<RespostaDoChat> {
  try {
    if (USAR_MOCK) {
      return await respostaDoMock(mensagem, conversationId);
    }

    if (URL_IA === "") {
      throw new ErroDeOrientacao(
        "A conversa com a Veninha não está disponível agora.",
      );
    }

    return await enviarMensagemNaApi(mensagem, conversationId, sinal);
  } catch (erro) {
    if (
      (erro instanceof DOMException && erro.name === "AbortError") ||
      erro instanceof ErroDeOrientacao ||
      erro instanceof ErroMuitasMensagens ||
      erro instanceof ErroServicoIndisponivel
    ) {
      throw erro;
    }

    throw new Error("Não foi possível enviar a mensagem para a Veninha.");
  }
}
