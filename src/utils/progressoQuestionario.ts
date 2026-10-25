import type { RespostasQuestionario } from "../types/questionario";
import { guardar, ler, limpar } from "./armazenamento";
import { somentePreferenciasValidas } from "./preferencias";

const CHAVE_SEM_DONO = "venus.questionario";
const PREFIXO = "venus.questionario.";

function chaveDe(usuarioId: string): string {
  return `${PREFIXO}${usuarioId}`;
}

function ehRespostas(valor: unknown): valor is RespostasQuestionario {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "gender" in valor &&
    "allergies" in valor &&
    Array.isArray(valor.allergies) &&
    "skinConditions" in valor &&
    Array.isArray(valor.skinConditions) &&
    "preferences" in valor &&
    Array.isArray(valor.preferences)
  );
}

function semDadosDeSaude(
  respostas: RespostasQuestionario,
): RespostasQuestionario {
  return {
    ...respostas,
    skinType: "",
    skinPhototype: "",
    skinSensitivity: "",
    scalpType: "",
    currentSituation: "",
    skinConditions: [],
    allergies: [],
  };
}

export function lerProgresso(usuarioId: string): RespostasQuestionario | null {
  limpar(CHAVE_SEM_DONO);

  const progresso = ler(chaveDe(usuarioId), ehRespostas);

  if (progresso === null) {
    return null;
  }

  return {
    ...progresso,
    preferences: somentePreferenciasValidas(progresso.preferences),
  };
}

export function guardarProgresso(
  usuarioId: string,
  respostas: RespostasQuestionario,
): void {
  guardar(
    chaveDe(usuarioId),
    respostas.healthDataConsent ? respostas : semDadosDeSaude(respostas),
  );
}

export function limparProgresso(usuarioId: string): void {
  limpar(chaveDe(usuarioId));
}
