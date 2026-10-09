import type { IngredienteAvaliado } from "../../types/ingrediente";
import RiskBadge from "../RiskBadge";
import styles from "./styles.module.css";

interface IngredientCardProps {
  item: IngredienteAvaliado;
}

function IngredientCard({ item }: IngredientCardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.name}>
        {item.ingredient?.commonName ?? item.inciName}
      </h3>

      <div className={styles.row}>
        <RiskBadge level={item.level} />

        <p className={styles.text}>
          {item.ingredient?.functionSummary ??
            "Ainda não temos informação verificada sobre este ingrediente."}
        </p>
      </div>
    </div>
  );
}

export default IngredientCard;
