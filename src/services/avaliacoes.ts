import { USAR_MOCK } from "../config/ambiente";
import type {
  Avaliacao,
  AvaliacoesDoProduto,
  Denuncia,
  NovaAvaliacao,
  VotoDeAvaliacao,
} from "../types/avaliacao";
import { resumirAvaliacoes } from "../utils/resumoDasAvaliacoes";
import {
  buscarAvaliacoesNaApi,
  buscarMeuVotoNaApi,
  denunciarNaApi,
  publicarAvaliacaoNaApi,
  votarNaApi,
} from "./api/avaliacoes";
import type { AvaliacoesLidas } from "./api/avaliacoes";
import { idDoUsuarioNaApi } from "./autenticacao";
import {
  ErroAvaliacaoDuplicada,
  ErroDeOrientacao,
  ErroProdutoNaoEncontrado,
  ErroServicoIndisponivel,
} from "./erros";
import {
  avaliacoesDoMock,
  meuVotoDoMock,
  publicarNoMock,
  votarNoMock,
} from "./mocks/avaliacoes";
import { simularLatencia } from "./mocks/atraso";

function usuarioDaApi(): number {
  const usuarioId = idDoUsuarioNaApi();

  if (usuarioId === null) {
    throw new ErroDeOrientacao(
      "Entre na sua conta para avaliar, votar ou denunciar.",
    );
  }

  return usuarioId;
}

function repassarOuTrocar(erro: unknown, mensagem: string): never {
  if (
    (erro instanceof DOMException && erro.name === "AbortError") ||
    erro instanceof ErroDeOrientacao ||
    erro instanceof ErroServicoIndisponivel ||
    erro instanceof ErroProdutoNaoEncontrado ||
    erro instanceof ErroAvaliacaoDuplicada
  ) {
    throw erro;
  }

  throw new Error(mensagem);
}

async function avaliacoesLidas(
  slug: string,
  sinal?: AbortSignal,
): Promise<AvaliacoesLidas> {
  if (USAR_MOCK) {
    await simularLatencia();

    return { avaliacoes: avaliacoesDoMock(slug), truncated: false };
  }

  return buscarAvaliacoesNaApi(slug, idDoUsuarioNaApi(), sinal);
}

export async function buscarAvaliacoes(
  slug: string,
  sinal?: AbortSignal,
): Promise<AvaliacoesDoProduto> {
  try {
    const { avaliacoes, truncated } = await avaliacoesLidas(slug, sinal);
    const recentes = [...avaliacoes].sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );

    return {
      reviews: recentes,
      summary: resumirAvaliacoes(recentes, truncated),
    };
  } catch (erro) {
    return repassarOuTrocar(
      erro,
      "Não foi possível carregar as avaliações deste produto.",
    );
  }
}

export async function publicarAvaliacao(
  slug: string,
  nova: NovaAvaliacao,
): Promise<Avaliacao> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();

      return publicarNoMock(slug, nova);
    }

    return await publicarAvaliacaoNaApi(usuarioDaApi(), slug, nova);
  } catch (erro) {
    return repassarOuTrocar(erro, "Não foi possível publicar a avaliação.");
  }
}

export async function buscarMeuVoto(
  avaliacaoId: string,
  sinal?: AbortSignal,
): Promise<VotoDeAvaliacao | null> {
  try {
    if (USAR_MOCK) {
      return meuVotoDoMock(avaliacaoId);
    }

    const usuarioId = idDoUsuarioNaApi();

    return usuarioId === null
      ? null
      : await buscarMeuVotoNaApi(avaliacaoId, usuarioId, sinal);
  } catch (erro) {
    return repassarOuTrocar(erro, "Não foi possível carregar o seu voto.");
  }
}

export async function votar(
  avaliacaoId: string,
  novo: VotoDeAvaliacao | null,
  anterior: VotoDeAvaliacao | null,
): Promise<void> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();
      votarNoMock(avaliacaoId, novo);

      return;
    }

    await votarNaApi(avaliacaoId, usuarioDaApi(), novo, anterior);
  } catch (erro) {
    repassarOuTrocar(erro, "Não foi possível registrar o seu voto.");
  }
}

export async function denunciarAvaliacao(
  avaliacaoId: string,
  denuncia: Denuncia,
): Promise<void> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();

      return;
    }

    await denunciarNaApi(usuarioDaApi(), avaliacaoId, denuncia);
  } catch (erro) {
    repassarOuTrocar(erro, "Não foi possível enviar a denúncia.");
  }
}
