import Button from "../Button";
import Modal from "../Modal";
import styles from "./styles.module.css";

interface ModalTipoPeleProps {
  open: boolean;
  onClose: () => void;
}

interface TipoDePele {
  id: string;
  nome: string;
  descricao: string;
}

const TIPOS: TipoDePele[] = [
  {
    id: "normal",
    nome: "Normal",
    descricao: "Equilibrada, sem brilho e sem repuxo.",
  },
  {
    id: "dry",
    nome: "Seca",
    descricao: "Repuxa, descama e pede hidratação.",
  },
  {
    id: "combination",
    nome: "Mista",
    descricao: "Zona T oleosa e bochechas normais.",
  },
  {
    id: "oily",
    nome: "Oleosa",
    descricao: "Brilho o dia todo e poros abertos.",
  },
  {
    id: "sensitive",
    nome: "Sensível",
    descricao: "Reage fácil, com ardência ou vermelhidão.",
  },
];

function ModalTipoPele({ open, onClose }: ModalTipoPeleProps) {
  return (
    <Modal open={open} title="Qual é o seu tipo de pele?" onClose={onClose}>
      <p className={styles.intro}>
        Pense em como a sua pele fica algumas horas depois da limpeza, sem
        nenhum produto. É esse estado natural que define o tipo.
      </p>

      <ul className={styles.lista}>
        {TIPOS.map((tipo) => (
          <li className={styles.item} key={tipo.id}>
            <p className={styles.nome}>{tipo.nome}</p>
            <p className={styles.descricao}>{tipo.descricao}</p>
          </li>
        ))}
      </ul>

      <Button onClick={onClose}>Entendi</Button>
    </Modal>
  );
}

export default ModalTipoPele;
