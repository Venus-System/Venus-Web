import { USAR_MOCK } from "../config/ambiente";
import type {
  AprovacaoCandidato,
  Candidato,
  CandidatoResumo,
  CatalogoDaRevisao,
  FiltroFila,
  RecusaCandidato,
  ResultadoAprovacao,
  SessaoAdmin,
} from "../types/admin";
import {
  guardarSessaoAdmin,
  lerSessaoAdmin,
  limparSessaoAdmin,
} from "../utils/sessaoAdmin";
import {
  aprovarNaApi,
  buscarCatalogoDaRevisaoNaApi,
  buscarScanNaApi,
  entrarComoAdminNaApi,
  listarScansNaApi,
  recusarNaApi,
  sincronizarNaApi,
} from "./api/admin";
import { lerListaDeScans, lerScan, paraResumo } from "./api/scan";
import {
  ErroCandidatoNaoEncontrado,
  ErroCredenciaisInvalidas,
  ErroRevisaoEmConflito,
  ErroRevisaoInvalida,
  ErroSemPermissaoParaDecidir,
  ErroServicoIndisponivel,
  ErroSessaoAdminExpirada,
} from "./erros";
import { simularLatencia } from "./mocks/atraso";
import { entrarComoAdminNoMock } from "./mocks/admin";
import {
  aprovarNoMock,
  buscarPendenteDoMock,
  catalogoDaRevisaoDoMock,
  listarPendentesDoMock,
  sincronizarNoMock,
  tirarDaFilaNoMock,
} from "./mocks/fila";

export function sessaoAdminAtual(): SessaoAdmin | null {
  return lerSessaoAdmin();
}

export async function entrarComoAdmin(
  email: string,
  senha: string,
): Promise<SessaoAdmin> {
  try {
    let sessao: SessaoAdmin;

    if (USAR_MOCK) {
      await simularLatencia();
      sessao = entrarComoAdminNoMock(email, senha);
    } else {
      sessao = await entrarComoAdminNaApi(email.trim(), senha);
    }

    guardarSessaoAdmin(sessao);

    return sessao;
  } catch (erro) {
    if (
      erro instanceof ErroCredenciaisInvalidas ||
      erro instanceof ErroServicoIndisponivel
    ) {
      throw erro;
    }

    throw new Error("Não foi possível entrar agora. Tente de novo em instantes.");
  }
}

export async function sairComoAdmin(): Promise<void> {
  limparSessaoAdmin();
}

function ehCancelamento(erro: unknown): boolean {
  return erro instanceof DOMException && erro.name === "AbortError";
}

function repassarOuTraduzir(erro: unknown, mensagem: string): never {
  if (
    ehCancelamento(erro) ||
    erro instanceof ErroSessaoAdminExpirada ||
    erro instanceof ErroCandidatoNaoEncontrado ||
    erro instanceof ErroServicoIndisponivel ||
    erro instanceof ErroRevisaoInvalida ||
    erro instanceof ErroRevisaoEmConflito ||
    erro instanceof ErroSemPermissaoParaDecidir
  ) {
    throw erro;
  }

  throw new Error(mensagem);
}

function exigirSessaoNoMock(): void {
  if (lerSessaoAdmin() === null) {
    throw new ErroSessaoAdminExpirada();
  }
}

function exigirPapelQueDecideNoMock(): void {
  exigirSessaoNoMock();

  if (lerSessaoAdmin()?.admin.role === "analyst") {
    throw new ErroSemPermissaoParaDecidir();
  }
}

async function candidatosPendentes(sinal?: AbortSignal): Promise<Candidato[]> {
  if (USAR_MOCK) {
    await simularLatencia();
    exigirSessaoNoMock();

    return listarPendentesDoMock();
  }

  return lerListaDeScans(await listarScansNaApi(sinal));
}

export async function listarPendentes(
  filtro: FiltroFila,
  sinal?: AbortSignal,
): Promise<CandidatoResumo[]> {
  try {
    const candidatos = await candidatosPendentes(sinal);

    return candidatos
      .filter(
        (candidato) =>
          filtro.origin === null || candidato.origin === filtro.origin,
      )
      .map(paraResumo);
  } catch (erro) {
    return repassarOuTraduzir(erro, "Não foi possível carregar a fila.");
  }
}

export async function buscarPendente(
  id: string,
  sinal?: AbortSignal,
): Promise<Candidato> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();
      exigirSessaoNoMock();

      return buscarPendenteDoMock(id);
    }

    const candidato = lerScan(await buscarScanNaApi(id, sinal));

    if (candidato === null) {
      throw new Error("O produto pendente não veio no formato esperado.");
    }

    return candidato;
  } catch (erro) {
    return repassarOuTraduzir(erro, "Não foi possível abrir este produto.");
  }
}

export async function buscarCatalogoDaRevisao(
  sinal?: AbortSignal,
): Promise<CatalogoDaRevisao> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();

      return catalogoDaRevisaoDoMock();
    }

    return await buscarCatalogoDaRevisaoNaApi(sinal);
  } catch (erro) {
    return repassarOuTraduzir(
      erro,
      "Não foi possível carregar as marcas e categorias.",
    );
  }
}

export async function aprovarPendente(
  id: string,
  aprovacao: AprovacaoCandidato,
): Promise<ResultadoAprovacao> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();
      exigirPapelQueDecideNoMock();

      return aprovarNoMock(id, aprovacao);
    }

    return await aprovarNaApi(id, aprovacao);
  } catch (erro) {
    return repassarOuTraduzir(erro, "Não foi possível aprovar este produto.");
  }
}

export async function sincronizarPendente(
  id: string,
): Promise<ResultadoAprovacao> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();
      exigirPapelQueDecideNoMock();

      return sincronizarNoMock(id);
    }

    return await sincronizarNaApi(id);
  } catch (erro) {
    return repassarOuTraduzir(
      erro,
      "Não foi possível publicar o produto no catálogo.",
    );
  }
}

export async function recusarPendente(
  id: string,
  recusa: RecusaCandidato,
): Promise<void> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();
      exigirPapelQueDecideNoMock();
      tirarDaFilaNoMock(id);

      return;
    }

    await recusarNaApi(id, recusa);
  } catch (erro) {
    repassarOuTraduzir(erro, "Não foi possível recusar este produto.");
  }
}
