import { URL_CLASSIFICACAO } from "../../config/ambiente";
import type {
  AnalisePersonalizada,
  MotivoDaAnalise,
  OrigemDoMotivo,
  PersonalRiskLevel,
} from "../../types/analise";
import { ErroDeOrientacao } from "../erros";
import { lerNivel } from "./analises";
import { comoObjeto, lerTodos, numero, texto } from "./leitura";
import { pedir, verificarResposta } from "./requisicao";

const RECUSAS = [
  "ANALYSIS_NOT_FOUND",
  "PROFILE_NOT_FOUND",
  "VERSION_UNDER_REVIEW",
  "NO_INGREDIENTS",
] as const;

export type RecusaDaClassificacao = (typeof RECUSAS)[number];

export type LeituraDaClassificacao =
  | { codigo: "OK"; analise: AnalisePersonalizada }
  | { codigo: RecusaDaClassificacao };

const RISCOS: PersonalRiskLevel[] = ["low", "medium", "high", "critical"];

const ORIGENS: OrigemDoMotivo[] = [
  "ingredient_rule",
  "allergy",
  "preference",
  "base_score",
];

const INICIO_DA_ALERGIA = "Contém ";
const FIM_DA_ALERGIA = ", ligado à sua alergia";

function emMinusculas(valor: unknown): string {
  return typeof valor === "string" ? valor.toLowerCase() : "";
}

function nomesNaFraseDeAlergia(frase: string): string[] {
  const fim = frase.indexOf(FIM_DA_ALERGIA);

  if (!frase.startsWith(INICIO_DA_ALERGIA) || fim === -1) {
    return [];
  }

  return frase
    .slice(INICIO_DA_ALERGIA.length, fim)
    .split(", ")
    .map((nome) => nome.trim())
    .filter((nome) => nome !== "");
}

function nomesDoMotivo(
  source: OrigemDoMotivo,
  text: string,
  ingredientName: string | null,
): string[] {
  if (source === "allergy") {
    return nomesNaFraseDeAlergia(text);
  }

  return ingredientName === null ? [] : [ingredientName];
}

function lerMotivo(
  valor: unknown,
  riscoCritico: boolean,
): MotivoDaAnalise | null {
  const dados = comoObjeto(valor);
  const text = texto(dados.text);

  if (text === null) {
    return null;
  }

  const origem = emMinusculas(dados.source);
  const source = ORIGENS.find((item) => item === origem) ?? "other";
  const warning = dados.warning === true;
  const ingredientName = texto(dados.ingredientName);
  const profileTagSlug = texto(dados.profileTagSlug);
  const impacto = numero(dados.impact);

  return {
    id: [source, ingredientName ?? "", profileTagSlug ?? "", text].join("|"),
    source,
    text,
    warning,
    blocking:
      riscoCritico &&
      warning &&
      source === "ingredient_rule" &&
      impacto === 0,
    bonus: !warning && impacto !== null && impacto > 0,
    ingredientName,
    ingredientNames: nomesDoMotivo(source, text, ingredientName),
    profileTagSlug,
  };
}

function semRepetidos(motivos: MotivoDaAnalise[]): MotivoDaAnalise[] {
  const vistos = new Set<string>();

  return motivos.filter((motivo) => {
    if (vistos.has(motivo.id)) {
      return false;
    }

    vistos.add(motivo.id);

    return true;
  });
}

export function lerClassificacao(
  valor: unknown,
  complete: boolean,
): AnalisePersonalizada | null {
  const dados = comoObjeto(valor);
  const notas = comoObjeto(dados.breakdown);
  const finalScore = numero(dados.finalScore);
  const recommendationLevel = lerNivel(dados.recommendationLevel);
  const risco = emMinusculas(dados.riskLevel);
  const riskLevel = RISCOS.find((item) => item === risco) ?? null;

  if (finalScore === null || recommendationLevel === null || riskLevel === null) {
    return null;
  }

  return {
    finalScore,
    recommendationLevel,
    riskLevel,
    compatibilityPercentage: numero(dados.compatibilityPercentage),
    summary: texto(dados.summary) ?? "",
    reasons: semRepetidos(
      lerTodos(Array.isArray(dados.reasons) ? dados.reasons : [], (motivo) =>
        lerMotivo(motivo, riskLevel === "critical"),
      ),
    ),
    breakdown: {
      qualityScore: numero(notas.qualityScore),
      qualityPoints: numero(notas.qualityPoints),
      profilePoints: numero(notas.profilePoints),
      healthScore: numero(notas.healthScore),
      environmentalScore: numero(notas.environmentalScore),
      ethicalScore: numero(notas.ethicalScore),
      performanceScore: numero(notas.performanceScore),
    },
    ingredientCount: numero(dados.ingredientCount),
    unevaluatedIngredientCount: numero(dados.unevaluatedIngredientCount),
    calculatedAt: texto(dados.calculatedAt) ?? "",
    complete,
  };
}

async function lerCorpo(resposta: Response): Promise<unknown> {
  try {
    return await resposta.json();
  } catch {
    return null;
  }
}

async function interpretar(
  resposta: Response,
  caminho: string,
  complete: boolean,
): Promise<LeituraDaClassificacao> {
  if (resposta.status === 401 || resposta.status === 403) {
    throw new ErroDeOrientacao(
      "Entre de novo para ver a análise feita para o seu perfil.",
    );
  }

  if (resposta.status === 404 || resposta.status === 422) {
    const codigo = comoObjeto(await lerCorpo(resposta)).code;
    const recusa = RECUSAS.find((item) => item === codigo);

    if (recusa !== undefined) {
      return { codigo: recusa };
    }
  }

  verificarResposta(resposta, caminho);

  const analise = lerClassificacao(await lerCorpo(resposta), complete);

  if (analise === null) {
    throw new Error("A análise não veio no formato esperado.");
  }

  return { codigo: "OK", analise };
}

export async function buscarUltimaClassificacaoNaApi(
  usuarioId: number,
  versaoId: number,
): Promise<LeituraDaClassificacao> {
  const caminho = `/api/classifications/user/${usuarioId}/product-version/${versaoId}`;
  const resposta = await pedir(`${URL_CLASSIFICACAO}${caminho}`);

  return interpretar(resposta, caminho, false);
}

export async function calcularClassificacaoNaApi(
  usuarioId: number,
  versaoId: number,
): Promise<LeituraDaClassificacao> {
  const caminho = "/api/classifications";
  const resposta = await pedir(`${URL_CLASSIFICACAO}${caminho}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: usuarioId, productVersionId: versaoId }),
  });

  return interpretar(resposta, caminho, true);
}
