import styles from "./styles.module.css";

interface BigScoreProps {
  score: number | null;
}

function BigScore({ score }: BigScoreProps) {
  return (
    <p className={styles.nota}>
      <span aria-hidden="true">
        <span className={styles.valor}>{score === null ? "—" : score}</span>
        <span className={styles.total}>/100</span>
      </span>
      <span className="texto-oculto">
        {score === null ? "Sem nota disponível" : `Nota ${score} de 100`}
      </span>
    </p>
  );
}

export default BigScore;
