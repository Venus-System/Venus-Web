import type { Produto } from "../types/produto";
import { simularLatencia } from "./mocks/atraso";
import { produtosMock } from "./mocks/produtos";

const USAR_MOCK = import.meta.env.VITE_USAR_MOCK !== "false";

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

export async function buscarProdutos(termo?: string): Promise<Produto[]> {
  if (!USAR_MOCK) {
    throw new Error(
      "A busca por produtos ainda não está disponível na API: a listagem não devolve marca nem categoria.",
    );
  }

  try {
    await simularLatencia();
    return filtrarPorTermo(produtosMock, termo);
  } catch {
    throw new Error("Não foi possível carregar os produtos.");
  }
}
