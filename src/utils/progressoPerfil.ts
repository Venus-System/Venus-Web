import type { RespostasQuestionario } from "../types/questionario";

export interface CampoDoPerfil {
  id: string;
  rotulo: string;
}

interface CampoContado extends CampoDoPerfil {
  deSaude: boolean;
  preenchido: (respostas: RespostasQuestionario) => boolean;
}

const CAMPOS: CampoContado[] = [
  {
    id: "faixa-etaria",
    rotulo: "Faixa etária",
    deSaude: false,
    preenchido: (respostas) => respostas.ageRange !== "",
  },
  {
    id: "genero",
    rotulo: "Gênero",
    deSaude: false,
    preenchido: (respostas) => respostas.gender !== "",
  },
  {
    id: "tipo-pele",
    rotulo: "Tipo de pele",
    deSaude: true,
    preenchido: (respostas) => respostas.skinType !== "",
  },
  {
    id: "fototipo",
    rotulo: "Fototipo de pele",
    deSaude: true,
    preenchido: (respostas) => respostas.skinPhototype !== "",
  },
  {
    id: "sensibilidade",
    rotulo: "Sensibilidade da pele",
    deSaude: true,
    preenchido: (respostas) => respostas.skinSensitivity !== "",
  },
  {
    id: "curvatura-cabelo",
    rotulo: "Tipo de cabelo",
    deSaude: false,
    preenchido: (respostas) => respostas.hairCurvature !== "",
  },
  {
    id: "couro-cabeludo",
    rotulo: "Couro cabeludo",
    deSaude: true,
    preenchido: (respostas) => respostas.scalpType !== "",
  },
  {
    id: "situacao-atual",
    rotulo: "Situação atual",
    deSaude: true,
    preenchido: (respostas) => respostas.currentSituation !== "",
  },
  {
    id: "condicoes-pele",
    rotulo: "Condições de pele",
    deSaude: true,
    preenchido: (respostas) => respostas.skinConditions.length > 0,
  },
];

export const CAMPOS_BASICOS = CAMPOS.filter((campo) => !campo.deSaude).length;

function camposContados(respostas: RespostasQuestionario): CampoContado[] {
  return CAMPOS.filter(
    (campo) => !campo.deSaude || respostas.healthDataConsent,
  );
}

export function contarPreenchidas(respostas: RespostasQuestionario): number {
  return camposContados(respostas).filter((campo) =>
    campo.preenchido(respostas),
  ).length;
}

export function totalDeRespostas(respostas: RespostasQuestionario): number {
  return camposContados(respostas).length;
}

export function camposSemResposta(
  respostas: RespostasQuestionario,
): CampoDoPerfil[] {
  return camposContados(respostas)
    .filter((campo) => !campo.preenchido(respostas))
    .map(({ id, rotulo }) => ({ id, rotulo }));
}

export function porcentagemDoPerfil(respostas: RespostasQuestionario): number {
  return Math.round(
    (contarPreenchidas(respostas) / totalDeRespostas(respostas)) * 100,
  );
}
