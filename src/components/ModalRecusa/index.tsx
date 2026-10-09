import { useRef, useState } from "react";
import type { FormEvent } from "react";
import Button from "../Button";
import GrupoRadio from "../GrupoRadio";
import type { RadioOption } from "../GrupoRadio";
import Modal from "../Modal";
import type {
  CandidatoResumo,
  MotivoRecusa,
  RecusaCandidato,
} from "../../types/admin";
import { MOTIVOS_DE_RECUSA, ROTULO_DO_MOTIVO } from "../../utils/motivosRecusa";
import { nomeCurto } from "../../utils/nomeCurto";
import { tempoRelativo } from "../../utils/tempoRelativo";
import {
  MAXIMO_DO_COMENTARIO,
  MINIMO_DO_COMENTARIO,
  validarComentarioDaRecusa,
  validarMotivoDaRecusa,
} from "../../utils/validacao";
import styles from "./styles.module.css";

interface ModalRecusaProps {
  open: boolean;
  candidato: CandidatoResumo;
  rotuloDaOrigem: string;
  enviando: boolean;
  mensagemDeErro: string;
  onConfirmar: (recusa: RecusaCandidato) => void;
  onClose: () => void;
}

type FormularioRecusaProps = Omit<ModalRecusaProps, "open">;

interface CamposRecusa {
  motivo: MotivoRecusa | "";
  comentario: string;
  erros: {
    motivo: string | null;
    comentario: string | null;
  };
}

const OPCOES_MOTIVO: RadioOption<MotivoRecusa>[] = MOTIVOS_DE_RECUSA.map(
  (motivo) => ({ value: motivo, label: ROTULO_DO_MOTIVO[motivo] }),
);

const ID_MOTIVO = "motivo-recusa";
const ID_COMENTARIO = "comentario-recusa";
const ID_AVISO = "comentario-recusa-aviso";
const ID_ERRO = "comentario-recusa-erro";

const SEM_ERROS = { motivo: null, comentario: null };

function FormularioRecusa({
  candidato,
  rotuloDaOrigem,
  enviando,
  mensagemDeErro,
  onConfirmar,
  onClose,
}: FormularioRecusaProps) {
  const [campos, setCampos] = useState<CamposRecusa>({
    motivo: "",
    comentario: "",
    erros: SEM_ERROS,
  });
  const comentarioRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const erros = {
      motivo: validarMotivoDaRecusa(campos.motivo),
      comentario: validarComentarioDaRecusa(campos.comentario),
    };

    setCampos((atual) => ({ ...atual, erros }));

    if (erros.motivo !== null) {
      document.getElementById(ID_MOTIVO)?.focus();
      return;
    }

    if (erros.comentario !== null) {
      comentarioRef.current?.focus();
      return;
    }

    if (campos.motivo !== "") {
      onConfirmar({ reason: campos.motivo, comment: campos.comentario.trim() });
    }
  }

  const descricao =
    campos.erros.comentario === null ? ID_AVISO : `${ID_AVISO} ${ID_ERRO}`;

  return (
    <form className={styles.formulario} noValidate onSubmit={handleSubmit}>
      <div className={styles.produto}>
        <p className={styles.produtoNome}>
          {candidato.name}
          <span aria-hidden="true"> · </span>
          {candidato.brand}
        </p>

        <p className={styles.produtoMeta}>
          {rotuloDaOrigem}
          <span aria-hidden="true"> · </span>
          enviado por {nomeCurto(candidato.submittedBy)}{" "}
          <time dateTime={candidato.submittedAt}>
            {tempoRelativo(candidato.submittedAt)}
          </time>
        </p>
      </div>

      <div className={styles.motivos}>
        <GrupoRadio
          id={ID_MOTIVO}
          legend="Por que está recusando?"
          options={OPCOES_MOTIVO}
          value={campos.motivo}
          onChange={(motivo) =>
            setCampos((atual) => ({
              ...atual,
              motivo,
              erros: { ...atual.erros, motivo: null },
            }))
          }
          vertical
          error={campos.erros.motivo ?? undefined}
        />
      </div>

      <div className={styles.campoComentario}>
        <label className={styles.rotulo} htmlFor={ID_COMENTARIO}>
          Comentário para quem enviou
          <span className={styles.obrigatorio} aria-hidden="true">
            {" "}
            *
          </span>
        </label>

        <textarea
          ref={comentarioRef}
          id={ID_COMENTARIO}
          className={
            campos.erros.comentario === null
              ? styles.campo
              : styles.campoInvalido
          }
          rows={4}
          value={campos.comentario}
          onChange={(evento) =>
            setCampos((atual) => ({
              ...atual,
              comentario: evento.target.value,
              erros: { ...atual.erros, comentario: null },
            }))
          }
          aria-invalid={campos.erros.comentario === null ? undefined : true}
          aria-describedby={descricao}
          maxLength={MAXIMO_DO_COMENTARIO}
          required
        />

        {campos.erros.comentario === null ? null : (
          <p id={ID_ERRO} className={styles.erro} role="alert">
            {campos.erros.comentario}
          </p>
        )}

        <p id={ID_AVISO} className={styles.aviso}>
          Entre {MINIMO_DO_COMENTARIO} e {MAXIMO_DO_COMENTARIO} caracteres. O
          motivo e o comentário
          são enviados a {nomeCurto(candidato.submittedBy)}, e o produto sai da fila de
          pendentes.
        </p>
      </div>

      {mensagemDeErro === "" ? null : (
        <p className={styles.erro} role="alert">
          {mensagemDeErro}
        </p>
      )}

      <div className={styles.acoes}>
        <Button type="submit" disabled={enviando}>
          {enviando ? "Recusando..." : "Recusar"}
        </Button>

        <Button variant="soft" onClick={onClose} disabled={enviando}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function ModalRecusa({ open, ...formulario }: ModalRecusaProps) {
  return (
    <Modal open={open} title="Recusar produto" onClose={formulario.onClose}>
      <FormularioRecusa {...formulario} />
    </Modal>
  );
}

export default ModalRecusa;
