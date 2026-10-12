import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button";
import FavoriteButton from "../../components/FavoriteButton";
import MainLayout from "../../components/MainLayout";
import MySpaceNav from "../../components/MySpaceNav";
import ProductCard from "../../components/ProductCard";
import { useFavoritos } from "../../hooks/useFavoritos";
import styles from "./styles.module.css";

function Favoritos() {
  const { estado, recarregar, alternar } = useFavoritos();
  const avisoRef = useRef<HTMLParagraphElement>(null);

  const ultimaAcao = estado.status === "pronto" ? estado.ultimaAcao : null;

  useEffect(() => {
    if (ultimaAcao !== null) {
      avisoRef.current?.focus();
    }
  }, [ultimaAcao]);

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

        {ultimaAcao === null ? null : (
          <p ref={avisoRef} tabIndex={-1} className={styles.aviso}>
            Você tirou {ultimaAcao.nome} dos favoritos.
          </p>
        )}

        {estado.status === "pronto" && estado.erroAoAlternar !== null ? (
          <p role="alert" className={styles.erroAoAlternar}>
            {estado.erroAoAlternar}
          </p>
        ) : null}

        {estado.status === "pronto" && estado.produtos.length === 0 ? (
          <p className={styles.vazio}>
            {ultimaAcao === null
              ? "Você ainda não favoritou nenhum produto."
              : "Sua prateleira ficou vazia."}{" "}
            Marque o coração de uma análise no seu{" "}
            <Link to="/historico">histórico</Link> para guardar aqui.
          </p>
        ) : null}

        {estado.status === "pronto" && estado.produtos.length > 0 ? (
          <ul className={styles.grade} aria-label="Produtos favoritos">
            {estado.produtos.map((produto) => (
              <li key={produto.slug}>
                <ProductCard
                  produto={produto}
                  action={
                    <FavoriteButton
                      productName={produto.name}
                      isFavorite
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
