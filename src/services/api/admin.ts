import {
  URL_API,
  URL_API_SCANS,
  URL_CLASSIFICACAO,
} from "../../config/ambiente";
import type {
  AprovacaoCandidato,
  CatalogoDaRevisao,
  DecisaoIngrediente,
  OpcaoDoCatalogo,
  RecusaCandidato,
  ResultadoAprovacao,
  SessaoAdmin,
} from "../../types/admin";
import { ROTULO_DO_MOTIVO } from "../../utils/motivosRecusa";
import {
  PAPEIS_ADMIN,
  lerSessaoAdmin,
  limparSessaoAdmin,
} from "../../utils/sessaoAdmin";
import {
  ErroCandidatoNaoEncontrado,
  ErroCredenciaisInvalidas,
  ErroRevisaoEmConflito,
  ErroRevisaoInvalida,
  ErroSemPermissaoParaDecidir,
  ErroSessaoAdminExpirada,
  repassarErro,
} from "../erros";
import { pedir, verificarResposta } from "./requisicao";

type CampoDesconhecido = Partial<Record<string, unknown>>;

function comoObjeto(valor: unknown): CampoDesconhecido {
  return typeof valor === "object" && valor !== null
    ? (valor as CampoDesconhecido)
    : {};
}

function lerDaLista<T extends string>(
  lista: T[],
  valor: unknown,
): T | undefined {
  if (typeof valor !== "string") {
    return undefined;
  }

  const minusculo = valor.toLowerCase();

  return lista.find((item) => item === minusculo);
}

function lerSessao(valor: unknown): SessaoAdmin | null {
  const dados = comoObjeto(valor);
  const admin = comoObjeto(dados.admin);
  const role = lerDaLista(PAPEIS_ADMIN, admin.role);

  if (
    typeof dados.accessToken !== "string" ||
    typeof dados.expiresAt !== "string" ||
    typeof admin.id !== "number" ||
    typeof admin.name !== "string" ||
    typeof admin.email !== "string" ||
    role === undefined
  ) {
    return null;
  }

  return {
    token: dados.accessToken,
    expiresAt: dados.expiresAt,
    admin: { id: admin.id, name: admin.name, email: admin.email, role },
  };
}

export async function entrarComoAdminNaApi(
  email: string,
  senha: string,
): Promise<SessaoAdmin> {
  try {
    const caminho = "/api/auth/admin/login";
    const resposta = await pedir(
      `${URL_API}${caminho}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: senha }),
      },
      false,
    );

    if (resposta.status === 401 || resposta.status === 403) {
      throw new ErroCredenciaisInvalidas();
    }

    verificarResposta(resposta, caminho);

    const sessao = lerSessao(await resposta.json());

    if (sessao === null) {
      throw new Error("A resposta do login não veio no formato esperado.");
    }

    return sessao;
  } catch (erro) {
    repassarErro(erro, "Não foi possível entrar como administrador.");
  }
}

async function pedirComoAdmin(
  caminho: string,
  init: RequestInit = {},
): Promise<Response> {
  try {
    const sessao = lerSessaoAdmin();

    if (sessao === null) {
      throw new ErroSessaoAdminExpirada();
    }

    const cabecalhos = new Headers(init.headers);

    cabecalhos.set("Authorization", `Bearer ${sessao.token}`);

    const resposta = await pedir(`${URL_API_SCANS}${caminho}`, {
      ...init,
      headers: cabecalhos,
    });

    if (resposta.status === 401) {
      limparSessaoAdmin();
      throw new ErroSessaoAdminExpirada();
    }

    return resposta;
  } catch (erro) {
    repassarErro(erro, "Não foi possível falar com a fila de aprovação.");
  }
}

const TAMANHO_DA_PAGINA_DA_FILA = 100;
const LIMITE_DE_PAGINAS_DA_FILA = 5;
const STATUS_DA_FILA = ["PENDING_REVIEW", "SYNC_FAILED"];

export interface ScansLidos {
  itens: unknown[];
  truncated: boolean;
}

async function lerScansDoStatus(
  status: string,
  sinal?: AbortSignal,
): Promise<ScansLidos> {
  try {
    const itens: unknown[] = [];

    for (let pagina = 0; pagina < LIMITE_DE_PAGINAS_DA_FILA; pagina += 1) {
      const caminho = `/api/scan-sessions/status/${status}?page=${pagina}&size=${TAMANHO_DA_PAGINA_DA_FILA}&sort=createdAt,asc`;
      const resposta = await pedirComoAdmin(caminho, { signal: sinal });

      verificarResposta(resposta, caminho);

      const dados = comoObjeto(await resposta.json());

      if (!Array.isArray(dados.content)) {
        throw new Error("A fila de aprovação não veio no formato esperado.");
      }

      itens.push(...dados.content);

      if (
        dados.last === true ||
        dados.content.length < TAMANHO_DA_PAGINA_DA_FILA
      ) {
        return { itens, truncated: false };
      }
    }

    return { itens, truncated: true };
  } catch (erro) {
    repassarErro(erro, "Não foi possível carregar a fila de aprovação.");
  }
}

export async function listarScansNaApi(
  sinal?: AbortSignal,
): Promise<ScansLidos> {
  try {
    const lidos = await Promise.all(
      STATUS_DA_FILA.map((status) => lerScansDoStatus(status, sinal)),
    );

    return {
      itens: lidos.flatMap((lido) => lido.itens),
      truncated: lidos.some((lido) => lido.truncated),
    };
  } catch (erro) {
    repassarErro(erro, "Não foi possível carregar a fila de aprovação.");
  }
}

export async function buscarScanNaApi(
  id: string,
  sinal?: AbortSignal,
): Promise<unknown> {
  try {
    const caminho = `/api/scan-sessions/${encodeURIComponent(id)}`;
    const resposta = await pedirComoAdmin(caminho, { signal: sinal });

    if (resposta.status === 404) {
      throw new ErroCandidatoNaoEncontrado();
    }

    verificarResposta(resposta, caminho);

    return await resposta.json();
  } catch (erro) {
    repassarErro(erro, "Não foi possível carregar o candidato.");
  }
}

async function lerDetalhes(resposta: Response): Promise<string[]> {
  try {
    const detalhes = comoObjeto(await resposta.json()).details;

    return Array.isArray(detalhes)
      ? detalhes.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

async function decidir(
  id: string,
  acao: "approve" | "reject" | "sync",
  corpo?: Record<string, unknown>,
): Promise<unknown> {
  try {
    const caminho = `/api/scan-sessions/${encodeURIComponent(id)}/${acao}`;
    const resposta = await pedirComoAdmin(caminho, {
      method: "POST",
      headers:
        corpo === undefined
          ? undefined
          : { "Content-Type": "application/json" },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });

    if (resposta.status === 404) {
      throw new ErroCandidatoNaoEncontrado();
    }

    if (resposta.status === 403) {
      throw new ErroSemPermissaoParaDecidir();
    }

    if (resposta.status === 409) {
      throw new ErroRevisaoEmConflito();
    }

    if (resposta.status === 422) {
      throw new ErroRevisaoInvalida(await lerDetalhes(resposta));
    }

    verificarResposta(resposta, caminho);

    return await resposta.json();
  } catch (erro) {
    repassarErro(erro, "Não foi possível registrar a decisão.");
  }
}

function paraDecisaoDaApi(decisao: DecisaoIngrediente): Record<string, unknown> {
  switch (decisao.action) {
    case "link":
      return {
        position: decisao.position,
        action: "LINK",
        ingredientId: decisao.ingredientId,
      };
    case "create":
      return {
        position: decisao.position,
        action: "CREATE",
        inciName: decisao.inciName.trim(),
      };
    case "discard":
      return { position: decisao.position, action: "DISCARD" };
  }
}

function lerResultado(valor: unknown): ResultadoAprovacao {
  const dados = comoObjeto(valor);

  if (dados.status !== "SYNCED") {
    return { status: "sincronizacaoFalhou" };
  }

  const versaoId = comoObjeto(dados.sync).productVersionId;

  return {
    status: "publicado",
    productVersionId: typeof versaoId === "number" ? versaoId : null,
  };
}

export async function aprovarNaApi(
  id: string,
  aprovacao: AprovacaoCandidato,
): Promise<ResultadoAprovacao> {
  try {
    const resposta = await decidir(id, "approve", {
      product: {
        name: aprovacao.product.name.trim(),
        brandId: aprovacao.product.brandId,
        productCategoryId: aprovacao.product.productCategoryId,
      },
      ingredients: aprovacao.ingredients.map(paraDecisaoDaApi),
    });

    return lerResultado(resposta);
  } catch (erro) {
    repassarErro(erro, "Não foi possível aprovar o candidato.");
  }
}

export async function calcularNotaBaseNaApi(versaoId: number): Promise<number> {
  try {
    const sessao = lerSessaoAdmin();

    if (sessao === null) {
      throw new ErroSessaoAdminExpirada();
    }

    if (URL_CLASSIFICACAO === "") {
      throw new Error("VITE_CLASSIFICACAO_URL não está configurada.");
    }

    const caminho = `/api/base-scores/product-version/${versaoId}`;
    const resposta = await pedir(
      `${URL_CLASSIFICACAO}${caminho}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${sessao.token}` },
      },
      false,
    );

    verificarResposta(resposta, caminho);

    const nota = comoObjeto(await resposta.json()).qualityScore;

    if (typeof nota !== "number") {
      throw new Error("A nota base não veio no formato esperado.");
    }

    return nota;
  } catch (erro) {
    repassarErro(erro, "Não foi possível calcular a nota base.");
  }
}

export async function sincronizarNaApi(
  id: string,
): Promise<ResultadoAprovacao> {
  try {
    return lerResultado(await decidir(id, "sync"));
  } catch (erro) {
    repassarErro(erro, "Não foi possível publicar o produto.");
  }
}

export async function recusarNaApi(
  id: string,
  recusa: RecusaCandidato,
): Promise<void> {
  try {
    await decidir(id, "reject", {
      reason: `${ROTULO_DO_MOTIVO[recusa.reason]}. ${recusa.comment.trim()}`,
    });
  } catch (erro) {
    repassarErro(erro, "Não foi possível recusar o candidato.");
  }
}

function lerOpcoes(valor: unknown, campoDoNome: string): OpcaoDoCatalogo[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor
    .flatMap((item) => {
      const dados = comoObjeto(item);
      const nome = dados[campoDoNome];

      return typeof dados.id === "number" && typeof nome === "string"
        ? [{ id: dados.id, name: nome }]
        : [];
    })
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

async function buscarOpcoes(
  caminho: string,
  sinal?: AbortSignal,
  campoDoNome = "name",
): Promise<OpcaoDoCatalogo[]> {
  try {
    const resposta = await pedir(`${URL_API}${caminho}`, { signal: sinal });

    verificarResposta(resposta, caminho);

    return lerOpcoes(await resposta.json(), campoDoNome);
  } catch (erro) {
    repassarErro(erro, "Não foi possível carregar as opções do catálogo.");
  }
}

export async function buscarCatalogoDaRevisaoNaApi(
  sinal?: AbortSignal,
): Promise<CatalogoDaRevisao> {
  try {
    const [brands, categories, ingredients] = await Promise.all([
      buscarOpcoes("/api/brands", sinal),
      buscarOpcoes("/api/product-categories", sinal),
      buscarOpcoes("/api/ingredients", sinal, "inciName"),
    ]);

    return { brands, categories, ingredients };
  } catch (erro) {
    repassarErro(erro, "Não foi possível carregar o catálogo da revisão.");
  }
}
