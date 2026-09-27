import type { OrigemCandidato } from "../../types/admin";

export const ROTULO_ORIGEM: Record<OrigemCandidato, string> = {
  ocr: "OCR",
  user_submission: "Manual",
  import: "Importação",
};

export const ROTULO_ORIGEM_DETALHE: Record<OrigemCandidato, string> = {
  ocr: "OCR de usuário",
  user_submission: "Envio manual",
  import: "Importação",
};

export const ORIGENS: OrigemCandidato[] = ["ocr", "user_submission", "import"];

export function lerOrigemDaUrl(valor: string | null): OrigemCandidato | null {
  return ORIGENS.find((origem) => origem === valor) ?? null;
}

export function rotuloDePendencias(novos: number, ambiguos: number): string {
  const partes: string[] = [];

  if (novos > 0) {
    partes.push(novos === 1 ? "1 novo" : `${novos} novos`);
  }

  if (ambiguos > 0) {
    partes.push(ambiguos === 1 ? "1 ambíguo" : `${ambiguos} ambíguos`);
  }

  return partes.length === 0 ? "nenhum novo" : partes.join(" · ");
}
