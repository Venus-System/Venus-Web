import { Link } from "react-router-dom";
import Button from "../../components/Button";
import FavoriteButton from "../../components/FavoriteButton";
import MainLayout from "../../components/MainLayout";
import MySpaceNav from "../../components/MySpaceNav";
import ProductRow from "../../components/ProductRow";
import { useFavoritos } from "../../hooks/useFavoritos";
import type { EstadoFavoritos } from "../../hooks/useFavoritos";
import { useTituloDaPagina } from "../../hooks/useTituloDaPagina";
import styles from "./styles.module.css";

function avisoDoFavorito(estado: EstadoFavoritos): string {
  if (estado.status !== "pronto" || estado.ultimaAcao === null) {
    return "";
  }

  const { nome, favoritado } = estado.ultimaAcao;

  return favoritado
    ? `${nome} voltou para os seus favoritos.`
    : `Você tirou ${nome} dos favoritos. O produto continua nesta lista até você sair da página, e o coração coloca de volta.`;
}

function Favoritos() {
  useTituloDaPagina("Favoritos");
  const { estado, recarregar, alternar } = useFavoritos();

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

        <p className={styles.aviso} aria-live="polite">
          {avisoDoFavorito(estado)}
        </p>

        {estado.status === "pronto" && estado.erroAoAlternar !== null ? (
          <p role="alert" className={styles.erroAoAlternar}>
            {estado.erroAoAlternar}
          </p>
        ) : null}

        {estado.status === "pronto" && estado.produtos.length === 0 ? (
          <p className={styles.vazio}>
            Você ainda não favoritou nenhum produto. Marque o coração de uma
            análise no seu <Link to="/historico">histórico</Link> para guardar
            aqui.
          </p>
        ) : null}

        {estado.status === "pronto" && estado.produtos.length > 0 ? (
          <ul className={styles.lista} aria-label="Produtos favoritos">
            {estado.produtos.map((produto) => (
              <li key={produto.slug}>
                <ProductRow
                  produto={{
                    slug: produto.slug,
                    name: produto.name,
                    brandName: produto.brand.name,
                    imageUrl: produto.imageUrl,
                  }}
                  nota={produto.scores.overallScore}
                  nivel={produto.level}
                  category={produto.category}
                  action={
                    <FavoriteButton
                      productName={produto.name}
                      isFavorite={estado.slugs.includes(produto.slug)}
                      isPending={estado.pendentes.includes(produto.slug)}
                      onToggle={() => alternar(produto)}
                    />
                  }
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default Favoritos;
