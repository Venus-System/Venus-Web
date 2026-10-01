import { USAR_MOCK } from "../config/ambiente";
import type { Produto } from "../types/produto";
import { buscarProdutoDaApi } from "./api/produtos";
import { ErroProdutoNaoEncontrado, ErroServicoIndisponivel } from "./erros";
import { simularLatencia } from "./mocks/atraso";
import { produtosMock } from "./mocks/produtos";

async function produtoPorSlug(
  slug: string,
  sinal?: AbortSignal,
): Promise<Produto> {
  if (!USAR_MOCK) {
    return buscarProdutoDaApi(slug, sinal);
  }

  const produto = produtosMock.find((item) => item.slug === slug);

  if (produto === undefined) {
    throw new ErroProdutoNaoEncontrado(slug);
  }

  return produto;
}

export async function buscarComparacao(
  slugA: string,
  slugB: string,
  sinal?: AbortSignal,
): Promise<[Produto, Produto]> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();
    }

    return await Promise.all([
      produtoPorSlug(slugA, sinal),
      produtoPorSlug(slugB, sinal),
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
