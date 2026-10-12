import type { IngredienteAvaliado } from "../../types/ingrediente";
import RiskBadge from "../RiskBadge";
import styles from "./styles.module.css";

interface IngredientCardProps {
  item: IngredienteAvaliado;
  note?: string;
}

function IngredientCard({ item, note }: IngredientCardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.name}>
        {item.ingredient?.commonName ?? item.inciName}
      </h3>

      <div className={styles.row}>
        <RiskBadge level={item.level} />

        <p className={styles.text}>
          {item.ingredient?.description ??
            "Ainda não temos informação verificada sobre este ingrediente."}
        </p>
      </div>

      {note ? <p className={styles.note}>{note}</p> : null}
    </div>
  );
}

export default IngredientCard;
