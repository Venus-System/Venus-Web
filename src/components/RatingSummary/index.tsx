import type { Estrelas, ResumoDasAvaliacoes } from "../../types/avaliacao";
import StarRating from "../StarRating";
import styles from "./styles.module.css";

interface RatingSummaryProps {
  summary: ResumoDasAvaliacoes;
}

const LINHAS: Estrelas[] = [5, 4, 3, 2, 1];

const FORMATO_MEDIA = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function totalDeAvaliacoes(summary: ResumoDasAvaliacoes): string {
  const quantidade = summary.truncated ? `${summary.count}+` : summary.count;

  return summary.count === 1 ? "1 avaliação" : `${quantidade} avaliações`;
}

function RatingSummary({ summary }: RatingSummaryProps) {
  if (summary.average === null) {
    return <p className={styles.vazio}>Nenhuma avaliação ainda.</p>;
  }

  return (
    <div className={styles.resumo}>
      <div className={styles.topo}>
        <p className={styles.media}>{FORMATO_MEDIA.format(summary.average)}</p>
        <div className={styles.estrelas}>
          <StarRating rating={summary.average} size="medium" />
          <p className={styles.total}>{totalDeAvaliacoes(summary)}</p>
        </div>
      </div>

      <ul className={styles.distribuicao}>
        {LINHAS.map((estrelas) => {
          const quantidade = summary.distribution[estrelas];
          const largura =
            summary.count === 0 ? 0 : (quantidade / summary.count) * 100;

          return (
            <li key={estrelas} className={styles.linha}>
              <span aria-hidden="true">{estrelas}</span>
              <span className={styles.trilha} aria-hidden="true">
                <span
                  className={styles.preenchida}
                  style={{ width: `${largura}%` }}
                />
              </span>
              <span aria-hidden="true" className={styles.quantidade}>
                {quantidade}
              </span>
              <span className="texto-oculto">
                {estrelas === 1 ? "1 estrela" : `${estrelas} estrelas`}:{" "}
                {quantidade === 1 ? "1 avaliação" : `${quantidade} avaliações`}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default RatingSummary;
