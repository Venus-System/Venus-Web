import { useFavoritos } from "../../hooks/useFavoritos";
import type { EstadoFavoritos } from "../../hooks/useFavoritos";
import Button from "../Button";
import FavoriteButton from "../FavoriteButton";
import styles from "./styles.module.css";

interface ProductFavoriteProps {
  slug: string;
  name: string;
}

function anuncio(estado: EstadoFavoritos): string {
  if (estado.status === "carregando") {
    return "Carregando os seus favoritos.";
  }

  if (estado.status !== "pronto" || estado.ultimaAcao === null) {
    return "";
  }

  return estado.ultimaAcao.favoritado
    ? `Você favoritou ${estado.ultimaAcao.nome}.`
    : `Você tirou ${estado.ultimaAcao.nome} dos favoritos.`;
}

function ProductFavorite({ slug, name }: ProductFavoriteProps) {
  const { estado, recarregar, alternar } = useFavoritos();

  if (estado.status === "erro") {
    return (
      <span className={styles.aviso}>
        <span role="alert">Não conseguimos carregar os seus favoritos.</span>

        <Button variant="text" onClick={recarregar}>
          Tentar de novo
        </Button>
      </span>
    );
  }

  const favorito = estado.status === "pronto" && estado.slugs.includes(slug);
  const pendente =
    estado.status !== "pronto" || estado.pendentes.includes(slug);
  const erroAoAlternar =
    estado.status === "pronto" ? estado.erroAoAlternar : null;

  return (
    <span className={styles.favorito}>
      <FavoriteButton
        productName={name}
        isFavorite={favorito}
        isPending={pendente}
        onToggle={() => alternar({ slug, name })}
      />

      <span className="texto-oculto" aria-live="polite">
        {anuncio(estado)}
      </span>

      {erroAoAlternar === null ? null : (
        <span role="alert" className={styles.erro}>
          {erroAoAlternar}
        </span>
      )}
    </span>
  );
}

export default ProductFavorite;
