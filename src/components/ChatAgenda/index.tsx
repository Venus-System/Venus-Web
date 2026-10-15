import { CalendarDays } from "lucide-react";
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
  onRetry: () => void;
}

function ChatAgenda({
  connection,
  disconnection,
  connectLink,
  onRetry,
}: ChatAgendaProps) {
  return (
    <>
      {connection.status === "carregando" ? (
        <p className={styles.info} aria-live="polite">
          Verificando a sua agenda...
        </p>
      ) : null}

      {connection.status === "erro" ? (
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

      {connection.status === "pronta" && !connection.conectada ? (
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
        </div>
      ) : null}
    </>
  );
}

export default ChatAgenda;
