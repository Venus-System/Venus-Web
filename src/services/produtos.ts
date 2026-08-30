import type { Produto } from "../types/produto";
import { simularLatencia } from "./mocks/atraso";
import { produtosMock } from "./mocks/produtos";

export class ErroProdutoNaoEncontrado extends Error {
  constructor(slug: string) {
    super(`Nenhum produto corresponde a "${slug}".`);
    this.name = "ErroProdutoNaoEncontrado";
  }
}

const USAR_MOCK = import.meta.env.VITE_USAR_MOCK !== "false";
const URL_API = import.meta.env.VITE_API_URL ?? "";

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
  try {
    if (USAR_MOCK) {
      await simularLatencia();
      return filtrarPorTermo(produtosMock, termo);
    }

    const endereco = termo
      ? `${URL_API}/produtos?termo=${encodeURIComponent(termo)}`
      : `${URL_API}/produtos`;

    const resposta = await fetch(endereco);

    if (!resposta.ok) {
      throw new Error(`A API respondeu ${resposta.status}.`);
    }

    const produtos: Produto[] = await resposta.json();
    return produtos;
  } catch {
    throw new Error("Não foi possível carregar os produtos.");
  }
}

export async function buscarProdutoPorSlug(slug: string): Promise<Produto> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();
      const encontrado = produtosMock.find((produto) => produto.slug === slug);

      if (!encontrado) {
        throw new ErroProdutoNaoEncontrado(slug);
      }

      return encontrado;
    }

    const resposta = await fetch(
      `${URL_API}/produtos/${encodeURIComponent(slug)}`,
    );

    if (resposta.status === 404) {
      throw new ErroProdutoNaoEncontrado(slug);
    }

    if (!resposta.ok) {
      throw new Error(`A API respondeu ${resposta.status}.`);
    }

    const produto: Produto = await resposta.json();
    return produto;
  } catch (erro) {
    if (erro instanceof ErroProdutoNaoEncontrado) {
      throw erro;
    }

    throw new Error("Não foi possível carregar o produto.");
  }
}
