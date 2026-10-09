import { USAR_MOCK } from "../config/ambiente";
import type { Produto } from "../types/produto";
import {
  buscarFavoritosNaApi,
  desfavoritarNaApi,
  favoritarNaApi,
} from "./api/favoritos";
import { garantirIdDoUsuarioNaApi } from "./autenticacao";
import { ErroDeOrientacao, ErroServicoIndisponivel } from "./erros";
import { simularLatencia } from "./mocks/atraso";
import {
  desfavoritarNoMock,
  favoritarNoMock,
  favoritosDoMock,
} from "./mocks/favoritos";

async function usuarioDaApi(): Promise<number> {
  const usuarioId = await garantirIdDoUsuarioNaApi();

  if (usuarioId === null) {
    throw new ErroDeOrientacao(
      "Não conseguimos ligar esta conta ao cadastro da API neste navegador. Entre de novo e tente outra vez.",
    );
  }

  return usuarioId;
}

function repassarOuTrocar(erro: unknown, mensagem: string): never {
  if (
    (erro instanceof DOMException && erro.name === "AbortError") ||
    erro instanceof ErroDeOrientacao ||
    erro instanceof ErroServicoIndisponivel
  ) {
    throw erro;
  }

  throw new Error(mensagem);
}

export async function buscarFavoritos(sinal?: AbortSignal): Promise<Produto[]> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();

      return favoritosDoMock();
    }

    return await buscarFavoritosNaApi(await usuarioDaApi(), sinal);
  } catch (erro) {
    return repassarOuTrocar(
      erro,
      "Não foi possível carregar os seus favoritos.",
    );
  }
}

export async function favoritar(slug: string): Promise<void> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();
      favoritarNoMock(slug);

      return;
    }

    await favoritarNaApi(await usuarioDaApi(), slug);
  } catch (erro) {
    repassarOuTrocar(erro, "Não foi possível favoritar este produto.");
  }
}

export async function desfavoritar(slug: string): Promise<void> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();
      desfavoritarNoMock(slug);

      return;
    }

    await desfavoritarNaApi(await usuarioDaApi(), slug);
  } catch (erro) {
    repassarOuTrocar(
      erro,
      "Não foi possível tirar este produto dos favoritos.",
    );
  }
}
