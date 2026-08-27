import type { IngredienteAvaliado } from "./ingrediente";
import type { Produto } from "./produto";

export type NivelRiscoPessoal = "low" | "medium" | "high" | "critical";

export type NivelRecomendacao =
  | "ideal"
  | "recommended"
  | "acceptable"
  | "not_recommended"
  | "contraindicated";

export interface AlertaPersonalizado {
  nomeInci: string;
  explicacao: string;
  deltaFinal: number;
}

export interface AnalisePersonalizada {
  notaFinal: number;
  compatibilidade: number;
  nivelRisco: NivelRiscoPessoal;
  nivelRecomendacao: NivelRecomendacao;
  resumo: string;
  alertas: AlertaPersonalizado[];
}

export interface AnaliseExibicao {
  produto: Produto;
  ingredientes: IngredienteAvaliado[];
  personalizada: AnalisePersonalizada | null;
}
