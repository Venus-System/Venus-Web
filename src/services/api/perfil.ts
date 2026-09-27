import { URL_API } from "../../config/ambiente";
import type {
  AlergiaParaSalvar,
  FaixaEtaria,
  Fototipo,
  Genero,
  NivelSensibilidade,
  PerfilCarregado,
  PerfilParaSalvar,
  Preferencia,
  TipoCabelo,
  TipoCouroCabeludo,
  TipoPele,
} from "../../types/perfil";
import type { PersonalRiskLevel } from "../../types/analise";
import type { StatusConta } from "../../types/usuario";
import { paraSlug } from "../../utils/paraSlug";
import { somentePreferenciasValidas } from "../../utils/preferencias";
import { ErroDeOrientacao, ErroUsuarioInexistente } from "../erros";
import { pedir, verificarResposta } from "./requisicao";

function paraEnum(valor: string | null): string | undefined {
  return valor === null ? undefined : valor.toUpperCase();
}

function paraCurvatura(valor: string | null): string | undefined {
  return valor === null ? undefined : `TYPE_${valor.toUpperCase()}`;
}

function corpoDoPerfil(
  usuarioId: number,
  perfil: PerfilParaSalvar,
): Record<string, unknown> {
  return {
    userId: usuarioId,
    gender: paraEnum(perfil.gender),
    ageRange: paraEnum(perfil.ageRange),
    hairPattern: paraCurvatura(perfil.hairType),
    skinType: paraEnum(perfil.skinType),
    skinPhototype: paraEnum(perfil.skinPhototype),
    skinSensitivity: paraEnum(perfil.skinSensitivity),
    scalpType: paraEnum(perfil.scalpType),
    isPregnant: perfil.isPregnant ?? undefined,
    isBreastfeeding: perfil.isBreastfeeding ?? undefined,
    acneProne: perfil.acneProne ?? undefined,
    hasRosacea: perfil.hasRosacea ?? undefined,
    hasEczema: perfil.hasEczema ?? undefined,
    hasHyperpigmentation: perfil.hasHyperpigmentation ?? undefined,
    hasMelasma: perfil.hasMelasma ?? undefined,
  };
}

function paraMinusculas<T extends string>(valor: unknown): T | null {
  return typeof valor === "string" ? (valor.toLowerCase() as T) : null;
}

function paraCurvaturaDoDominio(valor: unknown): TipoCabelo | null {
  if (typeof valor !== "string" || !valor.startsWith("TYPE_")) {
    return null;
  }

  return valor.slice(5).toLowerCase() as TipoCabelo;
}

function lerBooleano(valor: unknown): boolean | null {
  return typeof valor === "boolean" ? valor : null;
}

type CampoDesconhecido = Partial<Record<string, unknown>>;

function comoObjeto(valor: unknown): CampoDesconhecido {
  return typeof valor === "object" && valor !== null
    ? (valor as CampoDesconhecido)
    : {};
}

interface PreferenciaEmColuna {
  preferencia: Preferencia;
  coluna: string;
}

const PREFERENCIAS_EM_COLUNA: PreferenciaEmColuna[] = [
  { preferencia: "vegan", coluna: "preferVegan" },
  { preferencia: "crueltyFree", coluna: "preferCrueltyFree" },
  { preferencia: "parabenFree", coluna: "preferParabenFree" },
  { preferencia: "sulfateFree", coluna: "preferSulfateFree" },
  { preferencia: "siliconeFree", coluna: "preferSiliconeFree" },
];

interface PreferenciaEmEtiqueta {
  preferencia: Preferencia;
  nomes: string[];
}

const PREFERENCIAS_EM_ETIQUETA: PreferenciaEmEtiqueta[] = [
  { preferencia: "alcoholFree", nomes: ["Sem álcool"] },
  { preferencia: "oilFree", nomes: ["Sem óleo"] },
  { preferencia: "natural", nomes: ["Natural", "Ingredientes naturais"] },
  { preferencia: "organic", nomes: ["Orgânico"] },
  { preferencia: "hypoallergenic", nomes: ["Hipoalergênico"] },
  { preferencia: "nonComedogenic", nomes: ["Não comedogênico"] },
  {
    preferencia: "dermatologicallyTested",
    nomes: ["Testado dermatologicamente"],
  },
  { preferencia: "recyclablePackaging", nomes: ["Embalagem reciclável"] },
];

function preferenciaDaEtiqueta(valor: unknown): Preferencia | null {
  const etiqueta = comoObjeto(valor);
  const formas = [etiqueta.slug, etiqueta.name].flatMap((campo) =>
    typeof campo === "string" ? [paraSlug(campo)] : [],
  );

  const encontrada = PREFERENCIAS_EM_ETIQUETA.find(({ nomes }) =>
    nomes.some((nome) => formas.includes(paraSlug(nome))),
  );

  return encontrada === undefined ? null : encontrada.preferencia;
}

function lerPreferencias(colunas: unknown, etiquetas: unknown): Preferencia[] {
  const dados = comoObjeto(colunas);

  const dasColunas = PREFERENCIAS_EM_COLUNA.flatMap(({ preferencia, coluna }) =>
    dados[coluna] === true ? [preferencia] : [],
  );

  const dasEtiquetas = Array.isArray(etiquetas)
    ? etiquetas.flatMap((etiqueta) => {
        const preferencia = preferenciaDaEtiqueta(etiqueta);

        return preferencia === null ? [] : [preferencia];
      })
    : [];

  return somentePreferenciasValidas([...dasColunas, ...dasEtiquetas]);
}

function lerAlergias(valor: unknown): AlergiaParaSalvar[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor.flatMap((item) => {
    const detalhe = comoObjeto(item);
    const alergia = comoObjeto(detalhe.allergy);
    const id = alergia.id;

    if (typeof id !== "number") {
      return [];
    }

    return [
      {
        allergyId: String(id),
        severity: paraMinusculas<PersonalRiskLevel>(detalhe.severity),
      },
    ];
  });
}

export async function buscarPerfilNaApi(
  usuarioId: number,
): Promise<PerfilCarregado | null> {
  const caminho = `/api/users/${usuarioId}/full-profile`;
  const resposta = await pedir(`${URL_API}${caminho}`);

  if (resposta.status === 404) {
    throw new ErroUsuarioInexistente(usuarioId);
  }

  verificarResposta(resposta, caminho);

  const dados = comoObjeto(await resposta.json());
  const perfil = comoObjeto(dados.profile);

  if (Object.keys(perfil).length === 0) {
    return null;
  }

  const conta = comoObjeto(dados.user);
  const avatar = comoObjeto(dados.avatar);

  return {
    accountStatus: paraMinusculas<StatusConta>(conta.status),
    avatarUrl: typeof avatar.url === "string" ? avatar.url : null,
    perfil: {
      gender: paraMinusculas<Genero>(perfil.gender),
      ageRange: paraMinusculas<FaixaEtaria>(perfil.ageRange),
      hairType: paraCurvaturaDoDominio(perfil.hairPattern),
      skinType: paraMinusculas<TipoPele>(perfil.skinType),
      skinPhototype:
        typeof perfil.skinPhototype === "string"
          ? (perfil.skinPhototype as Fototipo)
          : null,
      skinSensitivity: paraMinusculas<NivelSensibilidade>(
        perfil.skinSensitivity,
      ),
      scalpType: paraMinusculas<TipoCouroCabeludo>(perfil.scalpType),
      isPregnant: lerBooleano(perfil.isPregnant),
      isBreastfeeding: lerBooleano(perfil.isBreastfeeding),
      acneProne: lerBooleano(perfil.acneProne),
      hasRosacea: lerBooleano(perfil.hasRosacea),
      hasEczema: lerBooleano(perfil.hasEczema),
      hasHyperpigmentation: lerBooleano(perfil.hasHyperpigmentation),
      hasMelasma: lerBooleano(perfil.hasMelasma),
      preferences: lerPreferencias(dados.preferences, dados.tags),
      allergies: lerAlergias(dados.allergies),
    },
  };
}

async function enviar(
  caminho: string,
  metodo: string,
  corpo?: Record<string, unknown>,
): Promise<void> {
  const resposta = await pedir(`${URL_API}${caminho}`, {
    method: metodo,
    headers:
      corpo === undefined ? undefined : { "Content-Type": "application/json" },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });

  verificarResposta(resposta, caminho);
}

async function usuarioExiste(usuarioId: number): Promise<boolean> {
  const resposta = await pedir(`${URL_API}/api/users/${usuarioId}`);

  return resposta.status !== 404;
}

function respostasCompletas(perfil: PerfilParaSalvar): boolean {
  return (
    perfil.gender !== null &&
    perfil.ageRange !== null &&
    perfil.hairType !== null &&
    perfil.skinType !== null &&
    perfil.skinPhototype !== null &&
    perfil.skinSensitivity !== null &&
    perfil.scalpType !== null &&
    perfil.isPregnant !== null &&
    perfil.isBreastfeeding !== null &&
    perfil.acneProne !== null &&
    perfil.hasRosacea !== null &&
    perfil.hasEczema !== null &&
    perfil.hasHyperpigmentation !== null &&
    perfil.hasMelasma !== null
  );
}

async function enviarPerfil(
  usuarioId: number,
  perfil: PerfilParaSalvar,
): Promise<void> {
  const corpo = corpoDoPerfil(usuarioId, perfil);
  const caminho = `/api/user-profiles/${usuarioId}`;

  const resposta = await pedir(`${URL_API}${caminho}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });

  if (resposta.ok) {
    return;
  }

  if (resposta.status !== 404) {
    verificarResposta(resposta, caminho);
  }

  if (!respostasCompletas(perfil)) {
    throw new ErroDeOrientacao(
      "Para criar o seu perfil, responda as onze perguntas. A API ainda não aceita perfil parcial.",
    );
  }

  const criacao = await pedir(`${URL_API}/api/user-profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });

  if (criacao.status === 409 && !(await usuarioExiste(usuarioId))) {
    throw new ErroUsuarioInexistente(usuarioId);
  }

  verificarResposta(criacao, "/api/user-profiles");
}

async function enviarPreferencias(
  usuarioId: number,
  preferencias: Preferencia[],
): Promise<void> {
  const corpo: Record<string, unknown> = {
    userId: usuarioId,
    preferFragranceFree: false,
    preferSustainable: false,
  };

  for (const { preferencia, coluna } of PREFERENCIAS_EM_COLUNA) {
    corpo[coluna] = preferencias.includes(preferencia);
  }

  const caminho = `/api/user-preferences/${usuarioId}`;

  const resposta = await pedir(`${URL_API}${caminho}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });

  if (resposta.ok) {
    return;
  }

  if (resposta.status !== 404) {
    verificarResposta(resposta, caminho);
  }

  await enviar("/api/user-preferences", "POST", corpo);
}

const TAMANHO_PAGINA = 100;
const LIMITE_PAGINAS = 20;

async function lerTodasAsPaginas(caminhoBase: string): Promise<unknown[]> {
  const itens: unknown[] = [];

  for (let pagina = 0; pagina < LIMITE_PAGINAS; pagina += 1) {
    const caminho = `${caminhoBase}?page=${pagina}&size=${TAMANHO_PAGINA}`;
    const resposta = await pedir(`${URL_API}${caminho}`);

    verificarResposta(resposta, caminho);

    const dados = comoObjeto(await resposta.json());
    const daPagina = Array.isArray(dados.content) ? dados.content : [];

    itens.push(...daPagina);

    if (dados.last === true || daPagina.length < TAMANHO_PAGINA) {
      break;
    }
  }

  return itens;
}

async function lerAlergiasSalvas(
  usuarioId: number,
): Promise<Map<number, string | null>> {
  const salvas = new Map<number, string | null>();
  const itens = await lerTodasAsPaginas(`/api/user-allergies/user/${usuarioId}`);

  for (const item of itens) {
    const alergia = comoObjeto(item);

    if (typeof alergia.allergyId === "number") {
      salvas.set(
        alergia.allergyId,
        typeof alergia.severity === "string" ? alergia.severity : null,
      );
    }
  }

  return salvas;
}

async function sincronizarAlergias(
  usuarioId: number,
  alergias: AlergiaParaSalvar[],
): Promise<void> {
  const salvas = await lerAlergiasSalvas(usuarioId);
  const desejadas = new Set(
    alergias.map((alergia) => Number(alergia.allergyId)),
  );

  for (const alergia of alergias) {
    const id = Number(alergia.allergyId);
    const gravidade = paraEnum(alergia.severity);
    const corpo = {
      userId: usuarioId,
      allergyId: id,
      severity: gravidade,
    };

    if (!salvas.has(id)) {
      await enviar("/api/user-allergies", "POST", corpo);
      continue;
    }

    if (salvas.get(id) !== (gravidade ?? null)) {
      await enviar(
        `/api/user-allergies/user/${usuarioId}/allergy/${id}`,
        "PATCH",
        corpo,
      );
    }
  }

  for (const id of salvas.keys()) {
    if (!desejadas.has(id)) {
      await enviar(
        `/api/user-allergies/user/${usuarioId}/allergy/${id}`,
        "DELETE",
      );
    }
  }
}

async function lerCatalogoDeEtiquetas(): Promise<Map<Preferencia, number>> {
  const caminho = "/api/profile-tags/preferences";
  const resposta = await pedir(`${URL_API}${caminho}`);

  verificarResposta(resposta, caminho);

  const itens: unknown = await resposta.json();
  const catalogo = new Map<Preferencia, number>();

  if (!Array.isArray(itens)) {
    return catalogo;
  }

  for (const item of itens) {
    const id = comoObjeto(item).id;
    const preferencia = preferenciaDaEtiqueta(item);

    if (typeof id === "number" && preferencia !== null) {
      catalogo.set(preferencia, id);
    }
  }

  return catalogo;
}

async function lerEtiquetasSalvas(usuarioId: number): Promise<Set<number>> {
  const itens = await lerTodasAsPaginas(
    `/api/user-profile-tags/user/${usuarioId}`,
  );

  return new Set(
    itens.flatMap((item) => {
      const id = comoObjeto(item).profileTagId;

      return typeof id === "number" ? [id] : [];
    }),
  );
}

async function sincronizarEtiquetas(
  usuarioId: number,
  preferencias: Preferencia[],
): Promise<void> {
  const catalogo = await lerCatalogoDeEtiquetas();
  const salvas = await lerEtiquetasSalvas(usuarioId);

  for (const [preferencia, etiquetaId] of catalogo) {
    const escolhida = preferencias.includes(preferencia);

    if (escolhida && !salvas.has(etiquetaId)) {
      await enviar("/api/user-profile-tags", "POST", {
        userId: usuarioId,
        profileTagId: etiquetaId,
      });
    }

    if (!escolhida && salvas.has(etiquetaId)) {
      await enviar(
        `/api/user-profile-tags/user/${usuarioId}/profile-tag/${etiquetaId}`,
        "DELETE",
      );
    }
  }

  const semEtiqueta = PREFERENCIAS_EM_ETIQUETA.filter(
    ({ preferencia }) =>
      preferencias.includes(preferencia) && !catalogo.has(preferencia),
  );

  if (semEtiqueta.length > 0) {
    throw new ErroDeOrientacao(
      "O perfil foi salvo, mas algumas preferências ainda não existem na API e ficaram de fora. Tente de novo mais tarde.",
    );
  }
}

export async function salvarPerfilNaApi(
  usuarioId: number,
  perfil: PerfilParaSalvar,
): Promise<void> {
  await enviarPerfil(usuarioId, perfil);
  await enviarPreferencias(usuarioId, perfil.preferences);
  await sincronizarAlergias(usuarioId, perfil.allergies);
  await sincronizarEtiquetas(usuarioId, perfil.preferences);
}

