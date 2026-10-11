import type { RiskLevel } from "../../types/ingrediente";
import RiskBadge from "../RiskBadge";
import styles from "./styles.module.css";

interface RiskLegendProps {
  label: string;
}

interface ItemDaLegenda {
  level: RiskLevel;
  meaning: string;
}

const ITENS: ItemDaLegenda[] = [
  { level: "safe", meaning: "risco baixo para a pele" },
  { level: "warning", meaning: "pode irritar ou entupir os poros" },
  { level: "avoid", meaning: "risco alto de irritar ou entupir os poros" },
  { level: "no-data", meaning: "está fora da nossa base" },
];

function RiskLegend({ label }: RiskLegendProps) {
  return (
    <ul className={styles.legenda} aria-label={label}>
      {ITENS.map((item) => (
        <li className={styles.item} key={item.level}>
          <RiskBadge level={item.level} />
          <span className={styles.significado}>{item.meaning}</span>
        </li>
      ))}
    </ul>
  );
}

export default RiskLegend;
