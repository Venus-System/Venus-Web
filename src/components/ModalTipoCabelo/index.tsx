import Button from "../Button";
import Modal from "../Modal";
import styles from "./styles.module.css";

interface ModalTipoCabeloProps {
  open: boolean;
  onClose: () => void;
}

interface GrupoDeCurvatura {
  id: string;
  rotulo: string;
  tipos: { id: string; descricao: string }[];
}

const GRUPOS: GrupoDeCurvatura[] = [
  {
    id: "liso",
    rotulo: "Liso",
    tipos: [{ id: "1", descricao: "Sem ondas, cai reto." }],
  },
  {
    id: "ondulado",
    rotulo: "Ondulado",
    tipos: [
      { id: "2a", descricao: "Onda leve, quase reto." },
      { id: "2b", descricao: "Onda em S definida." },
      { id: "2c", descricao: "Onda marcada, quase cacho." },
    ],
  },
  {
    id: "cacheado",
    rotulo: "Cacheado",
    tipos: [
      { id: "3a", descricao: "Cacho largo e solto." },
      { id: "3b", descricao: "Cacho médio, mais fechado." },
      { id: "3c", descricao: "Cacho bem fechado." },
    ],
  },
  {
    id: "crespo",
    rotulo: "Crespo",
    tipos: [
      { id: "4a", descricao: "Espiral pequena e definida." },
      { id: "4b", descricao: "Curvatura em zigue-zague." },
      { id: "4c", descricao: "Zigue-zague bem fechado." },
    ],
  },
];

function ModalTipoCabelo({ open, onClose }: ModalTipoCabeloProps) {
  return (
    <Modal open={open} title="Qual é o seu tipo de cabelo?" onClose={onClose}>
      <p className={styles.intro}>
        A classificação vai do fio liso ao crespo. Compare com o seu e escolha o
        mais parecido. Se ficar na dúvida entre dois, escolha o mais próximo.
      </p>

      {GRUPOS.map((grupo) => (
        <section className={styles.grupo} key={grupo.id}>
          <h3 className={styles.rotulo}>{grupo.rotulo}</h3>

          <ul className={styles.lista}>
            {grupo.tipos.map((tipo) => (
              <li className={styles.item} key={tipo.id}>
                <p className={styles.codigo}>{tipo.id}</p>
                <p className={styles.descricao}>{tipo.descricao}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <Button onClick={onClose}>Entendi</Button>
    </Modal>
  );
}

export default ModalTipoCabelo;
