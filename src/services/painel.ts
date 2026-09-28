import { USAR_MOCK } from "../config/ambiente";
import type { Painel } from "../types/painel";
import { porcentagemDoPerfil } from "../utils/progressoPerfil";
import { buscarPainelNaApi } from "./api/painel";
import { idDoUsuarioNaApi } from "./autenticacao";
import { ErroDeOrientacao, ErroServicoIndisponivel } from "./erros";
import { simularLatencia } from "./mocks/atraso";
import { painelDoMock } from "./mocks/painel";
import { buscarPerfil, paraRespostas } from "./perfil";

async function dadosDoPainel(
  sinal?: AbortSignal,
): Promise<Omit<Painel, "profileCompleteness">> {
  if (USAR_MOCK) {
    await simularLatencia();

    return painelDoMock();
  }

  const usuarioId = idDoUsuarioNaApi();

  if (usuarioId === null) {
    throw new ErroDeOrientacao(
      "Não conseguimos ligar esta conta ao cadastro da API neste navegador. Entre de novo e tente outra vez.",
    );
  }

  return buscarPainelNaApi(usuarioId, sinal);
}

export async function buscarPainel(sinal?: AbortSignal): Promise<Painel> {
  try {
    const [dados, perfil] = await Promise.all([
      dadosDoPainel(sinal),
      buscarPerfil(),
    ]);

    return {
      ...dados,
      profileCompleteness:
        perfil === null
          ? null
          : porcentagemDoPerfil(paraRespostas(perfil.perfil)),
    };
  } catch (erro) {
    if (
      (erro instanceof DOMException && erro.name === "AbortError") ||
      erro instanceof ErroDeOrientacao ||
      erro instanceof ErroServicoIndisponivel
    ) {
      throw erro;
    }

    throw new Error("Não foi possível carregar o seu painel.");
  }
}
