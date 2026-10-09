import styles from "./styles.module.css";

export type RadioVariant = "circulo" | "pilula" | "segmentado";

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
  vertical?: boolean;
  legendHidden?: boolean;
  error?: string;
}

const CLASSE_DA_OPCAO: Record<RadioVariant, string> = {
  circulo: styles.option,
  pilula: styles.pilula,
  segmentado: styles.segmento,
};

function GrupoRadio<T extends string>({
  id,
  legend,
  options,
  value,
  onChange,
  variant = "circulo",
  vertical = false,
  legendHidden = false,
  error,
}: GrupoRadioProps<T>) {
  const errorId = `${id}-error`;
  const radioOculto = variant !== "circulo";

  let classeDasOpcoes = vertical ? styles.optionsVertical : styles.options;

  if (variant === "segmentado") {
    classeDasOpcoes = styles.segmentos;
  }

  return (
    <fieldset
      className={styles.group}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className={legendHidden ? "texto-oculto" : styles.legend}>
        {legend}
      </legend>

      <div className={classeDasOpcoes}>
        {options.map((option, posicao) => {
          const optionId = posicao === 0 ? id : `${id}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={CLASSE_DA_OPCAO[variant]}
            >
              <input
                id={optionId}
                type="radio"
                name={id}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className={radioOculto ? "texto-oculto" : styles.radio}
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
