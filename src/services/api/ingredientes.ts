import { URL_API } from "../../config/ambiente";
import type {
  Ingrediente,
  IngredienteAvaliado,
  RiskLevel,
} from "../../types/ingrediente";
import { comoObjeto, lerTodos, numero, texto } from "./leitura";
import { pedir, verificarResposta } from "./requisicao";

interface ItemDaComposicao {
  id: number;
  ingredientId: number;
  position: number;
}

const ingredientesPorId = new Map<number, Ingrediente | null>();

function lerItemDaComposicao(valor: unknown): ItemDaComposicao | null {
  const dados = comoObjeto(valor);
  const id = numero(dados.id);
  const ingredientId = numero(dados.ingredientId);
  const position = numero(dados.position);

  return id === null || ingredientId === null || position === null
    ? null
    : { id, ingredientId, position };
}

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

function nivelDoIngrediente(ingrediente: Ingrediente | null): RiskLevel {
  if (ingrediente === null || ingrediente.scientificConfidence === 0) {
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

async function buscarIngrediente(
  id: number,
  sinal?: AbortSignal,
): Promise<Ingrediente | null> {
  const guardado = ingredientesPorId.get(id);

  if (guardado !== undefined) {
    return guardado;
  }

  const caminho = `/api/ingredients/${id}`;
  const resposta = await pedir(`${URL_API}${caminho}`, { signal: sinal });

  if (resposta.status === 404) {
    ingredientesPorId.set(id, null);
    return null;
  }

  verificarResposta(resposta, caminho);

  const ingrediente = lerIngrediente(await resposta.json());
  ingredientesPorId.set(id, ingrediente);

  return ingrediente;
}

export async function buscarIngredientesDaVersao(
  versaoId: number,
  sinal?: AbortSignal,
): Promise<IngredienteAvaliado[]> {
  const caminho = `/api/product-ingredients/product-version/${versaoId}`;
  const resposta = await pedir(`${URL_API}${caminho}`, { signal: sinal });

  verificarResposta(resposta, caminho);

  const dados: unknown = await resposta.json();
  const composicao = Array.isArray(dados)
    ? lerTodos(dados, lerItemDaComposicao)
    : [];

  const ingredientes = await Promise.all(
    composicao.map((item) => buscarIngrediente(item.ingredientId, sinal)),
  );

  return composicao
    .map((item, posicao): IngredienteAvaliado => {
      const ingrediente = ingredientes[posicao] ?? null;

      return {
        id: item.id,
        inciName: ingrediente?.inciName ?? "Ingrediente sem cadastro",
        position: item.position,
        level: nivelDoIngrediente(ingrediente),
        ingredient: ingrediente,
      };
    })
    .sort((a, b) => a.position - b.position);
}
