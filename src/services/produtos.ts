import type { Produto } from "../types/produto";
import { simularLatencia } from "./mocks/atraso";
import { produtosMock } from "./mocks/produtos";
import { USAR_MOCK } from "../config/ambiente";
import { listarProdutosDaApi } from "./api/produtos";

function filtrarPorTermo(produtos: Produto[], termo?: string): Produto[] {
  if (!termo) {
    return produtos;
  }

  const busca = termo.trim().toLowerCase();

  if (busca === "") {
    return produtos;
  }

  return produtos.filter(
    (produto) =>
      produto.name.toLowerCase().includes(busca) ||
      produto.brand.name.toLowerCase().includes(busca) ||
      produto.category.toLowerCase().includes(busca),
  );
}

export async function buscarProdutos(
  termo?: string,
  sinal?: AbortSignal,
): Promise<Produto[]> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();
      return filtrarPorTermo(produtosMock, termo);
    }

    const produtos = await listarProdutosDaApi(sinal);
    return filtrarPorTermo(produtos, termo);
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === "AbortError") {
      throw erro;
    }

    throw new Error("Não foi possível carregar os produtos.");
  }
}
