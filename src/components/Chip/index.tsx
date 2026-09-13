import { X } from "lucide-react";
import type { RiskLevel } from "../../types/ingrediente";
import styles from "./styles.module.css";

interface ChipProps {
  label: string;
  level?: RiskLevel;
  onRemove?: () => void;
}

function Chip({ 
  label, 
  level, 
  onRemove 
}: ChipProps) {
  const classes = [styles.chip, level ? styles[level] : styles.neutral].join(" ");

  return (
    <span className={classes}>
      {label}

      {onRemove ? (
        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          aria-label={`remover ${label}`}
        >
          <X className={styles.removeIcon} aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
}

export default Chip;
