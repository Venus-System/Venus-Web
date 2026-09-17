import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";

interface DocumentLinkProps {
  href?: string;
  children?: ReactNode;
}

function DocumentLink({ href, children }: DocumentLinkProps) {
  if (href === undefined || href.startsWith("//")) {
    return <>{children}</>;
  }

  if (href.startsWith("/")) {
    return <Link to={href}>{children}</Link>;
  }

  if (href.startsWith("#")) {
    return <a href={href}>{children}</a>;
  }

  if (!href.startsWith("https://")) {
    return <>{children}</>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className={styles.srOnly}> (abre em nova aba)</span>
    </a>
  );
}

export default DocumentLink;
