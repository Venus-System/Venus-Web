import { USAR_MOCK } from "../config/ambiente";
import { buscarPerfilNaApi, salvarPerfilNaApi } from "./api/perfil";
import { idDoUsuarioNaApi, renovarIdDoUsuarioNaApi } from "./autenticacao";
import {
  ErroDeOrientacao,
  ErroServicoIndisponivel,
  ErroUsuarioInexistente,
} from "./erros";
import { simularLatencia } from "./mocks/atraso";
import { guardarPerfilFalso, lerPerfilFalso } from "./mocks/perfil";
import type { PerfilCarregado, PerfilParaSalvar } from "../types/perfil";
import type { RespostasQuestionario } from "../types/questionario";
import type { CondicaoPele } from "../types/usuario";

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

function estaAmamentando(
  situacao: RespostasQuestionario["currentSituation"],
): boolean | null {
  if (situacao === "" || situacao === "prefer_not_say") {
    return null;
  }

  return situacao === "breastfeeding" || situacao === "pregnant_breastfeeding";
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
    isBreastfeeding: consentiu
      ? estaAmamentando(respostas.currentSituation)
      : null,
    acneProne: temCondicao(condicoes, "acneProne"),
    hasRosacea: temCondicao(condicoes, "hasRosacea"),
    hasEczema: temCondicao(condicoes, "hasEczema"),
    hasHyperpigmentation: temCondicao(condicoes, "hasHyperpigmentation"),
    hasMelasma: temCondicao(condicoes, "hasMelasma"),
    preferences: respostas.preferences,
    allergies: consentiu
      ? respostas.allergies.map((alergia) => ({
          allergyId: alergia.id,
          severity: alergia.severity === "" ? null : alergia.severity,
        }))
      : [],
  };
}


function lerCondicoes(perfil: PerfilParaSalvar): CondicaoPele[] {
  const marcadas: CondicaoPele[] = [];
  const respondeu =
    perfil.acneProne !== null ||
    perfil.hasRosacea !== null ||
    perfil.hasEczema !== null ||
    perfil.hasHyperpigmentation !== null ||
    perfil.hasMelasma !== null;

  if (!respondeu) {
    return marcadas;
  }

  if (perfil.acneProne === true) {
    marcadas.push("acneProne");
  }

  if (perfil.hasRosacea === true) {
    marcadas.push("hasRosacea");
  }

  if (perfil.hasEczema === true) {
    marcadas.push("hasEczema");
  }

  if (perfil.hasHyperpigmentation === true) {
    marcadas.push("hasHyperpigmentation");
  }

  if (perfil.hasMelasma === true) {
    marcadas.push("hasMelasma");
  }

  return marcadas.length === 0 ? ["none"] : marcadas;
}

function lerSituacao(
  isPregnant: boolean | null,
  isBreastfeeding: boolean | null,
): RespostasQuestionario["currentSituation"] {
  if (isPregnant === null && isBreastfeeding === null) {
    return "";
  }

  if (isPregnant === true && isBreastfeeding === true) {
    return "pregnant_breastfeeding";
  }

  if (isPregnant === true) {
    return "pregnant";
  }

  if (isBreastfeeding === true) {
    return "breastfeeding";
  }

  return "none";
}

function lerSensibilidade(
  nivel: PerfilParaSalvar["skinSensitivity"],
): RespostasQuestionario["skinSensitivity"] {
  if (nivel === null || nivel === "very_high") {
    return "";
  }

  return nivel;
}

export function paraRespostas(
  perfil: PerfilParaSalvar,
): RespostasQuestionario {
  return {
    gender: perfil.gender ?? "",
    hairCurvature: perfil.hairType ?? "",
    skinType: perfil.skinType ?? "",
    ageRange: perfil.ageRange ?? "",
    skinPhototype: perfil.skinPhototype ?? "",
    skinSensitivity: lerSensibilidade(perfil.skinSensitivity),
    scalpType: perfil.scalpType ?? "",
    currentSituation: lerSituacao(perfil.isPregnant, perfil.isBreastfeeding),
    skinConditions: lerCondicoes(perfil),
    allergies: perfil.allergies.map((alergia) => ({
      id: alergia.allergyId,
      severity: alergia.severity ?? "",
    })),
    preferences: perfil.preferences,
    healthDataConsent:
      perfil.skinType !== null ||
      perfil.skinPhototype !== null ||
      perfil.skinSensitivity !== null ||
      perfil.scalpType !== null ||
      perfil.isPregnant !== null ||
      perfil.isBreastfeeding !== null ||
      perfil.acneProne !== null ||
      perfil.hasRosacea !== null ||
      perfil.hasEczema !== null ||
      perfil.hasHyperpigmentation !== null ||
      perfil.hasMelasma !== null ||
      perfil.allergies.length > 0,
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

    try {
      await salvarPerfilNaApi(buscarIdNumerico(), perfil);
    } catch (erro) {
      if (!(erro instanceof ErroUsuarioInexistente)) {
        throw erro;
      }

      await salvarPerfilNaApi(await renovarIdNumerico(), perfil);
    }

    return perfil;
  } catch (erro) {
    if (
      erro instanceof ErroDeOrientacao ||
      erro instanceof ErroServicoIndisponivel
    ) {
      throw erro;
    }

    throw new Error("Não foi possível salvar o seu perfil.");
  }
}


function buscarIdNumerico(): number {
  const id = idDoUsuarioNaApi();

  if (id === null) {
    throw new ErroDeOrientacao(
      "Não conseguimos ligar esta conta ao cadastro da API neste navegador. Entre de novo e tente outra vez.",
    );
  }

  return id;
}

async function renovarIdNumerico(): Promise<number> {
  const id = await renovarIdDoUsuarioNaApi();

  if (id === null) {
    throw new ErroDeOrientacao(
      "Não conseguimos recriar o seu cadastro na API. Entre de novo e tente outra vez.",
    );
  }

  return id;
}

export async function buscarPerfil(): Promise<PerfilCarregado | null> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();

      return lerPerfilFalso();
    }

    try {
      return await buscarPerfilNaApi(buscarIdNumerico());
    } catch (erro) {
      if (!(erro instanceof ErroUsuarioInexistente)) {
        throw erro;
      }

      return await buscarPerfilNaApi(await renovarIdNumerico());
    }
  } catch (erro) {
    if (
      erro instanceof ErroDeOrientacao ||
      erro instanceof ErroServicoIndisponivel
    ) {
      throw erro;
    }

    throw new Error("Não foi possível carregar o seu perfil.");
  }
}
