import { USAR_MOCK } from "../config/ambiente";
import type { PaginaDoHistorico } from "../types/historico";
import { buscarHistoricoNaApi } from "./api/historico";
import { garantirIdDoUsuarioNaApi } from "./autenticacao";
import {
  ErroDeOrientacao,
  ErroServicoIndisponivel,
  repassarErro,
} from "./erros";
import { simularLatencia } from "./mocks/atraso";
import { historicoDoMock } from "./mocks/historico";

const TAMANHO_DA_PAGINA = 20;

async function paginaDoHistorico(
  pagina: number,
  sinal?: AbortSignal,
): Promise<PaginaDoHistorico> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();

      return historicoDoMock(pagina, TAMANHO_DA_PAGINA);
    }

    const usuarioId = await garantirIdDoUsuarioNaApi();

    if (usuarioId === null) {
      throw new ErroDeOrientacao(
        "Não conseguimos ligar esta conta ao cadastro da API neste navegador. Entre de novo e tente outra vez.",
      );
    }

    return await buscarHistoricoNaApi(
      usuarioId,
      pagina,
      TAMANHO_DA_PAGINA,
      sinal,
    );
  } catch (erro) {
    repassarErro(erro, "Não foi possível carregar o seu histórico.");
  }
}

export async function buscarHistorico(
  pagina: number,
  sinal?: AbortSignal,
): Promise<PaginaDoHistorico> {
  try {
    return await paginaDoHistorico(pagina, sinal);
  } catch (erro) {
    if (
      (erro instanceof DOMException && erro.name === "AbortError") ||
      erro instanceof ErroDeOrientacao ||
      erro instanceof ErroServicoIndisponivel
    ) {
      throw erro;
    }

    throw new Error("Não foi possível carregar o seu histórico.");
  }
}
