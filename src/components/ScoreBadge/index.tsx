import type { RiskLevel } from "../../types/ingrediente";
import styles from "./styles.module.css";

interface ScoreBadgeProps {
  score: number | null;
  level: RiskLevel;
}

function ScoreBadge({ score, level }: ScoreBadgeProps) {
  const classes = [styles.badge, styles[level]].join(" ");
  const description =
    score === null ? "Sem nota disponível" : `Nota ${score} de 100`;

  return (
    <span className={classes}>
      <span aria-hidden="true">{score === null ? "—" : score}</span>
      <span className={styles.description}>{description}</span>
    </span>
  );
}

export default ScoreBadge;
