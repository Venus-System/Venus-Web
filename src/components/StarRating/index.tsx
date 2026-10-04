import { Star } from "lucide-react";
import styles from "./styles.module.css";

interface StarRatingProps {
  rating: number;
  size?: "small" | "medium";
}

const POSICOES = [1, 2, 3, 4, 5];

const FORMATO_NOTA = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

function preenchimento(posicao: number, nota: number): number {
  return Math.min(Math.max(nota - (posicao - 1), 0), 1) * 100;
}

function StarRating({ rating, size = "small" }: StarRatingProps) {
  return (
    <span
      className={`${styles.estrelas} ${styles[size]}`}
      role="img"
      aria-label={`Nota ${FORMATO_NOTA.format(rating)} de 5`}
    >
      {POSICOES.map((posicao) => (
        <span key={posicao} className={styles.estrela} aria-hidden="true">
          <Star className={styles.vazia} />
          <span
            className={styles.cheia}
            style={{ width: `${preenchimento(posicao, rating)}%` }}
          >
            <Star className={styles.icone} />
          </span>
        </span>
      ))}
    </span>
  );
}

export default StarRating;
