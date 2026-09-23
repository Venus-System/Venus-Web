import { URL_API } from "../../config/ambiente";
import type {
  AlergiaParaSalvar,
  FaixaEtaria,
  Fototipo,
  Genero,
  NivelSensibilidade,
  PerfilCarregado,
  PerfilParaSalvar,
  PreferenciasPerfil,
  TipoCabelo,
  TipoCouroCabeludo,
  TipoPele,
} from "../../types/perfil";
import type { PersonalRiskLevel } from "../../types/analise";
import type { StatusConta } from "../../types/usuario";
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

function lerPreferencias(valor: unknown): PreferenciasPerfil {
  const dados = comoObjeto(valor);

  return {
    preferCrueltyFree: dados.preferCrueltyFree === true,
    preferVegan: dados.preferVegan === true,
    preferSustainable: dados.preferSustainable === true,
    preferFragranceFree: dados.preferFragranceFree === true,
    preferParabenFree: dados.preferParabenFree === true,
    preferSulfateFree: dados.preferSulfateFree === true,
    preferSiliconeFree: dados.preferSiliconeFree === true,
  };
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
      preferences: lerPreferencias(dados.preferences),
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
  preferencias: PreferenciasPerfil,
): Promise<void> {
  const corpo = { userId: usuarioId, ...preferencias };
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

async function lerAlergiasSalvas(
  usuarioId: number,
): Promise<Map<number, string | null>> {
  const salvas = new Map<number, string | null>();

  for (let pagina = 0; pagina < LIMITE_PAGINAS; pagina += 1) {
    const caminho = `/api/user-allergies/user/${usuarioId}?page=${pagina}&size=${TAMANHO_PAGINA}`;
    const resposta = await pedir(`${URL_API}${caminho}`);

    verificarResposta(resposta, caminho);

    const dados = comoObjeto(await resposta.json());
    const itens = Array.isArray(dados.content) ? dados.content : [];

    for (const item of itens) {
      const alergia = comoObjeto(item);

      if (typeof alergia.allergyId === "number") {
        salvas.set(
          alergia.allergyId,
          typeof alergia.severity === "string" ? alergia.severity : null,
        );
      }
    }

    if (dados.last === true || itens.length < TAMANHO_PAGINA) {
      break;
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

export async function salvarPerfilNaApi(
  usuarioId: number,
  perfil: PerfilParaSalvar,
): Promise<void> {
  await enviarPerfil(usuarioId, perfil);
  await enviarPreferencias(usuarioId, perfil.preferences);
  await sincronizarAlergias(usuarioId, perfil.allergies);
}

