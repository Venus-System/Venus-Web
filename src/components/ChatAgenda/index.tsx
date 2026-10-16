import { CalendarDays, X } from "lucide-react";
import Button from "../Button";
import type {
  EstadoDaConexao,
  EstadoDaDesconexao,
  EstadoDoLink,
} from "../../types/agenda";
import styles from "./styles.module.css";

interface ChatAgendaProps {
  connection: EstadoDaConexao;
  disconnection: EstadoDaDesconexao;
  connectLink: EstadoDoLink;
  inviteClosed: boolean;
  onRetry: () => void;
  onRetryLink: () => void;
  onCloseInvite: () => void;
}

function ChatAgenda({
  connection,
  disconnection,
  connectLink,
  inviteClosed,
  onRetry,
  onRetryLink,
  onCloseInvite,
}: ChatAgendaProps) {
  const mostraConvite =
    connection.status === "pronta" && !connection.conectada && !inviteClosed;

  return (
    <>
      {connection.status === "carregando" && !inviteClosed ? (
        <p className={styles.info} aria-live="polite">
          Verificando a sua agenda...
        </p>
      ) : null}

      {connection.status === "erro" && !inviteClosed ? (
        <div className={styles.aviso}>
          <p role="alert">{connection.mensagem}</p>

          <Button variant="text" onClick={onRetry}>
            Tentar de novo
          </Button>
        </div>
      ) : null}

      {disconnection.status === "desconectando" ? (
        <p className={styles.info} aria-live="polite">
          Desconectando a sua agenda...
        </p>
      ) : null}

      {disconnection.status === "erro" ? (
        <p className={styles.aviso} role="alert">
          {disconnection.mensagem}
        </p>
      ) : null}

      {disconnection.status === "concluida" ? (
        <p className={styles.info} role="status">
          Agenda desconectada.
        </p>
      ) : null}

      {mostraConvite && connectLink.status === "erro" ? (
        <div className={styles.aviso}>
          <p role="alert">Não foi possível preparar a conexão com o Google.</p>

          <Button variant="text" onClick={onRetryLink}>
            Tentar de novo
          </Button>
        </div>
      ) : null}

      {mostraConvite ? (
        <div className={styles.convite}>
          <CalendarDays className={styles.icone} aria-hidden="true" />

          <p className={styles.texto}>
            Conecte a sua Google Agenda para eu montar a sua rotina.
          </p>

          {connectLink.status === "pronto" ? (
            <Button href={connectLink.url} className={styles.conectar}>
              Conectar
            </Button>
          ) : null}

          <button
            type="button"
            className={styles.fechar}
            onClick={onCloseInvite}
            aria-label="Fechar o convite da Google Agenda"
          >
            <X className={styles.fecharIcone} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </>
  );
}

export default ChatAgenda;
