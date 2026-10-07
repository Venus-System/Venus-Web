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
}

async function pedirComoAdmin(
  caminho: string,
  init: RequestInit = {},
): Promise<Response> {
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
}

const TAMANHO_DA_FILA = 100;

export async function listarScansNaApi(sinal?: AbortSignal): Promise<unknown> {
  const caminho = `/api/scan-sessions/status/PENDING_REVIEW?size=${TAMANHO_DA_FILA}`;
  const resposta = await pedirComoAdmin(caminho, { signal: sinal });

  verificarResposta(resposta, caminho);

  return resposta.json();
}

export async function buscarScanNaApi(
  id: string,
  sinal?: AbortSignal,
): Promise<unknown> {
  const caminho = `/api/scan-sessions/${encodeURIComponent(id)}`;
  const resposta = await pedirComoAdmin(caminho, { signal: sinal });

  if (resposta.status === 404) {
    throw new ErroCandidatoNaoEncontrado();
  }

  verificarResposta(resposta, caminho);

  return resposta.json();
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
  const caminho = `/api/scan-sessions/${encodeURIComponent(id)}/${acao}`;
  const resposta = await pedirComoAdmin(caminho, {
    method: "POST",
    headers:
      corpo === undefined ? undefined : { "Content-Type": "application/json" },
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

  return resposta.json();
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
  const resposta = await decidir(id, "approve", {
    product: {
      name: aprovacao.product.name.trim(),
      brandId: aprovacao.product.brandId,
      productCategoryId: aprovacao.product.productCategoryId,
    },
    ingredients: aprovacao.ingredients.map(paraDecisaoDaApi),
  });

  return lerResultado(resposta);
}

export async function calcularNotaBaseNaApi(versaoId: number): Promise<number> {
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
}

export async function sincronizarNaApi(
  id: string,
): Promise<ResultadoAprovacao> {
  return lerResultado(await decidir(id, "sync"));
}

export async function recusarNaApi(
  id: string,
  recusa: RecusaCandidato,
): Promise<void> {
  await decidir(id, "reject", {
    reason: `${ROTULO_DO_MOTIVO[recusa.reason]}. ${recusa.comment.trim()}`,
  });
}

function lerOpcoes(valor: unknown): OpcaoDoCatalogo[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor
    .flatMap((item) => {
      const dados = comoObjeto(item);

      return typeof dados.id === "number" && typeof dados.name === "string"
        ? [{ id: dados.id, name: dados.name }]
        : [];
    })
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

async function buscarOpcoes(
  caminho: string,
  sinal?: AbortSignal,
): Promise<OpcaoDoCatalogo[]> {
  const resposta = await pedir(`${URL_API}${caminho}`, { signal: sinal });

  verificarResposta(resposta, caminho);

  return lerOpcoes(await resposta.json());
}

export async function buscarCatalogoDaRevisaoNaApi(
  sinal?: AbortSignal,
): Promise<CatalogoDaRevisao> {
  const [brands, categories] = await Promise.all([
    buscarOpcoes("/api/brands", sinal),
    buscarOpcoes("/api/product-categories", sinal),
  ]);

  return { brands, categories };
}
