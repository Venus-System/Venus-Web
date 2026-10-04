import { useState } from "react";
import type { FormEvent } from "react";
import type {
  Avaliacao,
  Denuncia,
  MotivoDenuncia,
} from "../../types/avaliacao";
import {
  MOTIVOS_DE_DENUNCIA,
  ROTULO_DO_MOTIVO_DE_DENUNCIA,
} from "../../utils/motivosDenuncia";
import { validarMotivoDaDenuncia } from "../../utils/validacao";
import Button from "../Button";
import GrupoRadio from "../GrupoRadio";
import type { RadioOption } from "../GrupoRadio";
import Modal from "../Modal";
import styles from "./styles.module.css";

interface ReportReviewModalProps {
  open: boolean;
  review: Avaliacao;
  sending: boolean;
  errorMessage: string | null;
  onSubmit: (denuncia: Denuncia) => void;
  onClose: () => void;
}

type FormularioProps = Omit<ReportReviewModalProps, "open">;

interface CamposDenuncia {
  motivo: MotivoDenuncia | "";
  comentario: string;
  erroDoMotivo: string | null;
}

const OPCOES_MOTIVO: RadioOption<MotivoDenuncia>[] = MOTIVOS_DE_DENUNCIA.map(
  (motivo) => ({ value: motivo, label: ROTULO_DO_MOTIVO_DE_DENUNCIA[motivo] }),
);

const ID_MOTIVO = "denuncia-motivo";
const ID_COMENTARIO = "denuncia-comentario";
const ID_AVISO = "denuncia-aviso";

function FormularioDenuncia({
  review,
  sending,
  errorMessage,
  onSubmit,
  onClose,
}: FormularioProps) {
  const [campos, setCampos] = useState<CamposDenuncia>({
    motivo: "",
    comentario: "",
    erroDoMotivo: null,
  });

  function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (sending) {
      return;
    }

    const erroDoMotivo = validarMotivoDaDenuncia(campos.motivo);

    setCampos((atual) => ({ ...atual, erroDoMotivo }));

    if (erroDoMotivo !== null || campos.motivo === "") {
      document.getElementById(ID_MOTIVO)?.focus();
      return;
    }

    onSubmit({ reason: campos.motivo, comment: campos.comentario.trim() });
  }

  return (
    <form className={styles.formulario} noValidate onSubmit={handleSubmit}>
      <blockquote className={styles.trecho}>
        <p className={styles.autor}>{review.authorName ?? "Usuário Venus"}</p>
        <p className={styles.titulo}>{review.title}</p>
        <p className={styles.comentario}>{review.comment}</p>
      </blockquote>

      <GrupoRadio
        id={ID_MOTIVO}
        legend="Por que você está denunciando?"
        options={OPCOES_MOTIVO}
        value={campos.motivo}
        onChange={(motivo) =>
          setCampos((atual) => ({ ...atual, motivo, erroDoMotivo: null }))
        }
        vertical
        error={campos.erroDoMotivo ?? undefined}
      />

      <div className={styles.campoComentario}>
        <label className={styles.rotulo} htmlFor={ID_COMENTARIO}>
          Conte mais (opcional)
        </label>

        <textarea
          id={ID_COMENTARIO}
          className={styles.campo}
          rows={4}
          placeholder="Descreva o problema com suas palavras."
          value={campos.comentario}
          onChange={(evento) =>
            setCampos((atual) => ({
              ...atual,
              comentario: evento.target.value,
            }))
          }
          aria-describedby={ID_AVISO}
        />

        <p id={ID_AVISO} className={styles.aviso}>
          Um moderador analisa a denúncia. A avaliação continua visível até a
          análise terminar.
        </p>
      </div>

      {errorMessage === null ? null : (
        <p className={styles.erro} role="alert">
          {errorMessage}
        </p>
      )}

      <div className={styles.acoes}>
        <Button type="submit" aria-disabled={sending}>
          {sending ? "Enviando..." : "Enviar denúncia"}
        </Button>

        <Button variant="soft" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function ReportReviewModal({ open, ...formulario }: ReportReviewModalProps) {
  return (
    <Modal
      open={open}
      title="Denunciar avaliação"
      onClose={formulario.onClose}
    >
      <FormularioDenuncia {...formulario} />
    </Modal>
  );
}

export default ReportReviewModal;
