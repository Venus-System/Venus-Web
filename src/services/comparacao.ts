import { USAR_MOCK } from "../config/ambiente";
import type { ProdutoComparado } from "../types/comparacao";
import { buscarIngredientesDaVersao } from "./api/ingredientes";
import { buscarProdutoComVersaoDaApi } from "./api/produtos";
import { ErroProdutoNaoEncontrado, ErroServicoIndisponivel } from "./erros";
import { analisesMock } from "./mocks/analises";
import { simularLatencia } from "./mocks/atraso";
import { produtosMock } from "./mocks/produtos";

async function produtoComparado(
  slug: string,
  sinal?: AbortSignal,
): Promise<ProdutoComparado> {
  if (USAR_MOCK) {
    const produto = produtosMock.find((item) => item.slug === slug);

    if (produto === undefined) {
      throw new ErroProdutoNaoEncontrado(slug);
    }

    return {
      product: produto,
      ingredients: analisesMock[slug]?.ingredients ?? [],
    };
  }

  const { produto, versaoId } = await buscarProdutoComVersaoDaApi(slug, sinal);

  return {
    product: produto,
    ingredients:
      versaoId === null
        ? []
        : await buscarIngredientesDaVersao(versaoId, sinal),
  };
}

export async function buscarComparacao(
  slugA: string,
  slugB: string,
  sinal?: AbortSignal,
): Promise<[ProdutoComparado, ProdutoComparado]> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();
    }

    return await Promise.all([
      produtoComparado(slugA, sinal),
      produtoComparado(slugB, sinal),
    ]);
  } catch (erro) {
    if (
      (erro instanceof DOMException && erro.name === "AbortError") ||
      erro instanceof ErroProdutoNaoEncontrado ||
      erro instanceof ErroServicoIndisponivel
    ) {
      throw erro;
    }

    throw new Error("Não foi possível carregar a comparação.");
  }
}
