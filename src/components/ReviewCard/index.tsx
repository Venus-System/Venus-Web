import { useId } from "react";
import { useVotoDaAvaliacao } from "../../hooks/useVotoDaAvaliacao";
import type { Avaliacao, VotoDeAvaliacao } from "../../types/avaliacao";
import { dataDaAvaliacao } from "../../utils/dataDaAvaliacao";
import StarRating from "../StarRating";
import styles from "./styles.module.css";

interface ReviewCardProps {
  review: Avaliacao;
  canInteract: boolean;
  onRequireLogin: () => void;
  onReport: (review: Avaliacao) => void;
}

function nomeDoAutor(review: Avaliacao): string {
  if (review.isMine) {
    return "Você";
  }

  return review.authorName ?? "Usuário Venus";
}

function ReviewCard({
  review,
  canInteract,
  onRequireLogin,
  onReport,
}: ReviewCardProps) {
  const perguntaId = useId();
  const { estado, escolher } = useVotoDaAvaliacao(
    review,
    canInteract && !review.isMine,
  );
  const nome = nomeDoAutor(review);
  const data = dataDaAvaliacao(review.createdAt);
  const ocupado = estado.carregando || estado.enviando;

  function votar(escolha: VotoDeAvaliacao) {
    if (!canInteract) {
      onRequireLogin();
      return;
    }

    escolher(escolha);
  }

  function denunciar() {
    if (!canInteract) {
      onRequireLogin();
      return;
    }

    onReport(review);
  }

  return (
    <article className={styles.card}>
      <div className={styles.topo}>
        <span className={styles.avatar} aria-hidden="true" />
        <span className={styles.autor}>{nome}</span>
        {review.verifiedUse ? (
          <span className={styles.verificado}>Uso verificado</span>
        ) : null}
        {data === null ? null : (
          <time dateTime={review.createdAt} className={styles.data}>
            {data}
          </time>
        )}
      </div>

      <div className={styles.linhaDoTitulo}>
        <StarRating rating={review.rating} />
        <h3 className={styles.titulo}>{review.title}</h3>
      </div>

      <p className={styles.comentario}>{review.comment}</p>

      {review.isMine ? (
        <p className={styles.sua}>Esta é a sua avaliação.</p>
      ) : (
        <div className={styles.rodape}>
          <span id={perguntaId} className={styles.pergunta}>
            Esta avaliação foi útil?
          </span>

          <div
            role="group"
            aria-labelledby={perguntaId}
            className={styles.votos}
          >
            <button
              type="button"
              className={styles.voto}
              aria-pressed={estado.meuVoto === "useful"}
              aria-disabled={ocupado}
              onClick={() => votar("useful")}
            >
              Sim ({estado.contagem})
            </button>
            <button
              type="button"
              className={styles.voto}
              aria-pressed={estado.meuVoto === "not_useful"}
              aria-disabled={ocupado}
              onClick={() => votar("not_useful")}
            >
              Não
            </button>
          </div>

          <button type="button" className={styles.denunciar} onClick={denunciar}>
            Denunciar
            <span className="texto-oculto"> a avaliação de {nome}</span>
          </button>
        </div>
      )}

      {estado.erro === null ? null : (
        <p role="alert" className={styles.erro}>
          {estado.erro}
        </p>
      )}
    </article>
  );
}

export default ReviewCard;
