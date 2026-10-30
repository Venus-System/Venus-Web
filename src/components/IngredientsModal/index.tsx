import type { IngredienteAvaliado } from "../../types/ingrediente";
import { ehAlertaPessoal, ordenarPorRotulo } from "../../utils/alertas";
import IngredientCard from "../IngredientCard";
import RiskLegend from "../RiskLegend";
import Modal from "../Modal";
import styles from "./styles.module.css";

interface IngredientsModalProps {
  open: boolean;
  onClose: () => void;
  ingredients: IngredienteAvaliado[];
  alertNames?: string[];
}

function IngredientsModal({
  open,
  onClose,
  ingredients,
  alertNames = [],
}: IngredientsModalProps) {
  return (
    <Modal open={open} title="Ingredientes" onClose={onClose}>
      <div className={styles.corpo}>
        <p className={styles.texto}>Na ordem em que aparecem no rótulo.</p>

        <RiskLegend label="Legenda do semáforo" />

        <ul className={styles.lista}>
          {ordenarPorRotulo(ingredients).map((item) => (
            <li key={item.id}>
              <IngredientCard
                item={item}
                note={
                  ehAlertaPessoal(item, alertNames)
                    ? "Alerta para o seu perfil"
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}

export default IngredientsModal;
