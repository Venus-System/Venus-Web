import type { RespostasQuestionario } from "../types/questionario";

export const CAMPOS_BASICOS = 3;
const CAMPOS_DE_SAUDE = 6;

export function contarPreenchidas(respostas: RespostasQuestionario): number {
  const basicos = [
    respostas.gender,
    respostas.hairCurvature,
    respostas.ageRange,
  ];

  const preenchidos = basicos.filter((valor) => valor !== "").length;

  if (!respostas.healthDataConsent) {
    return preenchidos;
  }

  const saude = [
    respostas.skinType,
    respostas.skinPhototype,
    respostas.skinSensitivity,
    respostas.scalpType,
    respostas.currentSituation,
  ];

  const condicoes = respostas.skinConditions.length > 0 ? 1 : 0;

  return (
    preenchidos + saude.filter((valor) => valor !== "").length + condicoes
  );
}

export function totalDeRespostas(respostas: RespostasQuestionario): number {
  return respostas.healthDataConsent
    ? CAMPOS_BASICOS + CAMPOS_DE_SAUDE
    : CAMPOS_BASICOS;
}

export function porcentagemDoPerfil(respostas: RespostasQuestionario): number {
  return Math.round(
    (contarPreenchidas(respostas) / totalDeRespostas(respostas)) * 100,
  );
}
