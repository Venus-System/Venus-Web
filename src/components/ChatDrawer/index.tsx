import { useEffect, useId, useRef } from "react";
import type { MouseEvent } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import Button from "../Button";
import ChatComposer from "../ChatComposer";
import ChatMessage from "../ChatMessage";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import { useChat } from "../../hooks/useChat";
import { useSegundosRestantes } from "../../hooks/useSegundosRestantes";
import { useTravaDeRolagem } from "../../hooks/useTravaDeRolagem";
import type { MensagemDoChat } from "../../types/chat";
import styles from "./styles.module.css";

const ID_DO_CAMPO = "chat-mensagem";

const SAUDACAO: Pick<MensagemDoChat, "author" | "text"> = {
  author: "veninha",
  text: "Oi! Sou a Veninha. Posso explicar os ingredientes e a nota de um produto para você.",
};

function focarCampo() {
  const campo = document.getElementById(ID_DO_CAMPO);

  if (campo !== null) {
    campo.focus();
  }
}

function ChatDrawer() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fimRef = useRef<HTMLDivElement>(null);
  const tituloId = useId();
  const localizacao = useLocation();
  const { usuario, carregando } = useAutenticacao();
  const { aberto, mensagens, envio, fechar, enviar, tentarDeNovo } = useChat();
  const segundos = useSegundosRestantes(
    envio.status === "limite" ? envio.liberaEm : null,
  );
  const semConta = !carregando && usuario === null;

  useTravaDeRolagem(aberto);

  useEffect(() => {
    const dialogo = dialogRef.current;

    if (dialogo === null) {
      return;
    }

    if (aberto && !dialogo.open) {
      dialogo.showModal();
      focarCampo();
    }

    if (!aberto && dialogo.open) {
      dialogo.close();
    }
  }, [aberto]);

  useEffect(() => {
    if (aberto && fimRef.current !== null) {
      fimRef.current.scrollIntoView({ block: "end" });
    }
  }, [aberto, mensagens.length, envio.status]);

  function handleClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) {
      fechar();
    }
  }

  function repetir() {
    tentarDeNovo();
    focarCampo();
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={tituloId}
      onClose={fechar}
      onClick={handleClick}
    >
      <div className={styles.painel}>
        <div className={styles.cabecalho}>
          <h2 id={tituloId} className="texto-oculto">
            Conversa com a Veninha
          </h2>

          <button
            type="button"
            className={styles.fechar}
            onClick={fechar}
            aria-label="Fechar conversa"
          >
            <X className={styles.fecharIcone} aria-hidden="true" />
          </button>
        </div>

        {aberto ? (
          <>
            <div
              className={styles.mensagens}
              role="log"
              aria-label="Mensagens da conversa"
              tabIndex={0}
            >
              <ChatMessage message={SAUDACAO} />

              {mensagens.map((mensagem) => (
                <ChatMessage key={mensagem.id} message={mensagem} />
              ))}

              {envio.status === "esperando" ? (
                <p className={styles.pensando}>A Veninha está pensando...</p>
              ) : null}

              <div ref={fimRef} />
            </div>

            {envio.status === "erro" ? (
              <div className={styles.aviso}>
                <p role="alert">{envio.mensagem}</p>

                <Button variant="text" onClick={repetir}>
                  Tentar de novo
                </Button>
              </div>
            ) : null}

            {envio.status === "limite" ? (
              <div className={styles.aviso}>
                <p role="alert">{envio.mensagem}</p>

                {segundos > 0 ? (
                  <p>
                    Você pode tentar de novo em {segundos}{" "}
                    {segundos === 1 ? "segundo" : "segundos"}.
                  </p>
                ) : (
                  <Button variant="text" onClick={repetir}>
                    Tentar de novo
                  </Button>
                )}
              </div>
            ) : null}

            {usuario !== null ? (
              <ChatComposer
                id={ID_DO_CAMPO}
                blocked={envio.status === "esperando" || segundos > 0}
                onSend={enviar}
              />
            ) : null}

            {semConta ? (
              <div className={styles.convite}>
                <p>Entre na sua conta para conversar com a Veninha.</p>

                <Button
                  to="/login"
                  state={{ de: localizacao.pathname }}
                  onClick={fechar}
                >
                  Entrar
                </Button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </dialog>
  );
}

export default ChatDrawer;
