import type { IngredienteAvaliado } from "../types/ingrediente";

export function alertasDe(
  ingredientes: IngredienteAvaliado[],
): IngredienteAvaliado[] {
  const vistos = new Set<string>();

  return ingredientes.filter((item) => {
    if (item.level !== "warning" && item.level !== "avoid") {
      return false;
    }

    if (vistos.has(item.inciName)) {
      return false;
    }

    vistos.add(item.inciName);

    return true;
  });
}

export function semAvaliacao(ingredientes: IngredienteAvaliado[]): boolean {
  return ingredientes.every((item) => item.level === "no-data");
}
