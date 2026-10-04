import { useEffect, useState } from "react";
import type { Avaliacao, AvaliacoesDoProduto } from "../../types/avaliacao";
import Button from "../Button";
import Modal from "../Modal";
import RatingSummary from "../RatingSummary";
import ReviewCard from "../ReviewCard";
import styles from "./styles.module.css";

interface ReviewsModalProps {
  open: boolean;
  onClose: () => void;
  data: AvaliacoesDoProduto;
  canInteract: boolean;
  onRequireLogin: () => void;
  onReport: (review: Avaliacao) => void;
  onWrite: () => void;
}

const POR_VEZ = 10;

function ReviewsModal({
  open,
  onClose,
  data,
  canInteract,
  onRequireLogin,
  onReport,
  onWrite,
}: ReviewsModalProps) {
  const [visiveis, setVisiveis] = useState(POR_VEZ);

  useEffect(() => {
    if (open) {
      setVisiveis(POR_VEZ);
    }
  }, [open]);

  const restantes = data.reviews.length - visiveis;

  return (
    <Modal
      open={open}
      title="Avaliações de usuários"
      onClose={onClose}
      size="wide"
    >
      <div className={styles.corpo}>
        <div className={styles.lateral}>
          <RatingSummary summary={data.summary} />
          <Button onClick={onWrite}>Escrever avaliação</Button>
        </div>

        <div className={styles.lista}>
          <ul className={styles.avaliacoes}>
            {data.reviews.slice(0, visiveis).map((avaliacao) => (
              <li key={avaliacao.id}>
                <ReviewCard
                  review={avaliacao}
                  canInteract={canInteract}
                  onRequireLogin={onRequireLogin}
                  onReport={onReport}
                />
              </li>
            ))}
          </ul>

          {restantes > 0 ? (
            <Button
              variant="secondary"
              onClick={() => setVisiveis((atual) => atual + POR_VEZ)}
            >
              Mostrar mais avaliações
            </Button>
          ) : null}

          <p className="texto-oculto" aria-live="polite">
            {visiveis > POR_VEZ
              ? `${Math.min(visiveis, data.reviews.length)} de ${data.reviews.length} avaliações na lista.`
              : ""}
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default ReviewsModal;
