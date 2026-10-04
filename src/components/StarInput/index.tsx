import { Star } from "lucide-react";
import type { Estrelas } from "../../types/avaliacao";
import styles from "./styles.module.css";

interface StarInputProps {
  id: string;
  legend: string;
  value: Estrelas | null;
  onChange: (valor: Estrelas) => void;
  hint?: string;
  error?: string;
}

const OPCOES: Estrelas[] = [1, 2, 3, 4, 5];

function idDaEstrela(id: string, estrelas: Estrelas): string {
  return `${id}-${estrelas}`;
}

function StarInput({
  id,
  legend,
  value,
  onChange,
  hint,
  error,
}: StarInputProps) {
  const hintId = `${id}-dica`;
  const erroId = `${id}-erro`;
  const descricao = [hint ? hintId : null, error ? erroId : null]
    .filter((item): item is string => item !== null)
    .join(" ");

  return (
    <fieldset
      className={styles.grupo}
      aria-describedby={descricao === "" ? undefined : descricao}
    >
      <legend className={styles.legenda}>{legend}</legend>

      <div className={styles.estrelas}>
        {OPCOES.map((estrelas) => (
          <label key={estrelas} className={styles.opcao}>
            <input
              id={idDaEstrela(id, estrelas)}
              type="radio"
              name={id}
              value={estrelas}
              checked={value === estrelas}
              onChange={() => onChange(estrelas)}
              className="texto-oculto"
            />
            <Star
              className={
                value !== null && estrelas <= value
                  ? styles.cheia
                  : styles.vazia
              }
              aria-hidden="true"
            />
            <span className="texto-oculto">
              {estrelas === 1 ? "1 estrela" : `${estrelas} estrelas`}
            </span>
          </label>
        ))}
      </div>

      {hint ? (
        <p id={hintId} className={styles.dica}>
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={erroId} className={styles.erro} role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export default StarInput;
