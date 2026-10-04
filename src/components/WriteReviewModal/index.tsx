import { useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Estrelas, NovaAvaliacao } from "../../types/avaliacao";
import type { ProdutoDoPainel } from "../../types/painel";
import { tomDoProduto } from "../../utils/tomDoProduto";
import {
  MAXIMO_DO_COMENTARIO_DA_AVALIACAO,
  validarComentarioDaAvaliacao,
  validarNotaDaAvaliacao,
  validarTituloDaAvaliacao,
} from "../../utils/validacao";
import Button from "../Button";
import Input from "../Input";
import Modal from "../Modal";
import StarInput from "../StarInput";
import styles from "./styles.module.css";

interface WriteReviewModalProps {
  open: boolean;
  product: ProdutoDoPainel;
  sending: boolean;
  errorMessage: string | null;
  onSubmit: (nova: NovaAvaliacao) => void;
  onClose: () => void;
}

type FormularioProps = Omit<WriteReviewModalProps, "open">;

interface CamposAvaliacao {
  nota: Estrelas | null;
  titulo: string;
  comentario: string;
  usou: boolean;
  erros: {
    nota: string | null;
    titulo: string | null;
    comentario: string | null;
  };
}

const ID_NOTA = "avaliacao-nota";
const ID_TITULO = "avaliacao-titulo";
const ID_COMENTARIO = "avaliacao-comentario";
const ID_CONTADOR = "avaliacao-comentario-contador";
const ID_ERRO_COMENTARIO = "avaliacao-comentario-erro";
const ID_USO = "avaliacao-uso";
const ID_DICA_USO = "avaliacao-uso-dica";

const SEM_ERROS = { nota: null, titulo: null, comentario: null };

function FormularioAvaliacao({
  product,
  sending,
  errorMessage,
  onSubmit,
  onClose,
}: FormularioProps) {
  const [campos, setCampos] = useState<CamposAvaliacao>({
    nota: null,
    titulo: "",
    comentario: "",
    usou: false,
    erros: SEM_ERROS,
  });
  const tituloRef = useRef<HTMLInputElement>(null);
  const comentarioRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (sending) {
      return;
    }

    const erros = {
      nota: validarNotaDaAvaliacao(campos.nota),
      titulo: validarTituloDaAvaliacao(campos.titulo),
      comentario: validarComentarioDaAvaliacao(campos.comentario),
    };

    setCampos((atual) => ({ ...atual, erros }));

    if (erros.nota !== null || campos.nota === null) {
      document.getElementById(`${ID_NOTA}-1`)?.focus();
      return;
    }

    if (erros.titulo !== null) {
      tituloRef.current?.focus();
      return;
    }

    if (erros.comentario !== null) {
      comentarioRef.current?.focus();
      return;
    }

    onSubmit({
      rating: campos.nota,
      title: campos.titulo.trim(),
      comment: campos.comentario.trim(),
      verifiedUse: campos.usou,
    });
  }

  const descricaoDoComentario =
    campos.erros.comentario === null
      ? ID_CONTADOR
      : `${ID_CONTADOR} ${ID_ERRO_COMENTARIO}`;

  return (
    <form className={styles.formulario} noValidate onSubmit={handleSubmit}>
      <div className={styles.produto}>
        <span
          className={`${styles.foto} ${styles[tomDoProduto(product.slug)]}`}
        >
          {product.imageUrl ? (
            <img src={product.imageUrl} alt="" className={styles.imagem} />
          ) : (
            <span aria-hidden="true">{product.name.charAt(0)}</span>
          )}
        </span>

        <span className={styles.produtoTexto}>
          <span className={styles.produtoNome}>{product.name}</span>
          <span className={styles.produtoMarca}>{product.brandName}</span>
        </span>
      </div>

      <StarInput
        id={ID_NOTA}
        legend="Sua nota"
        value={campos.nota}
        onChange={(nota) =>
          setCampos((atual) => ({
            ...atual,
            nota,
            erros: { ...atual.erros, nota: null },
          }))
        }
        hint="Escolha de 1 a 5 estrelas"
        error={campos.erros.nota ?? undefined}
      />

      <Input
        ref={tituloRef}
        id={ID_TITULO}
        label="Título"
        placeholder="Resuma sua experiência em uma frase"
        value={campos.titulo}
        onChange={(evento) =>
          setCampos((atual) => ({
            ...atual,
            titulo: evento.target.value,
            erros: { ...atual.erros, titulo: null },
          }))
        }
        error={campos.erros.titulo ?? undefined}
        required
      />

      <div className={styles.campoComentario}>
        <label className={styles.rotulo} htmlFor={ID_COMENTARIO}>
          Comentário
        </label>

        <textarea
          ref={comentarioRef}
          id={ID_COMENTARIO}
          className={
            campos.erros.comentario === null
              ? styles.campo
              : styles.campoInvalido
          }
          rows={5}
          placeholder="Conte o que funcionou, o que não funcionou e por quanto tempo você usou o produto."
          value={campos.comentario}
          onChange={(evento) =>
            setCampos((atual) => ({
              ...atual,
              comentario: evento.target.value,
              erros: { ...atual.erros, comentario: null },
            }))
          }
          aria-invalid={campos.erros.comentario === null ? undefined : true}
          aria-describedby={descricaoDoComentario}
          maxLength={MAXIMO_DO_COMENTARIO_DA_AVALIACAO}
          required
        />

        <p id={ID_CONTADOR} className={styles.contador}>
          {campos.comentario.length}/{MAXIMO_DO_COMENTARIO_DA_AVALIACAO}
          <span className="texto-oculto"> caracteres</span>
        </p>

        {campos.erros.comentario === null ? null : (
          <p id={ID_ERRO_COMENTARIO} className={styles.erro} role="alert">
            {campos.erros.comentario}
          </p>
        )}
      </div>

      <div className={styles.uso}>
        <label className={styles.caixaRotulo} htmlFor={ID_USO}>
          <input
            id={ID_USO}
            type="checkbox"
            className={styles.caixa}
            checked={campos.usou}
            onChange={(evento) =>
              setCampos((atual) => ({ ...atual, usou: evento.target.checked }))
            }
            aria-describedby={ID_DICA_USO}
          />
          Já usei este produto
        </label>

        <p id={ID_DICA_USO} className={styles.dica}>
          Avaliações com uso confirmado recebem o selo Uso verificado.
        </p>
      </div>

      {errorMessage === null ? null : (
        <p className={styles.erro} role="alert">
          {errorMessage}
        </p>
      )}

      <div className={styles.acoes}>
        <Button type="submit" aria-disabled={sending}>
          {sending ? "Publicando..." : "Publicar avaliação"}
        </Button>

        <Button variant="soft" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function WriteReviewModal({ open, ...formulario }: WriteReviewModalProps) {
  return (
    <Modal open={open} title="Escrever avaliação" onClose={formulario.onClose}>
      <FormularioAvaliacao {...formulario} />
    </Modal>
  );
}

export default WriteReviewModal;
