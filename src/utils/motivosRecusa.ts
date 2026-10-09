import type { MotivoRecusa } from "../types/admin";

export const MOTIVOS_DE_RECUSA: MotivoRecusa[] = [
  "ocr_misread",
  "illegible_photo",
  "duplicate_product",
  "not_cosmetic",
  "other",
];

export const ROTULO_DO_MOTIVO: Record<MotivoRecusa, string> = {
  ocr_misread: "Ingrediente lido errado",
  illegible_photo: "Foto ilegível ou cortada",
  duplicate_product: "Produto já existe no catálogo",
  not_cosmetic: "Não é um cosmético",
  other: "Outro motivo",
};
