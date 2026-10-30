import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

interface BackButtonProps {
  fallback: string;
}

function BackButton({ fallback }: BackButtonProps) {
  const navegar = useNavigate();
  const localizacao = useLocation();

  function handleVoltar() {
    if (localizacao.key === "default") {
      navegar(fallback);
      return;
    }

    navegar(-1);
  }

  return (
    <button type="button" className={styles.voltar} onClick={handleVoltar}>
      <ArrowLeft className={styles.icone} aria-hidden="true" />
      Voltar
    </button>
  );
}

export default BackButton;
