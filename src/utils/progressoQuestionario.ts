import type { RespostasQuestionario } from "../types/questionario";
import { guardar, ler, limpar } from "./armazenamento";

const CHAVE_PROGRESSO = "venus.questionario";

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

export function lerProgresso(): RespostasQuestionario | null {
  return ler(CHAVE_PROGRESSO, ehRespostas);
}

export function guardarProgresso(respostas: RespostasQuestionario): void {
  guardar(
    CHAVE_PROGRESSO,
    respostas.healthDataConsent ? respostas : semDadosDeSaude(respostas),
  );
}

export function limparProgresso(): void {
  limpar(CHAVE_PROGRESSO);
}
