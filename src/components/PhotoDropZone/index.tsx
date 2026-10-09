import { useState } from "react";
import type { ChangeEvent, DragEvent, ReactNode } from "react";
import { ArrowRight, Crosshair } from "lucide-react";
import Button from "../Button";
import styles from "./styles.module.css";

interface PhotoDropZoneProps {
  inputId: string;
  step: string;
  title: string;
  description: ReactNode;
  accept: string;
  busy: boolean;
  onFile: (arquivo: File) => void;
  onExample: () => void;
}

function PhotoDropZone({
  inputId,
  step,
  title,
  description,
  accept,
  busy,
  onFile,
  onExample,
}: PhotoDropZoneProps) {
  const [arrastando, setArrastando] = useState(false);
  const dicaId = `${inputId}-dica`;

  function handleEscolher(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];

    evento.target.value = "";

    if (arquivo !== undefined) {
      onFile(arquivo);
    }
  }

  function handleSoltar(evento: DragEvent<HTMLDivElement>) {
    evento.preventDefault();
    setArrastando(false);

    const arquivo = evento.dataTransfer.files[0];

    if (arquivo !== undefined && !busy) {
      onFile(arquivo);
    }
  }

  return (
    <div
      className={arrastando ? `${styles.area} ${styles.arrastando}` : styles.area}
      onDragOver={(evento) => {
        evento.preventDefault();
        setArrastando(true);
      }}
      onDragLeave={() => setArrastando(false)}
      onDrop={handleSoltar}
      aria-busy={busy}
    >
      <label htmlFor={inputId} className={styles.rotulo}>
        <span className={styles.icone} aria-hidden="true">
          <Crosshair />
        </span>

        <span className={styles.etapa}>{step}</span>
        <span className={styles.titulo}>{title}</span>
      </label>

      <p id={dicaId} className={styles.descricao}>
        {description}
      </p>

      <input
        id={inputId}
        type="file"
        className="texto-oculto"
        accept={accept}
        aria-describedby={dicaId}
        disabled={busy}
        onChange={handleEscolher}
      />

      <p className={styles.ou}>Ou</p>

      <Button
        variant="secondary"
        className={styles.exemplo}
        onClick={onExample}
        disabled={busy}
      >
        Usar imagem de exemplo
        <ArrowRight className={styles.seta} aria-hidden="true" />
      </Button>
    </div>
  );
}

export default PhotoDropZone;
