import { USAR_MOCK } from "../config/ambiente";
import { salvarPerfilNaApi } from "./api/perfil";
import { simularLatencia } from "./mocks/atraso";
import { guardarPerfilFalso, lerPerfilFalso } from "./mocks/perfil";
import type { PerfilParaSalvar, PreferenciasPerfil } from "../types/perfil";
import type { RespostasQuestionario } from "../types/questionario";
import type { CondicaoPele } from "../types/usuario";

const PREFERENCIAS_VAZIAS: PreferenciasPerfil = {
  preferCrueltyFree: false,
  preferVegan: false,
  preferSustainable: false,
  preferFragranceFree: false,
  preferParabenFree: false,
  preferSulfateFree: false,
  preferSiliconeFree: false,
};

function montarPreferencias(
  escolhidas: Array<keyof PreferenciasPerfil>,
): PreferenciasPerfil {
  const preferencias = { ...PREFERENCIAS_VAZIAS };

  for (const chave of escolhidas) {
    preferencias[chave] = true;
  }

  return preferencias;
}

function temCondicao(
  marcadas: CondicaoPele[],
  condicao: CondicaoPele,
): boolean | null {
  return marcadas.length === 0 ? null : marcadas.includes(condicao);
}

function estaGestante(
  situacao: RespostasQuestionario["currentSituation"],
): boolean | null {
  if (situacao === "" || situacao === "prefer_not_say") {
    return null;
  }

  return situacao === "pregnant" || situacao === "pregnant_breastfeeding";
}

function comConsentimento<T>(consentiu: boolean, valor: T | ""): T | null {
  return consentiu && valor !== "" ? valor : null;
}

function converter(respostas: RespostasQuestionario): PerfilParaSalvar {
  const consentiu = respostas.healthDataConsent;
  const condicoes = consentiu ? respostas.skinConditions : [];

  return {
    gender: respostas.gender === "" ? null : respostas.gender,
    ageRange: respostas.ageRange === "" ? null : respostas.ageRange,
    hairType: respostas.hairCurvature === "" ? null : respostas.hairCurvature,
    skinType: comConsentimento(consentiu, respostas.skinType),
    skinPhototype: comConsentimento(consentiu, respostas.skinPhototype),
    skinSensitivity: comConsentimento(consentiu, respostas.skinSensitivity),
    scalpType: comConsentimento(consentiu, respostas.scalpType),
    isPregnant: consentiu ? estaGestante(respostas.currentSituation) : null,
    acneProne: temCondicao(condicoes, "acneProne"),
    hasRosacea: temCondicao(condicoes, "hasRosacea"),
    hasEczema: temCondicao(condicoes, "hasEczema"),
    hasHyperpigmentation: temCondicao(condicoes, "hasHyperpigmentation"),
    hasMelasma: temCondicao(condicoes, "hasMelasma"),
    preferences: montarPreferencias(respostas.preferences),
    allergies: consentiu
      ? respostas.allergies.map((alergia) => ({
          allergyId: alergia.id,
          severity: alergia.severity === "" ? null : alergia.severity,
        }))
      : [],
  };
}


export async function salvarPerfil(
  respostas: RespostasQuestionario,
): Promise<PerfilParaSalvar> {
  try {
    const perfil = converter(respostas);

    if (USAR_MOCK) {
      await simularLatencia();
      guardarPerfilFalso(perfil);

      return perfil;
    }

    await salvarPerfilNaApi(await buscarIdNumerico(), perfil);

    return perfil;
  } catch {
    throw new Error("Não foi possível salvar o seu perfil.");
  }
}


async function buscarIdNumerico(): Promise<number> {
  throw new Error(
    "A API ainda não expõe a busca de usuário pelo uid do Firebase.",
  );
}

export async function buscarPerfil(): Promise<PerfilParaSalvar | null> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();

      return lerPerfilFalso();
    }

    await buscarIdNumerico();

    return null;
  } catch {
    throw new Error("Não foi possível carregar o seu perfil.");
  }
}
