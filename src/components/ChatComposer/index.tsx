import { useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";
import { TAMANHO_MAXIMO_DA_MENSAGEM } from "../../utils/chat";
import styles from "./styles.module.css";

interface ChatComposerProps {
  id: string;
  blocked: boolean;
  onSend: (texto: string) => void;
}

function ChatComposer({ id, blocked, onSend }: ChatComposerProps) {
  const [texto, setTexto] = useState("");
  const dicaId = `${id}-dica`;
  const semTexto = texto.trim() === "";
  const noLimite = texto.length >= TAMANHO_MAXIMO_DA_MENSAGEM;

  function enviar() {
    if (blocked || semTexto) {
      return;
    }

    onSend(texto);
    setTexto("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    enviar();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      enviar();
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.caixa}>
        <label htmlFor={id} className="texto-oculto">
          Mensagem para a Veninha
        </label>

        <textarea
          id={id}
          className={styles.campo}
          rows={3}
          maxLength={TAMANHO_MAXIMO_DA_MENSAGEM}
          placeholder="Faça uma pergunta..."
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-describedby={dicaId}
        />

        <button
          type="submit"
          className={styles.enviar}
          aria-label="Enviar mensagem"
          aria-disabled={blocked || semTexto}
        >
          <ArrowUp className={styles.enviarIcone} aria-hidden="true" />
        </button>
      </div>

      <p id={dicaId} className="texto-oculto">
        Enter envia a mensagem. Shift com Enter quebra a linha.
      </p>

      {noLimite ? (
        <p className={styles.limite} role="status">
          A mensagem chegou ao limite de{" "}
          {TAMANHO_MAXIMO_DA_MENSAGEM.toLocaleString("pt-BR")} caracteres.
        </p>
      ) : null}
    </form>
  );
}

export default ChatComposer;
