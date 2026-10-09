import type { IngredienteAvaliado } from "../../types/ingrediente";
import { ordenarPorRotulo } from "../../utils/alertas";
import IngredientCard from "../IngredientCard";
import Modal from "../Modal";
import styles from "./styles.module.css";

interface IngredientsModalProps {
  open: boolean;
  onClose: () => void;
  ingredients: IngredienteAvaliado[];
}

function IngredientsModal({ open, onClose, ingredients }: IngredientsModalProps) {
  return (
    <Modal open={open} title="Ingredientes" onClose={onClose}>
      <div className={styles.corpo}>
        <p className={styles.texto}>
          Na ordem em que aparecem no rótulo. Verde é aprovado, âmbar pede
          atenção e vermelho é melhor evitar.
        </p>

        <ul className={styles.lista}>
          {ordenarPorRotulo(ingredients).map((item) => (
            <li key={item.id}>
              <IngredientCard item={item} />
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}

export default IngredientsModal;
