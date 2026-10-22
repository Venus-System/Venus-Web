import { MessageCircle } from "lucide-react";
import styles from "./styles.module.css";

interface ChatButtonProps {
  onOpen: () => void;
}

function ChatButton({ onOpen }: ChatButtonProps) {
  return (
    <button
      type="button"
      className={styles.botao}
      onClick={onOpen}
      aria-label="Conversar com a Veninha"
      aria-haspopup="dialog"
    >
      <MessageCircle className={styles.icone} aria-hidden="true" />
    </button>
  );
}

export default ChatButton;
