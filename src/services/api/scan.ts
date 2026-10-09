import type {
  Candidato,
  CandidatoResumo,
  EstadoIngrediente,
  IngredienteCandidato,
  IngredienteInterpretado,
  LadoEmbalagem,
} from "../../types/admin";
import { localizarNoTexto } from "../../utils/localizarNoTexto";

type CampoDesconhecido = Partial<Record<string, unknown>>;

const ESTADOS: EstadoIngrediente[] = ["known", "alias", "ambiguous", "new"];

function comoObjeto(valor: unknown): CampoDesconhecido {
  return typeof valor === "object" && valor !== null
    ? (valor as CampoDesconhecido)
    : {};
}

function texto(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() !== "" ? valor.trim() : null;
}

function numero(valor: unknown): number | null {
  return typeof valor === "number" ? valor : null;
}

function lerEstado(valor: unknown): EstadoIngrediente {
  const minusculo = typeof valor === "string" ? valor.toLowerCase() : "";

  return ESTADOS.find((estado) => estado === minusculo) ?? "new";
}

function lerCandidatos(valor: unknown): IngredienteCandidato[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor.flatMap((item) => {
    const dados = comoObjeto(item);
    const ingredientId = numero(dados.ingredientId);
    const inciName = texto(dados.inciName);

    return ingredientId === null || inciName === null
      ? []
      : [{ ingredientId, inciName }];
  });
}

function lerIngredientes(
  idDoScan: string,
  valor: unknown,
  textos: Record<LadoEmbalagem, string>,
): IngredienteInterpretado[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor
    .flatMap((item): IngredienteInterpretado[] => {
      const dados = comoObjeto(item);
      const position = numero(dados.position);
      const rawName = texto(dados.rawName);

      if (position === null || rawName === null) {
        return [];
      }

      const busca = comoObjeto(dados.match);

      return [
        {
          id: `${idDoScan}-${position}`,
          position,
          rawName,
          name: texto(busca.matchedName) ?? rawName,
          status: lerEstado(busca.status),
          ingredientId: numero(busca.ingredientId),
          candidates: lerCandidatos(busca.candidates),
          match: localizarNoTexto(textos, rawName),
        },
      ];
    })
    .sort((a, b) => a.position - b.position);
}

export function lerScan(valor: unknown): Candidato | null {
  const dados = comoObjeto(valor);
  const id = texto(dados.id);

  if (id === null) {
    return null;
  }

  const ocr = comoObjeto(dados.ocr);
  const frente = comoObjeto(ocr.front);
  const verso = comoObjeto(ocr.back);
  const extraido = comoObjeto(frente.extracted);
  const imagens = comoObjeto(dados.images);
  const origem = comoObjeto(dados.source);

  const textos = {
    front: texto(frente.fullText) ?? "",
    back: texto(verso.fullText) ?? "",
  };

  const ingredients = lerIngredientes(id, dados.ingredients, textos);
  const idDeQuemEnviou = numero(origem.userId);

  return {
    id,
    name: texto(extraido.productName) ?? "Produto sem nome lido",
    brand: texto(extraido.brand) ?? "Marca não lida",
    category: texto(extraido.category) ?? "Categoria não lida",
    submittedBy:
      texto(origem.userName) ??
      (idDeQuemEnviou === null ? "usuário" : `usuário ${idDeQuemEnviou}`),
    submittedAt: texto(dados.createdAt) ?? texto(dados.startedAt) ?? "",
    origin: "ocr",
    ingredientCount: ingredients.length,
    newIngredientCount: ingredients.filter((item) => item.status === "new")
      .length,
    ambiguousIngredientCount: ingredients.filter(
      (item) => item.status === "ambiguous",
    ).length,
    sources: {
      front: {
        photoUrl: texto(comoObjeto(imagens.front).secureUrl),
        rawText: textos.front,
      },
      back: {
        photoUrl: texto(comoObjeto(imagens.back).secureUrl),
        rawText: textos.back,
      },
    },
    ingredients,
  };
}

export function paraResumo(candidato: Candidato): CandidatoResumo {
  return {
    id: candidato.id,
    name: candidato.name,
    brand: candidato.brand,
    category: candidato.category,
    submittedBy: candidato.submittedBy,
    submittedAt: candidato.submittedAt,
    origin: candidato.origin,
    ingredientCount: candidato.ingredientCount,
    newIngredientCount: candidato.newIngredientCount,
    ambiguousIngredientCount: candidato.ambiguousIngredientCount,
  };
}

export function lerListaDeScans(valor: unknown): Candidato[] {
  const conteudo = comoObjeto(valor).content;

  if (!Array.isArray(conteudo)) {
    throw new Error("A fila de aprovação não veio no formato esperado.");
  }

  return conteudo
    .flatMap((item) => {
      const candidato = lerScan(item);

      return candidato === null ? [] : [candidato];
    })
    .sort((a, b) => Date.parse(a.submittedAt) - Date.parse(b.submittedAt));
}
