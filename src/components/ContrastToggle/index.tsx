import { Contrast } from "lucide-react";
import { useAltoContraste } from "../../hooks/useAltoContraste";
import styles from "./styles.module.css";

interface ContrastToggleProps {
  className?: string;
}

function ContrastToggle({ className }: ContrastToggleProps) {
  const { ativo, alternar } = useAltoContraste();

  return (
    <button
      type="button"
      className={[styles.botao, className].filter(Boolean).join(" ")}
      onClick={alternar}
      aria-pressed={ativo}
      aria-label="Alto contraste"
      title="Alto contraste"
    >
      <Contrast className={styles.icone} aria-hidden="true" />
    </button>
  );
}

export default ContrastToggle;
