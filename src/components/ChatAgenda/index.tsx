import { CalendarDays, X } from "lucide-react";
import Button from "../Button";
import type {
  EstadoDaConexao,
  EstadoDaDesconexao,
} from "../../types/agenda";
import styles from "./styles.module.css";

interface ChatAgendaProps {
  connection: EstadoDaConexao;
  disconnection: EstadoDaDesconexao;
  connectLink: string | null;
  inviteClosed: boolean;
  onRetry: () => void;
  onCloseInvite: () => void;
}

function ChatAgenda({
  connection,
  disconnection,
  connectLink,
  inviteClosed,
  onRetry,
  onCloseInvite,
}: ChatAgendaProps) {
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

      {connection.status === "pronta" &&
      !connection.conectada &&
      !inviteClosed ? (
        <div className={styles.convite}>
          <CalendarDays className={styles.icone} aria-hidden="true" />

          <p className={styles.texto}>
            Conecte a sua Google Agenda para eu montar a sua rotina.
          </p>

          {connectLink !== null ? (
            <Button href={connectLink} className={styles.conectar}>
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
