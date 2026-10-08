import type { IngredienteAvaliado, RiskLevel } from "../types/ingrediente";

const PRIORIDADE: Record<RiskLevel, number> = {
  avoid: 0,
  warning: 1,
  safe: 2,
  "no-data": 2,
};

export function ordenarPorRotulo(
  ingredientes: IngredienteAvaliado[],
): IngredienteAvaliado[] {
  return [...ingredientes].sort((a, b) => a.position - b.position);
}

export function ordenarPorRisco(
  ingredientes: IngredienteAvaliado[],
): IngredienteAvaliado[] {
  return ordenarPorRotulo(ingredientes).sort(
    (a, b) => PRIORIDADE[a.level] - PRIORIDADE[b.level],
  );
}

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
