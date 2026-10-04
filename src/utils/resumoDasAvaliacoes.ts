import type {
  Avaliacao,
  Estrelas,
  ResumoDasAvaliacoes,
} from "../types/avaliacao";

const ESTRELAS: Estrelas[] = [1, 2, 3, 4, 5];

function estrelasDa(nota: number): Estrelas {
  const limitada = Math.min(Math.max(Math.round(nota), 1), 5);

  return ESTRELAS[limitada - 1];
}

export function resumirAvaliacoes(
  avaliacoes: Avaliacao[],
  truncated: boolean,
): ResumoDasAvaliacoes {
  const distribution: Record<Estrelas, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  avaliacoes.forEach((avaliacao) => {
    distribution[estrelasDa(avaliacao.rating)] += 1;
  });

  const soma = avaliacoes.reduce((total, item) => total + item.rating, 0);

  return {
    average:
      avaliacoes.length === 0
        ? null
        : Math.round((soma / avaliacoes.length) * 10) / 10,
    count: avaliacoes.length,
    truncated,
    distribution,
  };
}
