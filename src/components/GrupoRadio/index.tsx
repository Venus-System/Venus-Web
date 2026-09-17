import styles from "./styles.module.css";

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
  error?: string;
}

function GrupoRadio<T extends string>({
  id,
  legend,
  options,
  value,
  onChange,
  error,
}: GrupoRadioProps<T>) {
  const errorId = `${id}-error`;

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
            <label key={option.value} htmlFor={optionId} className={styles.option}>
              <input
                id={optionId}
                type="radio"
                name={id}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className={styles.radio}
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
