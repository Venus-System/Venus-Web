import { ErroProdutoNaoEncontrado } from "../erros";
import type {
  CategoriaApi,
  MarcaApi,
  ProdutoApi,
  ProductFullResponse,
} from "./tipos";
import type { Produto } from "../../types/produto";
import { paraProduto, paraProdutoDaListagem } from "./tradutores";
import { URL_API } from "../../config/ambiente";

const idsPorSlug = new Map<string, number>();

interface ItemDaListagem {
  id: number;
  slug: string;
}

function ehItemDaListagem(valor: unknown): valor is ItemDaListagem {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "id" in valor &&
    typeof valor.id === "number" &&
    "slug" in valor &&
    typeof valor.slug === "string"
  );
}

function ehMarcaApi(valor: unknown): valor is MarcaApi {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "id" in valor &&
    typeof valor.id === "number" &&
    "name" in valor &&
    typeof valor.name === "string" &&
    "hasCrueltyFreeClaim" in valor &&
    typeof valor.hasCrueltyFreeClaim === "boolean" &&
    "hasVeganClaim" in valor &&
    typeof valor.hasVeganClaim === "boolean" &&
    "isBrazilian" in valor &&
    typeof valor.isBrazilian === "boolean"
  );
}

function ehCategoriaApi(valor: unknown): valor is CategoriaApi {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "id" in valor &&
    typeof valor.id === "number" &&
    "name" in valor &&
    typeof valor.name === "string"
  );
}

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

  const dados: unknown = await resposta.json();

  if (!Array.isArray(dados)) {
    throw new Error("A listagem de produtos não veio no formato esperado.");
  }

  const itens: unknown[] = dados;

  for (const item of itens) {
    if (ehItemDaListagem(item)) {
      idsPorSlug.set(item.slug, item.id);
    }
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

async function buscarLista(
  caminho: string,
  sinal?: AbortSignal,
): Promise<unknown[]> {
  const resposta = await fetch(`${URL_API}${caminho}`, { signal: sinal });

  if (!resposta.ok) {
    throw new Error(`A API respondeu ${resposta.status} em ${caminho}.`);
  }

  const dados: unknown = await resposta.json();

  if (!Array.isArray(dados)) {
    throw new Error(`A resposta de ${caminho} não veio como lista.`);
  }

  return dados;
}

function ehProdutoDaListagem(valor: unknown): valor is ProdutoApi {
  return (
    ehItemDaListagem(valor) &&
    "name" in valor &&
    typeof valor.name === "string" &&
    "brandId" in valor &&
    typeof valor.brandId === "number" &&
    "productCategoryId" in valor &&
    typeof valor.productCategoryId === "number" &&
    "isActive" in valor &&
    typeof valor.isActive === "boolean"
  );
}

function indexarPorId<T extends { id: number }>(
  itens: unknown[],
  guarda: (valor: unknown) => valor is T,
): Map<number, T> {
  const mapa = new Map<number, T>();

  for (const item of itens) {
    if (guarda(item)) {
      mapa.set(item.id, item);
    }
  }

  return mapa;
}

export async function listarProdutosDaApi(
  sinal?: AbortSignal,
): Promise<Produto[]> {
  const [produtos, marcas, categorias] = await Promise.all([
    buscarLista("/api/products", sinal),
    buscarLista("/api/brands", sinal),
    buscarLista("/api/product-categories", sinal),
  ]);

  const marcasPorId = indexarPorId(marcas, ehMarcaApi);
  const categoriasPorId = indexarPorId(categorias, ehCategoriaApi);
  const montados: Produto[] = [];

  for (const item of produtos) {
    if (!ehProdutoDaListagem(item) || !item.isActive) {
      continue;
    }

    const marca = marcasPorId.get(item.brandId);
    const categoria = categoriasPorId.get(item.productCategoryId);

    if (marca === undefined || categoria === undefined) {
      continue;
    }

    montados.push(paraProdutoDaListagem(item, marca, categoria));
  }

  return montados;
}
