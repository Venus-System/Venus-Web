import type { ReactNode } from "react";
import styles from "./styles.module.css";

interface QuestionCardProps {
  number: number;
  total: number;
  children: ReactNode;
}

function QuestionCard({ number, total, children }: QuestionCardProps) {
  const contador = `${String(number).padStart(2, "0")}/${String(total).padStart(2, "0")}`;

  return (
    <div className={styles.card}>
      <p className={styles.number}>
        <span aria-hidden="true">{contador}</span>
        <span className="texto-oculto">
          Pergunta {number} de {total}
        </span>
      </p>

      {children}
    </div>
  );
}

export default QuestionCard;
