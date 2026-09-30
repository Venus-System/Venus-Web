import { Heart } from "lucide-react";
import styles from "./styles.module.css";

interface FavoriteButtonProps {
  productName: string;
  isFavorite: boolean;
  isPending: boolean;
  onToggle: () => void;
}

function FavoriteButton({
  productName,
  isFavorite,
  isPending,
  onToggle,
}: FavoriteButtonProps) {
  const classes = isFavorite
    ? `${styles.botao} ${styles.favorito}`
    : styles.botao;

  return (
    <button
      type="button"
      className={classes}
      aria-label={`Favoritar ${productName}`}
      aria-pressed={isFavorite}
      aria-disabled={isPending}
      onClick={onToggle}
    >
      <Heart className={styles.icone} aria-hidden="true" />
    </button>
  );
}

export default FavoriteButton;
