import type { NivelRecomendacao } from "../../types/analise";
import type { PaginaDoHistorico } from "../../types/historico";
import type { AnaliseRecente } from "../../types/painel";
import type { Produto } from "../../types/produto";
import { doPainel, horasAtras } from "./painel";
import {
  gelLimpezaPurificante,
  hidratanteCeramidas,
  locaoClareadoraNoturna,
  oleoCapilarReparador,
  serumCalmanteAveia,
} from "./produtos";

interface ProdutoComNota {
  produto: Produto;
  nota: number | null;
  nivel: NivelRecomendacao | null;
}

const PRODUTOS: ProdutoComNota[] = [
  { produto: serumCalmanteAveia, nota: 87, nivel: "ideal" },
  { produto: gelLimpezaPurificante, nota: 54, nivel: "acceptable" },
  { produto: hidratanteCeramidas, nota: 78, nivel: "recommended" },
  { produto: locaoClareadoraNoturna, nota: 12, nivel: "contraindicated" },
  { produto: oleoCapilarReparador, nota: null, nivel: null },
];

const HORAS_ATRAS = [
  2, 6, 27, 49, 75, 120, 150, 216, 288, 360, 480, 600, 792, 912, 1056, 1224,
  1392, 1584, 1752, 1920, 2280, 2640, 3120, 3600, 4080,
];

function analisesDoMock(): AnaliseRecente[] {
  return HORAS_ATRAS.map((horas, posicao) => {
    const { produto, nota, nivel } = PRODUTOS[posicao % PRODUTOS.length];

    return {
      id: `historico-${posicao}`,
      product: doPainel(produto),
      finalScore: nota,
      recommendationLevel: nivel,
      analyzedAt: horasAtras(horas),
    };
  });
}

export function historicoDoMock(
  pagina: number,
  tamanho: number,
): PaginaDoHistorico {
  const analises = analisesDoMock();
  const inicio = pagina * tamanho;

  return {
    items: analises.slice(inicio, inicio + tamanho),
    hasMore: inicio + tamanho < analises.length,
  };
}
