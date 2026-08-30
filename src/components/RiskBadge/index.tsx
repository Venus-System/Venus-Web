import { AlertTriangle, Check, CircleHelp, Ban } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RiskLevel } from "../../types/ingrediente";
import styles from "./styles.module.css";

interface RiskBadgeProps {
  level: RiskLevel;
}

interface BadgeContent {
  label: string;
  Icon: LucideIcon;
}

const CONTENT: Record<RiskLevel, BadgeContent> = {
  safe: { label: "Aprovado", Icon: Check },
  warning: { label: "Atenção", Icon: AlertTriangle },
  avoid: { label: "Evitar", Icon: Ban },
  "no-data": { label: "Não verificado", Icon: CircleHelp },
};

function RiskBadge({ level }: RiskBadgeProps) {
  const { label, Icon } = CONTENT[level];
  const classes = [styles.badge, styles[level]].join(" ");

  return (
    <span className={classes}>
      <Icon className={styles.icon} aria-hidden="true" />
      {label}
    </span>
  );
}

export default RiskBadge;
