import { Link } from "react-router-dom";
import type { Produto } from "../../types/produto";
import ScoreBadge from "../ScoreBadge";
import styles from "./styles.module.css";

interface ProductCardProps {
  produto: Produto;
}

function ProductCard({ produto }: ProductCardProps) {
  const frameClasses = [styles.frame, styles[produto.level]].join(" ");

  return (
    <article className={styles.card}>
      <Link to={`/produto/${produto.slug}`} className={styles.link}>
        <span className={frameClasses}>
          {produto.imageUrl ? (
            <img src={produto.imageUrl} alt="" className={styles.image} />
          ) : (
            <span className={styles.placeholder} aria-hidden="true">
              {produto.name.charAt(0)}
            </span>
          )}
        </span>

        <span className={styles.info}>
          <span className={styles.name}>{produto.name}</span>
          <span className={styles.meta}>
            {produto.brand.name} · {produto.category}
          </span>
        </span>

        <ScoreBadge score={produto.scores.overallScore} level={produto.level} />
      </Link>
    </article>
  );
}

export default ProductCard;
