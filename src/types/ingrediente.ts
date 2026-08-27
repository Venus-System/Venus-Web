export type NivelRisco = "seguro" | "atencao" | "evitar" | "sem-dados";

export interface Ingrediente {
  nomeInci: string;
  nomeComum: string;
  funcaoResumo: string;
  resumoSeguranca: string;
  biodegradabilidade: number;
  riscoIrritacao: number;
  comedogenicidade: number;
  riscoAmbiental: number;
  confiancaCientifica: number;
}

export interface IngredienteAvaliado {
  nomeInci: string;
  posicao: number;
  nivel: NivelRisco;
  ingrediente: Ingrediente | null;
}
