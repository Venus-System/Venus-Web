import { ArrowUp } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./styles.module.css";

interface StatCardProps {
  label: string;
  value: string;
  suffix?: string;
  valueLabel?: string;
  description: string;
  trend?: string;
  children?: ReactNode;
}

function StatCard({
  label,
  value,
  suffix,
  valueLabel,
  description,
  trend,
  children,
}: StatCardProps) {
  return (
    <article className={styles.card}>
      <h2 className={styles.label}>{label}</h2>

      <p className={styles.value}>
        <span aria-hidden={valueLabel === undefined ? undefined : true}>
          {value}
          {suffix === undefined ? null : (
            <span className={styles.suffix}>{suffix}</span>
          )}
        </span>

        {valueLabel === undefined ? null : (
          <span className="texto-oculto">{valueLabel}</span>
        )}
      </p>

      <p className={styles.description}>{description}</p>

      {trend === undefined ? null : (
        <p className={styles.trend}>
          <ArrowUp className={styles.icon} aria-hidden="true" />
          {trend}
        </p>
      )}

      {children}
    </article>
  );
}

export default StatCard;
