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

export const TOTAL_DE_CAMPOS = CAMPOS.length;

const ROTULO_DA_AUTORIZACAO = "Perguntas de pele e saúde (precisa autorizar)";

function respondido(
  campo: CampoContado,
  respostas: RespostasQuestionario,
): boolean {
  return (
    (!campo.deSaude || respostas.healthDataConsent) &&
    campo.preenchido(respostas)
  );
}

export function contarPreenchidas(respostas: RespostasQuestionario): number {
  return CAMPOS.filter((campo) => respondido(campo, respostas)).length;
}

export function camposSemResposta(
  respostas: RespostasQuestionario,
  idDaAutorizacao: string,
): CampoDoPerfil[] {
  const vazios = CAMPOS.filter(
    (campo) =>
      (!campo.deSaude || respostas.healthDataConsent) &&
      !campo.preenchido(respostas),
  ).map(({ id, rotulo }) => ({ id, rotulo }));

  return respostas.healthDataConsent
    ? vazios
    : [...vazios, { id: idDaAutorizacao, rotulo: ROTULO_DA_AUTORIZACAO }];
}

export function porcentagemDoPerfil(respostas: RespostasQuestionario): number {
  return Math.round((contarPreenchidas(respostas) / TOTAL_DE_CAMPOS) * 100);
}
