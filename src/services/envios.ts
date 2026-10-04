import { USAR_MOCK } from "../config/ambiente";
import type { Envio } from "../types/envio";
import { buscarEnviosNaApi } from "./api/envios";
import { idDoUsuarioNaApi } from "./autenticacao";
import { ErroDeOrientacao, ErroServicoIndisponivel } from "./erros";
import { simularLatencia } from "./mocks/atraso";
import { enviosDoMock } from "./mocks/envios";

async function enviosDoUsuario(sinal?: AbortSignal): Promise<Envio[]> {
  if (USAR_MOCK) {
    await simularLatencia();

    return enviosDoMock();
  }

  const usuarioId = idDoUsuarioNaApi();

  if (usuarioId === null) {
    throw new ErroDeOrientacao(
      "Não conseguimos ligar esta conta ao cadastro da API neste navegador. Entre de novo e tente outra vez.",
    );
  }

  return buscarEnviosNaApi(usuarioId, sinal);
}

export async function buscarEnvios(sinal?: AbortSignal): Promise<Envio[]> {
  try {
    return await enviosDoUsuario(sinal);
  } catch (erro) {
    if (
      (erro instanceof DOMException && erro.name === "AbortError") ||
      erro instanceof ErroDeOrientacao ||
      erro instanceof ErroServicoIndisponivel
    ) {
      throw erro;
    }

    throw new Error("Não foi possível carregar os seus envios.");
  }
}
