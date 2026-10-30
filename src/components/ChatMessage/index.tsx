import type { MensagemDoChat } from "../../types/chat";
import styles from "./styles.module.css";

interface ChatMessageProps {
  message: Pick<MensagemDoChat, "author" | "text">;
}

function ChatMessage({ message }: ChatMessageProps) {
  const daPessoa = message.author === "pessoa";

  return (
    <div className={daPessoa ? styles.linhaDaPessoa : styles.linhaDaVeninha}>
      <p className={daPessoa ? styles.balaoDaPessoa : styles.balaoDaVeninha}>
        <span className="texto-oculto">
          {daPessoa ? "Você: " : "Veninha: "}
        </span>
        {message.text}
      </p>
    </div>
  );
}

export default ChatMessage;
