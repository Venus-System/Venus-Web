import { Link } from "react-router-dom";
import Button from "../../components/Button";
import MainLayout from "../../components/MainLayout";
import MySpaceNav from "../../components/MySpaceNav";
import ProductCard from "../../components/ProductCard";
import { useFavoritos } from "../../hooks/useFavoritos";
import styles from "./styles.module.css";

function Favoritos() {
  const { estado, recarregar } = useFavoritos();

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Sua prateleira de{" "}
            <span className={styles.destaque}>favoritos.</span>
          </h1>
          <p className={styles.subtitle}>
            Os produtos que você marcou para não perder de vista.
          </p>
        </header>

        <MySpaceNav />

        <p className="texto-oculto" aria-live="polite">
          {estado.status === "carregando" ? "Carregando os seus favoritos." : ""}
        </p>

        {estado.status === "carregando" ? (
          <p className={styles.estado}>Carregando os seus favoritos...</p>
        ) : null}

        {estado.status === "erro" ? (
          <div className={styles.erro}>
            <p role="alert">{estado.mensagem}</p>

            <Button variant="secondary" onClick={recarregar}>
              Tentar de novo
            </Button>
          </div>
        ) : null}

        {estado.status === "pronto" && estado.produtos.length === 0 ? (
          <p className={styles.vazio}>
            Você ainda não favoritou nenhum produto. Marque o coração de uma
            análise no seu <Link to="/historico">histórico</Link> para guardar
            aqui.
          </p>
        ) : null}

        {estado.status === "pronto" && estado.produtos.length > 0 ? (
          <ul className={styles.grade} aria-label="Produtos favoritos">
            {estado.produtos.map((produto) => (
              <li key={produto.slug}>
                <ProductCard produto={produto} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default Favoritos;
