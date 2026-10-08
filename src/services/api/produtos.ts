import { ErroProdutoNaoEncontrado } from "../erros";
import type {
  CategoriaApi,
  MarcaApi,
  ProdutoApi,
  ProductFullResponse,
} from "./tipos";
import type { Produto } from "../../types/produto";
import type { IngredienteAvaliado } from "../../types/ingrediente";
import type {
  FiltrosDaPesquisa,
  OpcoesDaPesquisa,
  ResultadoDaPesquisa,
} from "../../types/pesquisa";
import { comoObjeto } from "./leitura";
import { paraProduto, paraProdutoDaListagem } from "./tradutores";
import { lerIngredientesDoProduto } from "./ingredientes";
import { URL_API } from "../../config/ambiente";
import { pedir, verificarResposta } from "./requisicao";

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

export async function buscarIdPorSlug(
  slug: string,
  sinal?: AbortSignal,
): Promise<number> {
  const guardado = idsPorSlug.get(slug);

  if (guardado !== undefined) {
    return guardado;
  }

  const resposta = await pedir(`${URL_API}/api/products`, { signal: sinal });

  verificarResposta(resposta, "/api/products");

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

export interface ProdutoComVersao {
  produto: Produto;
  versaoId: number | null;
  ingredientes: IngredienteAvaliado[];
}

async function buscarCompletoPorId(
  id: number,
  sinal?: AbortSignal,
): Promise<ProductFullResponse | null> {
  const caminho = `/api/products/${id}/full`;
  const resposta = await pedir(`${URL_API}${caminho}`, { signal: sinal });

  if (resposta.status === 404) {
    return null;
  }

  verificarResposta(resposta, caminho);

  const dados: ProductFullResponse = await resposta.json();
  return dados;
}

export async function buscarProdutoPorIdDaApi(
  id: number,
  sinal?: AbortSignal,
): Promise<Produto | null> {
  const dados = await buscarCompletoPorId(id, sinal);

  return dados === null ? null : paraProduto(dados);
}

export async function buscarProdutoComVersaoDaApi(
  slug: string,
  sinal?: AbortSignal,
): Promise<ProdutoComVersao> {
  const id = await buscarIdPorSlug(slug, sinal);
  const dados = await buscarCompletoPorId(id, sinal);

  if (dados === null) {
    idsPorSlug.clear();
    throw new ErroProdutoNaoEncontrado(slug);
  }

  return {
    produto: paraProduto(dados),
    versaoId: dados.currentVersion?.id ?? null,
    ingredientes: lerIngredientesDoProduto(dados.ingredients),
  };
}

async function buscarLista(
  caminho: string,
  sinal?: AbortSignal,
): Promise<unknown[]> {
  const resposta = await pedir(`${URL_API}${caminho}`, { signal: sinal });

  verificarResposta(resposta, caminho);

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

interface MarcasECategorias {
  marcasPorId: Map<number, MarcaApi>;
  categoriasPorId: Map<number, CategoriaApi>;
}

let marcasECategorias: MarcasECategorias | null = null;

async function buscarMarcasECategorias(
  sinal?: AbortSignal,
): Promise<MarcasECategorias> {
  if (marcasECategorias !== null) {
    return marcasECategorias;
  }

  const [marcas, categorias] = await Promise.all([
    buscarLista("/api/brands", sinal),
    buscarLista("/api/product-categories", sinal),
  ]);

  marcasECategorias = {
    marcasPorId: indexarPorId(marcas, ehMarcaApi),
    categoriasPorId: indexarPorId(categorias, ehCategoriaApi),
  };

  return marcasECategorias;
}

function montarProdutos(
  itens: unknown[],
  { marcasPorId, categoriasPorId }: MarcasECategorias,
): Produto[] {
  const montados: Produto[] = [];

  for (const item of itens) {
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

export async function listarProdutosDaApi(
  sinal?: AbortSignal,
): Promise<Produto[]> {
  const [produtos, apoio] = await Promise.all([
    buscarLista("/api/products", sinal),
    buscarMarcasECategorias(sinal),
  ]);

  return montarProdutos(produtos, apoio);
}

function idPeloNome<T extends { id: number; name: string }>(
  itens: Map<number, T>,
  nome: string,
): number | null {
  for (const item of itens.values()) {
    if (item.name === nome) {
      return item.id;
    }
  }

  return null;
}

const POR_NOME = new Intl.Collator("pt-BR");

function nomesOrdenados(itens: Map<number, { name: string }>): string[] {
  return [...itens.values()]
    .map((item) => item.name)
    .sort((a, b) => POR_NOME.compare(a, b));
}

export async function listarOpcoesDaPesquisaNaApi(
  sinal?: AbortSignal,
): Promise<OpcoesDaPesquisa> {
  const { marcasPorId, categoriasPorId } = await buscarMarcasECategorias(sinal);

  return {
    categorias: nomesOrdenados(categoriasPorId),
    marcas: nomesOrdenados(marcasPorId),
  };
}

export async function pesquisarProdutosNaApi(
  filtros: FiltrosDaPesquisa,
  pagina: number,
  tamanho: number,
  sinal?: AbortSignal,
): Promise<ResultadoDaPesquisa> {
  const apoio = await buscarMarcasECategorias(sinal);
  const parametros = new URLSearchParams({
    isActive: "true",
    page: String(pagina),
    size: String(tamanho),
    sort: "name,asc",
  });

  if (filtros.termo !== "") {
    parametros.set("name", filtros.termo);
  }

  if (filtros.categoria !== "") {
    const categoriaId = idPeloNome(apoio.categoriasPorId, filtros.categoria);

    if (categoriaId === null) {
      return { produtos: [], temMais: false };
    }

    parametros.set("productCategoryId", String(categoriaId));
  }

  if (filtros.marca !== "") {
    const marcaId = idPeloNome(apoio.marcasPorId, filtros.marca);

    if (marcaId === null) {
      return { produtos: [], temMais: false };
    }

    parametros.set("brandId", String(marcaId));
  }

  const caminho = `/api/products/search?${parametros.toString()}`;
  const resposta = await pedir(`${URL_API}${caminho}`, { signal: sinal });

  verificarResposta(resposta, "/api/products/search");

  const dados = comoObjeto(await resposta.json());
  const itens: unknown[] = Array.isArray(dados.content) ? dados.content : [];

  return {
    produtos: montarProdutos(itens, apoio),
    temMais: dados.last === false,
  };
}
