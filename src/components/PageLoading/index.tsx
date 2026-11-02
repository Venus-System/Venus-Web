import styles from "./styles.module.css";

function PageLoading() {
  return (
    <p className={styles.carregando} role="status">
      Carregando a página...
    </p>
  );
}

export default PageLoading;
