import type { IngredienteAvaliado, RiskLevel } from "../types/ingrediente";
import { ehFragrancia } from "./selos";

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

function nomesDoIngrediente(item: IngredienteAvaliado): string[] {
  return [item.inciName, item.ingredient?.commonName ?? ""]
    .filter((nome) => nome !== "")
    .map((nome) => nome.toLowerCase());
}

export function ehAlertaPessoal(
  item: IngredienteAvaliado,
  nomesEmAlerta: string[],
): boolean {
  const nomes = nomesDoIngrediente(item);

  return nomesEmAlerta.some((nome) => nomes.includes(nome.toLowerCase()));
}

function ordemDeDestaque(
  item: IngredienteAvaliado,
  nomesEmAlerta: string[],
): number {
  if (ehAlertaPessoal(item, nomesEmAlerta)) {
    return 0;
  }

  return ehFragrancia(item.inciName) ? 1 : 2;
}

export function ordenarPorDestaque(
  ingredientes: IngredienteAvaliado[],
  nomesEmAlerta: string[],
): IngredienteAvaliado[] {
  return ordenarPorRisco(ingredientes).sort(
    (a, b) =>
      ordemDeDestaque(a, nomesEmAlerta) - ordemDeDestaque(b, nomesEmAlerta),
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
