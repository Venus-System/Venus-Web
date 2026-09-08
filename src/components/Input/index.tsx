import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./styles.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  hideLabel?: boolean;
  revealable?: boolean;
  icon?: ReactNode;
}

function Input({
  id,
  label,
  error,
  hideLabel = false,
  revealable = false,
  icon,
  type = "text",
  className,
  ...rest
}: InputProps) {
  const [revealed, setRevealed] = useState(false);

  const errorId = `${id}-error`;
  const showToggle = revealable && type === "password";
  const currentType = showToggle && revealed ? "text" : type;

  const fieldClasses = [
    styles.field,
    icon ? styles.fieldWithIcon : "",
    showToggle ? styles.fieldWithAction : "",
    error ? styles.fieldInvalid : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.wrapper}>
      <label
        htmlFor={id}
        className={hideLabel ? styles.labelHidden : styles.label}
      >
        {label}
      </label>

      <div className={styles.control}>
        {icon ? (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        ) : null}

        <input
          id={id}
          type={currentType}
          className={fieldClasses}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />

        {showToggle ? (
          <button
            type="button"
            className={styles.action}
            onClick={() => setRevealed((current) => !current)}
            aria-label={revealed ? "Ocultar senha" : "Mostrar senha"}
          >
            {revealed ? (
              <EyeOff className={styles.actionIcon} aria-hidden="true" />
            ) : (
              <Eye className={styles.actionIcon} aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default Input;
