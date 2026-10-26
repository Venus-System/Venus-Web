import styles from "./styles.module.css";

interface PageLoaderProps {
  message?: string;
}

function PageLoader({ message = "Carregando a página..." }: PageLoaderProps) {
  return (
    <div className={styles.carregando} role="status" aria-live="polite">
      <span className={styles.ponto} aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

export default PageLoader;
