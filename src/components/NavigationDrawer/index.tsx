import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import { X } from "lucide-react";
import Sidebar from "../Sidebar";
import { useTravaDeRolagem } from "../../hooks/useTravaDeRolagem";
import styles from "./styles.module.css";

interface NavigationDrawerProps {
  id: string;
  open: boolean;
  onClose: () => void;
}

function NavigationDrawer({ id, open, onClose }: NavigationDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);

  useTravaDeRolagem(open);

  useEffect(() => {
    const dialogo = dialogRef.current;

    if (dialogo === null) {
      return;
    }

    if (open && !dialogo.open) {
      dialogo.showModal();
      fecharRef.current?.focus();
    }

    if (!open && dialogo.open) {
      dialogo.close();
    }
  }, [open]);

  function handleClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      id={id}
      className={styles.gaveta}
      aria-label="Menu"
      onClose={onClose}
      onClick={handleClick}
    >
      <Sidebar
        headerAction={
          <button
            ref={fecharRef}
            type="button"
            className={styles.fechar}
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className={styles.icone} aria-hidden="true" />
          </button>
        }
      />
    </dialog>
  );
}

export default NavigationDrawer;
