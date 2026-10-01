import { ChevronDown } from "lucide-react";
import type { ChangeEvent } from "react";
import styles from "./styles.module.css";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface ListaSuspensaProps<T extends string> {
  id: string;
  label: string;
  placeholder: string;
  options: SelectOption<T>[];
  value: T | "";
  onChange: (valor: T) => void;
  error?: string;
  hideLabel?: boolean;
  fullWidth?: boolean;
}

function ListaSuspensa<T extends string>({
  id,
  label,
  placeholder,
  options,
  value,
  onChange,
  error,
  hideLabel = false,
  fullWidth = false,
}: ListaSuspensaProps<T>) {
  const errorId = `${id}-error`;

  const fieldClasses = [styles.field, error ? styles.fieldInvalid : ""]
    .filter(Boolean)
    .join(" ");

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const escolhida = options.find(
      (option) => option.value === event.target.value,
    );

    if (escolhida) {
      onChange(escolhida.value);
    }
  }

  return (
    <div className={styles.wrapper}>
      <label
        htmlFor={id}
        className={hideLabel ? "texto-oculto" : styles.label}
      >
        {label}
      </label>

      <div
        className={
          fullWidth ? `${styles.control} ${styles.fullWidth}` : styles.control
        }
      >
        <select
          id={id}
          className={fieldClasses}
          value={value}
          onChange={handleChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        >
          <option value="" disabled>
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className={styles.icon} aria-hidden="true" />
      </div>

      {error ? (
        <p id={errorId} role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default ListaSuspensa;
