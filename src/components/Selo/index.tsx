import styles from "./styles.module.css";

export type SeloVariante = "contorno" | "destaque" | "alerta" | "sucesso";

interface SeloProps {
  label: string;
  variant?: SeloVariante;
}

function Selo({ label, variant = "contorno" }: SeloProps) {
  return <span className={`${styles.selo} ${styles[variant]}`}>{label}</span>;
}

export default Selo;
