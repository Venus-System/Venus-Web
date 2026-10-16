import { ErroProdutoNaoEncontrado, repassarErro } from "../erros";
import type {
  CategoriaApi,
  MarcaApi,
  NotasApi,
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
import { comoObjeto, lerTodos, numero, texto } from "./leitura";
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
    typeof valor.name === "string"
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

  try {
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
  } catch (erro) {
    repassarErro(erro, "Não foi possível encontrar o produto.");
  }
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
  try {
    const caminho = `/api/products/${id}/full`;
    const resposta = await pedir(`${URL_API}${caminho}`, { signal: sinal });

    if (resposta.status === 404) {
      return null;
    }

    verificarResposta(resposta, caminho);

    const dados: ProductFullResponse = await resposta.json();
    return dados;
  } catch (erro) {
    repassarErro(erro, "Não foi possível carregar o produto.");
  }
}

export async function buscarProdutoPorIdDaApi(
  id: number,
  sinal?: AbortSignal,
): Promise<Produto | null> {
  try {
    const dados = await buscarCompletoPorId(id, sinal);

    return dados === null ? null : paraProduto(dados);
  } catch (erro) {
    repassarErro(erro, "Não foi possível carregar o produto.");
  }
}

export async function buscarProdutoComVersaoDaApi(
  slug: string,
  sinal?: AbortSignal,
): Promise<ProdutoComVersao> {
  try {
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
  } catch (erro) {
    repassarErro(erro, "Não foi possível carregar o produto.");
  }
}

async function buscarLista(
  caminho: string,
  sinal?: AbortSignal,
): Promise<unknown[]> {
  try {
    const resposta = await pedir(`${URL_API}${caminho}`, { signal: sinal });

    verificarResposta(resposta, caminho);

    const dados: unknown = await resposta.json();

    if (!Array.isArray(dados)) {
      throw new Error(`A resposta de ${caminho} não veio como lista.`);
    }

    return dados;
  } catch (erro) {
    repassarErro(erro, "Não foi possível carregar a lista.");
  }
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

let pedidoDeMarcasECategorias: Promise<MarcasECategorias> | null = null;

async function carregarMarcasECategorias(): Promise<MarcasECategorias> {
  try {
    const [marcas, categorias] = await Promise.all([
      buscarLista("/api/brands"),
      buscarLista("/api/product-categories"),
    ]);

    return {
      marcasPorId: indexarPorId(marcas, ehMarcaApi),
      categoriasPorId: indexarPorId(categorias, ehCategoriaApi),
    };
  } catch (erro) {
    repassarErro(erro, "Não foi possível carregar marcas e categorias.");
  }
}

function buscarMarcasECategorias(): Promise<MarcasECategorias> {
  if (pedidoDeMarcasECategorias === null) {
    pedidoDeMarcasECategorias = carregarMarcasECategorias().catch(
      (erro: unknown) => {
        pedidoDeMarcasECategorias = null;
        throw erro;
      },
    );
  }

  return pedidoDeMarcasECategorias;
}

interface NotaDaVersao {
  productVersionId: number;
  calculatedAt: string;
  notas: NotasApi;
}

function lerNotaDaVersao(valor: unknown): NotaDaVersao | null {
  const dados = comoObjeto(valor);
  const productVersionId = numero(dados.productVersionId);

  if (productVersionId === null) {
    return null;
  }

  return {
    productVersionId,
    calculatedAt: texto(dados.calculatedAt) ?? "",
    notas: {
      overallScore: numero(dados.overallScore),
      healthScore: numero(dados.healthScore),
      environmentalScore: numero(dados.environmentalScore),
      ethicalScore: numero(dados.ethicalScore),
      performanceScore: numero(dados.performanceScore),
      transparencyScore: numero(dados.transparencyScore),
      confidenceScore: numero(dados.confidenceScore),
    },
  };
}

function produtoDeCadaVersaoAtual(versoes: unknown[]): Map<number, number> {
  const produtoDaVersao = new Map<number, number>();

  for (const versao of versoes) {
    const dados = comoObjeto(versao);
    const versaoId = numero(dados.id);
    const produtoId = numero(dados.productId);

    if (versaoId !== null && produtoId !== null && dados.isCurrent === true) {
      produtoDaVersao.set(versaoId, produtoId);
    }
  }

  return produtoDaVersao;
}

async function carregarNotasPorProduto(): Promise<Map<number, NotasApi>> {
  try {
    const [versoes, notas] = await Promise.all([
      buscarLista("/api/product-versions"),
      buscarLista("/api/product-scores"),
    ]);

    const produtoDaVersao = produtoDeCadaVersaoAtual(versoes);
    const maisRecentes = new Map<number, NotaDaVersao>();

    for (const nota of lerTodos(notas, lerNotaDaVersao)) {
      const produtoId = produtoDaVersao.get(nota.productVersionId);

      if (produtoId === undefined) {
        continue;
      }

      const guardada = maisRecentes.get(produtoId);

      if (guardada === undefined || nota.calculatedAt > guardada.calculatedAt) {
        maisRecentes.set(produtoId, nota);
      }
    }

    const notasPorProduto = new Map<number, NotasApi>();

    for (const [produtoId, nota] of maisRecentes) {
      notasPorProduto.set(produtoId, nota.notas);
    }

    return notasPorProduto;
  } catch (erro) {
    repassarErro(erro, "Não foi possível carregar as notas dos produtos.");
  }
}

let pedidoDeNotas: Promise<Map<number, NotasApi>> | null = null;

function buscarNotasPorProduto(): Promise<Map<number, NotasApi>> {
  if (pedidoDeNotas === null) {
    pedidoDeNotas = carregarNotasPorProduto().catch(() => {
      pedidoDeNotas = null;

      return new Map<number, NotasApi>();
    });
  }

  return pedidoDeNotas;
}

export function esquecerNotasDoCatalogo(): void {
  pedidoDeNotas = null;
}

function montarProdutos(
  itens: unknown[],
  { marcasPorId, categoriasPorId }: MarcasECategorias,
  notasPorProduto: Map<number, NotasApi>,
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

    montados.push(
      paraProdutoDaListagem(
        item,
        marca,
        categoria,
        notasPorProduto.get(item.id) ?? null,
      ),
    );
  }

  return montados;
}

export async function listarProdutosDaApi(
  sinal?: AbortSignal,
): Promise<Produto[]> {
  try {
    const [produtos, apoio, notasPorProduto] = await Promise.all([
      buscarLista("/api/products", sinal),
      buscarMarcasECategorias(),
      buscarNotasPorProduto(),
    ]);

    return montarProdutos(produtos, apoio, notasPorProduto);
  } catch (erro) {
    repassarErro(erro, "Não foi possível carregar os produtos.");
  }
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
  const nomes = new Set([...itens.values()].map((item) => item.name));

  return [...nomes].sort((a, b) => POR_NOME.compare(a, b));
}

export async function listarOpcoesDaPesquisaNaApi(): Promise<OpcoesDaPesquisa> {
  try {
    const { marcasPorId, categoriasPorId } = await buscarMarcasECategorias();

    return {
      categorias: nomesOrdenados(categoriasPorId),
      marcas: nomesOrdenados(marcasPorId),
    };
  } catch (erro) {
    repassarErro(erro, "Não foi possível carregar os filtros da pesquisa.");
  }
}

export async function pesquisarProdutosNaApi(
  filtros: FiltrosDaPesquisa,
  pagina: number,
  tamanho: number,
  sinal?: AbortSignal,
): Promise<ResultadoDaPesquisa> {
  try {
    const [apoio, notasPorProduto] = await Promise.all([
      buscarMarcasECategorias(),
      buscarNotasPorProduto(),
    ]);
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
      produtos: montarProdutos(itens, apoio, notasPorProduto),
      temMais: dados.last === false,
    };
  } catch (erro) {
    repassarErro(erro, "Não foi possível pesquisar os produtos.");
  }
}
