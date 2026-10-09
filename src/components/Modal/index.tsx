import { useEffect, useId, useRef } from "react";
import type { MouseEvent, ReactNode } from "react";
import { X } from "lucide-react";
import styles from "./styles.module.css";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: "normal" | "wide";
}

function Modal({
  open,
  title,
  onClose,
  children,
  size = "normal",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const tituloId = useId();

  useEffect(() => {
    const dialogo = dialogRef.current;

    if (dialogo === null) {
      return;
    }

    if (open && !dialogo.open) {
      dialogo.showModal();
    }

    if (!open && dialogo.open) {
      dialogo.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const anterior = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = anterior;
    };
  }, [open]);

  function handleClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={
        size === "wide" ? `${styles.dialog} ${styles.wide}` : styles.dialog
      }
      aria-labelledby={tituloId}
      onClose={onClose}
      onClick={handleClick}
    >
      <div className={styles.conteudo}>
        <div className={styles.cabecalho}>
          <h2 id={tituloId} className={styles.titulo}>
            {title}
          </h2>

          <button
            type="button"
            className={styles.fechar}
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className={styles.fecharIcone} aria-hidden="true" />
          </button>
        </div>

        {open ? children : null}
      </div>
    </dialog>
  );
}

export default Modal;
