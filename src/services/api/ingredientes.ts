import type {
  Ingrediente,
  IngredienteAvaliado,
  RiskLevel,
} from "../../types/ingrediente";
import { comoObjeto, lerTodos, numero, texto } from "./leitura";

function lerIngrediente(valor: unknown): Ingrediente | null {
  const dados = comoObjeto(valor);
  const inciName = texto(dados.inciName);

  if (inciName === null) {
    return null;
  }

  return {
    inciName,
    commonName: texto(dados.commonName) ?? inciName,
    functionSummary:
      texto(dados.functionSummary) ??
      "Ainda não temos a descrição deste ingrediente.",
    safetySummary: texto(dados.safetySummary) ?? "",
    biodegradability: numero(dados.biodegradabilityLevel) ?? 0,
    irritationRiskLevel: numero(dados.irritationRiskLevel) ?? 0,
    comedogenicityScore: numero(dados.comedogenicityScore) ?? 0,
    environmentalRiskLevel: numero(dados.environmentalRiskLevel) ?? 0,
    scientificConfidence: numero(dados.scientificConfidence) ?? 0,
  };
}

function nivelDoIngrediente(ingrediente: Ingrediente): RiskLevel {
  if (ingrediente.scientificConfidence === 0) {
    return "no-data";
  }

  const maiorRisco = Math.max(
    ingrediente.irritationRiskLevel,
    ingrediente.comedogenicityScore,
    ingrediente.environmentalRiskLevel,
  );

  if (maiorRisco >= 3) {
    return "avoid";
  }

  return maiorRisco === 2 ? "warning" : "safe";
}

function lerItemDoProduto(valor: unknown): IngredienteAvaliado | null {
  const dados = comoObjeto(valor);
  const position = numero(dados.position);
  const id = numero(comoObjeto(dados.ingredient).id);
  const ingrediente = lerIngrediente(dados.ingredient);

  if (position === null || id === null || ingrediente === null) {
    return null;
  }

  return {
    id,
    inciName: ingrediente.inciName,
    position,
    level: nivelDoIngrediente(ingrediente),
    ingredient: ingrediente,
  };
}

export function lerIngredientesDoProduto(
  valor: unknown,
): IngredienteAvaliado[] {
  return Array.isArray(valor)
    ? lerTodos(valor, lerItemDoProduto).sort((a, b) => a.position - b.position)
    : [];
}
