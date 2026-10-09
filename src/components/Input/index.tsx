import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./styles.module.css";

export type InputLabelVariant = "field" | "title";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  hideLabel?: boolean;
  labelVariant?: InputLabelVariant;
  revealable?: boolean;
  icon?: ReactNode;
}

const labelClasses: Record<InputLabelVariant, string> = {
  field: styles.label,
  title: styles.labelTitle,
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id,
    label,
    error,
    hint,
    hideLabel = false,
    labelVariant = "field",
    revealable = false,
    icon,
    type = "text",
    className,
    "aria-describedby": externalDescribedBy,
    ...rest
  },
  ref,
) {
  const [revealed, setRevealed] = useState(false);

  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const showToggle = revealable && type === "password";
  const currentType = showToggle && revealed ? "text" : type;

  const describedBy = [
    externalDescribedBy,
    hint ? hintId : "",
    error ? errorId : "",
  ]
    .filter(Boolean)
    .join(" ");

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
        className={hideLabel ? "texto-oculto" : labelClasses[labelVariant]}
      >
        {label}
      </label>

      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}

      <div className={styles.control}>
        {icon ? (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        ) : null}

        <input
          ref={ref}
          id={id}
          type={currentType}
          className={fieldClasses}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy === "" ? undefined : describedBy}
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
});

export default Input;
