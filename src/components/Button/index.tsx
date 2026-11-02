import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  MouseEvent,
  ReactNode,
} from "react";
import { Link } from "react-router-dom";
import type { LinkProps } from "react-router-dom";
import styles from "./styles.module.css";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "text"
  | "violet"
  | "danger"
  | "soft";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
}

type ButtonProps =
  | (ButtonBaseProps & {
      to?: undefined;
      href?: undefined;
      busy?: boolean;
    } & ButtonHTMLAttributes<HTMLButtonElement>)
  | (ButtonBaseProps & { href?: undefined } & Omit<
        LinkProps,
        "className" | "children"
      >)
  | (ButtonBaseProps & { to?: undefined; href: string } & Omit<
        AnchorHTMLAttributes<HTMLAnchorElement>,
        "className" | "children" | "href"
      >);

function Button(props: ButtonProps) {
  const { variant = "primary", className, children } = props;
  const classes = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  if (props.href !== undefined) {
    const { variant: _variant, className: _className, ...rest } = props;

    return (
      <a {...rest} className={classes}>
        {children}
      </a>
    );
  }

  if (props.to !== undefined) {
    const { variant: _variant, className: _className, ...rest } = props;

    return (
      <Link {...rest} className={classes}>
        {children}
      </Link>
    );
  }

  const {
    variant: _variant,
    className: _className,
    type = "button",
    busy = false,
    onClick,
    ...rest
  } = props;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (busy) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  }

  return (
    <button
      {...rest}
      type={type}
      className={classes}
      aria-disabled={busy ? true : rest["aria-disabled"]}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

export default Button;
