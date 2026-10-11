import type { IngredienteAvaliado } from "../types/ingrediente";

const NOMES_DE_FRAGRANCIA = ["parfum", "fragrance", "aroma"];

export function ehFragrancia(inciName: string): boolean {
  return NOMES_DE_FRAGRANCIA.includes(inciName.toLowerCase());
}

export function temFragrancia(ingredientes: IngredienteAvaliado[]): boolean {
  return ingredientes.some((item) => ehFragrancia(item.inciName));
}
