import { ErroProdutoNaoEncontrado } from "../erros";
import type { ProductFullResponse, ProdutoApi } from "./tipos";
import type { Produto } from "../../types/produto";
import { paraProduto } from "./tradutores";

const URL_API = import.meta.env.VITE_API_URL ?? "";

const idsPorSlug = new Map<string, number>();

async function buscarIdPorSlug(
  slug: string,
  sinal?: AbortSignal,
): Promise<number> {
  const guardado = idsPorSlug.get(slug);

  if (guardado !== undefined) {
    return guardado;
  }

  const resposta = await fetch(`${URL_API}/api/products`, { signal: sinal });

  if (!resposta.ok) {
    throw new Error(`A API respondeu ${resposta.status} ao listar produtos.`);
  }

  const lista: ProdutoApi[] = await resposta.json();

  if (!Array.isArray(lista)) {
    throw new Error("A listagem de produtos não veio no formato esperado.");
  }

  for (const item of lista) {
    idsPorSlug.set(item.slug, item.id);
  }

  const encontrado = idsPorSlug.get(slug);

  if (encontrado === undefined) {
    throw new ErroProdutoNaoEncontrado(slug);
  }

  return encontrado;
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
    idsPorSlug.clear();
    throw new ErroProdutoNaoEncontrado(slug);
  }

  if (!resposta.ok) {
    throw new Error(`A API respondeu ${resposta.status}.`);
  }

  const dados: ProductFullResponse = await resposta.json();
  return paraProduto(dados);
}
