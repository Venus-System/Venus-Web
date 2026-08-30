import { Link } from "react-router-dom";
import type { Produto } from "../../types/produto";
import ScoreBadge from "../ScoreBadge";
import styles from "./styles.module.css";

interface ProductRowProps {
  produto: Produto;
  realizadaEm: string;
}

const FORMATO_DATA = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function ProductRow({ produto, realizadaEm }: ProductRowProps) {
  const thumbClasses = [styles.thumb, styles[produto.level]].join(" ");
  const data = new Date(realizadaEm);
  const dataValida = !Number.isNaN(data.getTime());

  return (
    <Link to={`/produto/${produto.slug}`} className={styles.row}>
      <span className={thumbClasses}>
        {produto.imageUrl ? (
          <img src={produto.imageUrl} alt="" className={styles.image} />
        ) : (
          <span aria-hidden="true">{produto.name.charAt(0)}</span>
        )}
      </span>

      <span className={styles.info}>
        <span className={styles.name}>{produto.name}</span>

        {dataValida ? (
          <time dateTime={realizadaEm} className={styles.detail}>
            {FORMATO_DATA.format(data)}
          </time>
        ) : (
          <span className={styles.detail}>Data não informada</span>
        )}
      </span>

      <ScoreBadge score={produto.scores.overallScore} level={produto.level} />
    </Link>
  );
}

export default ProductRow;
