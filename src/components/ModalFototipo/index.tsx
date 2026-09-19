import Button from "../Button";
import Modal from "../Modal";
import styles from "./styles.module.css";

interface ModalFototipoProps {
  open: boolean;
  onClose: () => void;
}

interface Fototipo {
  id: string;
  numeral: string;
  descricao: string;
}

const FOTOTIPOS: Fototipo[] = [
  { id: "i", numeral: "I", descricao: "Sempre queima, nunca bronzeia." },
  { id: "ii", numeral: "II", descricao: "Quase sempre queima, bronzeia pouco." },
  { id: "iii", numeral: "III", descricao: "Às vezes queima, bronzeia aos poucos." },
  { id: "iv", numeral: "IV", descricao: "Raramente queima, bronzeia bem." },
  { id: "v", numeral: "V", descricao: "Quase nunca queima, bronzeia bastante." },
  { id: "vi", numeral: "VI", descricao: "Nunca queima, bronzeia intensamente." },
];

function ModalFototipo({ open, onClose }: ModalFototipoProps) {
  return (
    <Modal open={open} title="Qual é o seu fototipo de pele?" onClose={onClose}>
      <p className={styles.intro}>
        O fototipo descreve como a sua pele reage ao sol, e não a cor dela.
        Pense no que acontece depois de meia hora de sol forte, sem protetor.
      </p>

      <ul className={styles.lista}>
        {FOTOTIPOS.map((fototipo) => (
          <li className={styles.item} key={fototipo.id}>
            <span
              className={`${styles.tom} ${styles[fototipo.id]}`}
              aria-hidden="true"
            />
            <p className={styles.numeral}>{fototipo.numeral}</p>
            <p className={styles.descricao}>{fototipo.descricao}</p>
          </li>
        ))}
      </ul>

      <p className={styles.nota}>
        Se você ficou entre dois fototipos, escolha o mais claro. A Venus fica
        mais cautelosa com o protetor solar, e isso é o mais seguro.
      </p>

      <Button onClick={onClose}>Entendi</Button>
    </Modal>
  );
}

export default ModalFototipo;
