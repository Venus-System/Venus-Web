import fio1 from "../../assets/ilustracoes/fio-1.svg";
import fio2a from "../../assets/ilustracoes/fio-2a.svg";
import fio2b from "../../assets/ilustracoes/fio-2b.svg";
import fio2c from "../../assets/ilustracoes/fio-2c.svg";
import fio3a from "../../assets/ilustracoes/fio-3a.svg";
import fio3b from "../../assets/ilustracoes/fio-3b.svg";
import fio3c from "../../assets/ilustracoes/fio-3c.svg";
import fio4a from "../../assets/ilustracoes/fio-4a.svg";
import fio4b from "../../assets/ilustracoes/fio-4b.svg";
import fio4c from "../../assets/ilustracoes/fio-4c.svg";
import Button from "../Button";
import Modal from "../Modal";
import styles from "./styles.module.css";

interface ModalTipoCabeloProps {
  open: boolean;
  onClose: () => void;
}

interface TipoDeCurvatura {
  id: string;
  descricao: string;
  ilustracao: string;
}

interface GrupoDeCurvatura {
  id: string;
  rotulo: string;
  tipos: TipoDeCurvatura[];
}

const GRUPOS: GrupoDeCurvatura[] = [
  {
    id: "liso",
    rotulo: "Liso",
    tipos: [{ id: "1", descricao: "Sem ondas, cai reto.", ilustracao: fio1 }],
  },
  {
    id: "ondulado",
    rotulo: "Ondulado",
    tipos: [
      { id: "2a", descricao: "Onda leve, quase reto.", ilustracao: fio2a },
      { id: "2b", descricao: "Onda em S definida.", ilustracao: fio2b },
      { id: "2c", descricao: "Onda marcada, quase cacho.", ilustracao: fio2c },
    ],
  },
  {
    id: "cacheado",
    rotulo: "Cacheado",
    tipos: [
      { id: "3a", descricao: "Cacho largo e solto.", ilustracao: fio3a },
      { id: "3b", descricao: "Cacho médio, mais fechado.", ilustracao: fio3b },
      { id: "3c", descricao: "Cacho bem fechado.", ilustracao: fio3c },
    ],
  },
  {
    id: "crespo",
    rotulo: "Crespo",
    tipos: [
      { id: "4a", descricao: "Espiral pequena e definida.", ilustracao: fio4a },
      { id: "4b", descricao: "Curvatura em zigue-zague.", ilustracao: fio4b },
      { id: "4c", descricao: "Zigue-zague bem fechado.", ilustracao: fio4c },
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
                <img
                  className={styles.ilustracao}
                  src={tipo.ilustracao}
                  alt=""
                />
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
