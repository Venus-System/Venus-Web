import { useId } from "react";
import type { NotasProduto } from "../../types/produto";
import styles from "./styles.module.css";

interface ScoreBarsProps {
  notas: NotasProduto;
}

const DIMENSIONS = [
  { key: "healthScore", label: "Saúde", fill: "health", tone: "toneHealth" },
  {
    key: "environmentalScore",
    label: "Ambiental",
    fill: "environment",
    tone: "toneEnvironment",
  },
  { key: "ethicalScore", label: "Ético", fill: "ethics", tone: "toneEthics" },
] as const;

function ScoreBars({ notas }: ScoreBarsProps) {
  const baseId = useId();

  return (
    <div className={styles.group}>
      {DIMENSIONS.map((dimension) => {
        const value = notas[dimension.key];
        const labelId = `${baseId}-${dimension.key}`;
        const trackClasses = [styles.track, value === null ? styles.empty : ""]
          .filter(Boolean)
          .join(" ");

        return (
          <div className={styles.row} key={dimension.key}>
            <span className={styles.label} id={labelId}>
              {dimension.label}
            </span>

            <span
              className={[
                styles.value,
                value === null ? "" : styles[dimension.tone],
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {value === null ? "—" : `${value}%`}
            </span>

            <div className={trackClasses}>
              <div
                className={[styles.fill, styles[dimension.fill]].join(" ")}
                style={{ width: `${value ?? 0}%` }}
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
