import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LinkProps } from "react-router-dom";
import styles from "./styles.module.css";

export type ButtonVariant = "primary" | "secondary" | "text";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
}

type ButtonProps =
  | (ButtonBaseProps & { to?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
  | (ButtonBaseProps & Omit<LinkProps, "className" | "children">);

function Button(props: ButtonProps) {
  const { variant = "primary", className, children } = props;
  const classes = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  if (props.to !== undefined) {
    const { variant: _variant, className: _className, ...rest } = props;

    return (
      <Link {...rest} className={classes}>
        {children}
      </Link>
    );
  }

  const { variant: _variant, className: _className, type = "button", ...rest } = props;

  return (
    <button {...rest} type={type} className={classes}>
      {children}
    </button>
  );
}

export default Button;
