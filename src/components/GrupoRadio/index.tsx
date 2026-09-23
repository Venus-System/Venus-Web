import styles from "./styles.module.css";

export type RadioVariant = "circulo" | "pilula";

export interface RadioOption<T extends string> {
  value: T;
  label: string;
}

interface GrupoRadioProps<T extends string> {
  id: string;
  legend: string;
  options: RadioOption<T>[];
  value: T | "";
  onChange: (valor: T) => void;
  variant?: RadioVariant;
  error?: string;
}

function GrupoRadio<T extends string>({
  id,
  legend,
  options,
  value,
  onChange,
  variant = "circulo",
  error,
}: GrupoRadioProps<T>) {
  const errorId = `${id}-error`;
  const ehPilula = variant === "pilula";

  return (
    <fieldset
      className={styles.group}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className={styles.legend}>{legend}</legend>

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
                type="radio"
                name={id}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className={ehPilula ? "texto-oculto" : styles.radio}
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

export default GrupoRadio;
