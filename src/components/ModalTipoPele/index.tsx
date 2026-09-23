import rostoMisto from "../../assets/ilustracoes/rosto-misto.svg";
import rostoNormal from "../../assets/ilustracoes/rosto-normal.svg";
import rostoOleoso from "../../assets/ilustracoes/rosto-oleoso.svg";
import rostoSeca from "../../assets/ilustracoes/rosto-seca.svg";
import rostoSensivel from "../../assets/ilustracoes/rosto-sensivel.svg";
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
  ilustracao: string;
}

const TIPOS: TipoDePele[] = [
  {
    id: "normal",
    nome: "Normal",
    descricao: "Equilibrada, sem brilho e sem repuxo.",
    ilustracao: rostoNormal,
  },
  {
    id: "dry",
    nome: "Seca",
    descricao: "Repuxa, descama e pede hidratação.",
    ilustracao: rostoSeca,
  },
  {
    id: "combination",
    nome: "Mista",
    descricao: "Zona T oleosa e bochechas normais.",
    ilustracao: rostoMisto,
  },
  {
    id: "oily",
    nome: "Oleosa",
    descricao: "Brilho o dia todo e poros abertos.",
    ilustracao: rostoOleoso,
  },
  {
    id: "sensitive",
    nome: "Sensível",
    descricao: "Reage fácil, com ardência ou vermelhidão.",
    ilustracao: rostoSensivel,
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
            <img className={styles.ilustracao} src={tipo.ilustracao} alt="" />
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
