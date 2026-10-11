import type { NotasProduto } from "../types/produto";

export type CampoDeNota = keyof Pick<
  NotasProduto,
  "healthScore" | "environmentalScore" | "ethicalScore" | "performanceScore"
>;

export type NotasDeQualidade = Pick<NotasProduto, CampoDeNota>;

export interface NotaDeQualidade {
  campo: CampoDeNota;
  rotulo: string;
}

export const NOTAS_DE_QUALIDADE: NotaDeQualidade[] = [
  { campo: "healthScore", rotulo: "Saúde" },
  { campo: "environmentalScore", rotulo: "Ambiental" },
  { campo: "ethicalScore", rotulo: "Ético" },
  { campo: "performanceScore", rotulo: "Desempenho" },
];
