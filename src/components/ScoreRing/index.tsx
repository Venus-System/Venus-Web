import type { RiskLevel } from "../../types/ingrediente";
import styles from "./styles.module.css";

interface ScoreRingProps {
  score: number | null;
  level: RiskLevel;
  label: string;
}

const RAIO = 52;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

function ScoreRing({ score, level, label }: ScoreRingProps) {
  const descricao =
    score === null ? `${label}: sem dado` : `${label}: ${score} de 100`;

  return (
    <div className={styles.ring} role="img" aria-label={descricao}>
      <svg className={styles.svg} viewBox="0 0 120 120" aria-hidden="true">
        <circle className={styles.track} cx="60" cy="60" r={RAIO} />

        {score === null ? null : (
          <circle
            className={[styles.fill, styles[level]].join(" ")}
            cx="60"
            cy="60"
            r={RAIO}
            strokeDasharray={CIRCUNFERENCIA}
            strokeDashoffset={CIRCUNFERENCIA * (1 - score / 100)}
            transform="rotate(-90 60 60)"
          />
        )}
      </svg>

      <span className={styles.value} aria-hidden="true">
        {score === null ? "—" : score}
      </span>
    </div>
  );
}

export default ScoreRing;
