import type { IngredienteAvaliado } from "../types/ingrediente";

const NOMES_DE_FRAGRANCIA = ["parfum", "fragrance", "aroma"];

export function temFragrancia(ingredientes: IngredienteAvaliado[]): boolean {
  return ingredientes.some((item) =>
    NOMES_DE_FRAGRANCIA.includes(item.inciName.toLowerCase()),
  );
}
