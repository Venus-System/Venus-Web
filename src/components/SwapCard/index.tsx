import { ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import type { LadoDaTroca, TrocaRecomendada } from "../../types/painel";
import { nivelDaNota } from "../../utils/niveis";
import ScoreBadge from "../ScoreBadge";
import styles from "./styles.module.css";

interface SwapCardProps {
  swap: TrocaRecomendada;
}

interface SwapSideProps {
  side: LadoDaTroca;
  tag: string;
}

function SwapSide({ side, tag }: SwapSideProps) {
  const nivel = nivelDaNota(side.finalScore);

  return (
    <Link to={`/produto/${side.product.slug}`} className={styles.side}>
      <span className={[styles.thumb, styles[nivel]].join(" ")}>
        {side.product.imageUrl ? (
          <img src={side.product.imageUrl} alt="" className={styles.image} />
        ) : (
          <span aria-hidden="true">{side.product.name.charAt(0)}</span>
        )}
      </span>

      <span className={styles.info}>
        <span className={styles.name}>{side.product.name}</span>
        <span className={styles.tag}>{tag}</span>
        <span className={styles.note}>{side.note}</span>
      </span>

      <ScoreBadge score={side.finalScore} level={nivel} />
    </Link>
  );
}

function SwapCard({ swap }: SwapCardProps) {
  return (
    <div className={styles.swap}>
      <SwapSide side={swap.current} tag="Você analisou" />

      <p className={styles.arrow}>
        <ArrowDown className={styles.icon} aria-hidden="true" />
        troque por
      </p>

      <SwapSide side={swap.suggested} tag="Recomendado" />
    </div>
  );
}

export default SwapCard;
