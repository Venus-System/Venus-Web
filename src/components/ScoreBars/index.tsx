import { useId } from "react";
import { NOTAS_DE_QUALIDADE } from "../../utils/notas";
import type { NotasDeQualidade } from "../../utils/notas";
import styles from "./styles.module.css";

interface ScoreBarsProps {
  notas: NotasDeQualidade;
}

function limitar(valor: number): number {
  return Math.min(100, Math.max(0, valor));
}

function ScoreBars({ notas }: ScoreBarsProps) {
  const baseId = useId();

  return (
    <div className={styles.group}>
      {NOTAS_DE_QUALIDADE.map((nota) => {
        const value = notas[nota.campo];
        const labelId = `${baseId}-${nota.campo}`;
        const trackClasses = [styles.track, value === null ? styles.empty : ""]
          .filter(Boolean)
          .join(" ");

        return (
          <div className={styles.row} key={nota.campo}>
            <span className={styles.label} id={labelId}>
              {nota.rotulo}
            </span>

            <span className={styles.value}>
              {value === null ? "Sem dado" : `${value}%`}
            </span>

            <div className={trackClasses}>
              <div
                className={styles.fill}
                style={{ width: `${value === null ? 0 : limitar(value)}%` }}
                role="progressbar"
                aria-labelledby={labelId}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={value ?? undefined}
                aria-valuetext={value === null ? "sem dado" : undefined}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ScoreBars;
