import { ErroProdutoNaoEncontrado } from "../produtos";
import type { ProductFullResponse, ProdutoApi } from "./tipos";
import type { Produto } from "../../types/produto";
import { paraProduto } from "./tradutores";

const URL_API = import.meta.env.VITE_API_URL ?? "";

async function buscarIdPorSlug(
  slug: string,
  sinal?: AbortSignal,
): Promise<number> {
  const resposta = await fetch(`${URL_API}/api/products`, { signal: sinal });

  if (!resposta.ok) {
    throw new Error(`A API respondeu ${resposta.status} ao listar produtos.`);
  }

  const lista: ProdutoApi[] = await resposta.json();
  const encontrado = lista.find((item) => item.slug === slug);

  if (!encontrado) {
    throw new ErroProdutoNaoEncontrado(slug);
  }

  return encontrado.id;
}

export async function buscarProdutoDaApi(
  slug: string,
  sinal?: AbortSignal,
): Promise<Produto> {
  const id = await buscarIdPorSlug(slug, sinal);
  const resposta = await fetch(`${URL_API}/api/products/${id}/full`, {
    signal: sinal,
  });

  if (resposta.status === 404) {
    throw new ErroProdutoNaoEncontrado(slug);
  }

  if (!resposta.ok) {
    throw new Error(`A API respondeu ${resposta.status}.`);
  }

  const dados: ProductFullResponse = await resposta.json();
  return paraProduto(dados);
}
