import type { IngredienteAvaliado } from "../types/ingrediente";

const NOMES_DE_FRAGRANCIA = ["parfum", "fragrance", "aroma"];

export function ehFragrancia(inciName: string): boolean {
  return inciName
    .toLowerCase()
    .split("/")
    .some((parte) => NOMES_DE_FRAGRANCIA.includes(parte.trim()));
}

export function temFragrancia(ingredientes: IngredienteAvaliado[]): boolean {
  return ingredientes.some((item) => ehFragrancia(item.inciName));
}
