import type { MotivoDenuncia } from "../types/avaliacao";

export const MOTIVOS_DE_DENUNCIA: MotivoDenuncia[] = [
  "offensive",
  "spam",
  "false_information",
  "sexual_content",
  "other",
];

export const ROTULO_DO_MOTIVO_DE_DENUNCIA: Record<MotivoDenuncia, string> = {
  offensive: "Conteúdo ofensivo ou discurso de ódio",
  spam: "Spam ou propaganda",
  false_information: "Informação falsa sobre o produto",
  sexual_content: "Conteúdo sexual ou impróprio",
  other: "Outro motivo",
};
