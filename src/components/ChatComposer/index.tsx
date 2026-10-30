import { useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { ArrowUp, Mic } from "lucide-react";
import { useDitado } from "../../hooks/useDitado";
import type { EstadoDoDitado } from "../../hooks/useDitado";
import { TAMANHO_MAXIMO_DA_MENSAGEM } from "../../utils/chat";
import styles from "./styles.module.css";

interface ChatComposerProps {
  id: string;
  blocked: boolean;
  onSend: (texto: string) => void;
}

function avisoDoDitado(estado: EstadoDoDitado): string {
  if (estado.status === "ouvindo") {
    return "Ouvindo… Fale a sua pergunta. Aperte o microfone de novo para parar.";
  }

  return estado.status === "parado" ? estado.anuncio : "";
}

function ChatComposer({ id, blocked, onSend }: ChatComposerProps) {
  const [texto, setTexto] = useState("");
  const campoRef = useRef<HTMLTextAreaElement>(null);
  const { disponivel, estado: ditado, alternar } = useDitado((fala) => {
    setTexto((atual) =>
      (atual.trim() === "" ? fala : `${atual.trimEnd()} ${fala}`).slice(
        0,
        TAMANHO_MAXIMO_DA_MENSAGEM,
      ),
    );
    campoRef.current?.focus();
  });
  const ouvindo = ditado.status === "ouvindo";
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
          ref={campoRef}
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

        {disponivel ? (
          <button
            type="button"
            className={
              ouvindo
                ? `${styles.microfone} ${styles.ouvindo}`
                : styles.microfone
            }
            onClick={alternar}
            aria-pressed={ouvindo}
            aria-label="Ditar a pergunta"
          >
            <Mic className={styles.enviarIcone} aria-hidden="true" />
          </button>
        ) : null}

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

      <p
        className={ouvindo ? styles.ouvindoTexto : "texto-oculto"}
        role="status"
      >
        {avisoDoDitado(ditado)}
      </p>

      {ditado.status === "erro" ? (
        <p className={styles.erroDoDitado} role="alert">
          {ditado.mensagem}
        </p>
      ) : null}

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
