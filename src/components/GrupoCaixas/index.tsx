import styles from "./styles.module.css";

export type CheckboxVariant = "quadrado" | "pilula";

export interface CheckboxOption<T extends string> {
  value: T;
  label: string;
}

interface GrupoCaixasProps<T extends string> {
  id: string;
  legend: string;
  hint?: string;
  options: CheckboxOption<T>[];
  value: T[];
  onChange: (valores: T[]) => void;
  variant?: CheckboxVariant;
  error?: string;
}

function GrupoCaixas<T extends string>({
  id,
  legend,
  hint,
  options,
  value,
  onChange,
  variant = "quadrado",
  error,
}: GrupoCaixasProps<T>) {
  const ehPilula = variant === "pilula";
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy = [hint ? hintId : "", error ? errorId : ""]
    .filter(Boolean)
    .join(" ");

  function alternar(option: CheckboxOption<T>) {
    onChange(
      value.includes(option.value)
        ? value.filter((marcada) => marcada !== option.value)
        : [...value, option.value],
    );
  }

  return (
    <fieldset
      className={styles.group}
      aria-describedby={describedBy === "" ? undefined : describedBy}
    >
      <legend className={styles.legend}>{legend}</legend>

      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}

      <div className={styles.options}>
        {options.map((option, posicao) => {
          const optionId = posicao === 0 ? id : `${id}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={ehPilula ? styles.pilula : styles.option}
            >
              <input
                id={optionId}
                type="checkbox"
                className={ehPilula ? "texto-oculto" : styles.checkbox}
                checked={value.includes(option.value)}
                onChange={() => alternar(option)}
              />
              {option.label}
            </label>
          );
        })}
      </div>

      {error ? (
        <p id={errorId} role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export default GrupoCaixas;
