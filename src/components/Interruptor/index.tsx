import styles from "./styles.module.css";

interface InterruptorProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (ligado: boolean) => void;
  hint?: string;
  error?: string;
  indisponivel?: boolean;
}

function Interruptor({
  id,
  label,
  checked,
  onChange,
  hint,
  error,
  indisponivel = false,
}: InterruptorProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy = [hint ? hintId : "", error ? errorId : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.campo}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className="texto-oculto"
        checked={checked}
        onChange={(event) => {
          if (!indisponivel) {
            onChange(event.target.checked);
          }
        }}
        aria-disabled={indisponivel ? true : undefined}
        aria-describedby={describedBy === "" ? undefined : describedBy}
      />

      <label
        className={indisponivel ? styles.rotuloInativo : styles.rotulo}
        htmlFor={id}
      >
        <span className={styles.texto}>{label}</span>

        <span className={styles.pista} aria-hidden="true">
          <span className={styles.bolinha} />
        </span>
      </label>

      {hint ? (
        <p id={hintId} className={styles.dica}>
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className={styles.erro}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default Interruptor;
