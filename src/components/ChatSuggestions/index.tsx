import styles from "./styles.module.css";

interface ChatSuggestionsProps {
  suggestions: string[];
  blocked: boolean;
  onPick: (texto: string) => void;
}

function ChatSuggestions({ suggestions, blocked, onPick }: ChatSuggestionsProps) {
  function escolher(texto: string) {
    if (!blocked) {
      onPick(texto);
    }
  }

  return (
    <ul className={styles.lista} aria-label="Sugestões de pergunta">
      {suggestions.map((texto) => (
        <li key={texto}>
          <button
            type="button"
            className={styles.sugestao}
            aria-disabled={blocked}
            onClick={() => escolher(texto)}
          >
            {texto}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default ChatSuggestions;
