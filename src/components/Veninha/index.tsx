import bocaAbertaEstreita from "../../assets/veninha/boca-aberta-estreita.png";
import bocaAbertaLarga from "../../assets/veninha/boca-aberta-larga.png";
import bocaFechada from "../../assets/veninha/boca-fechada.png";
import bocaFechadaFeliz from "../../assets/veninha/boca-fechada-feliz.png";
import bocaFechadaTriste from "../../assets/veninha/boca-fechada-triste.png";
import bocaTriste from "../../assets/veninha/boca-triste.png";
import caraChorando from "../../assets/veninha/veninha-chorando.png";
import caraConfusa from "../../assets/veninha/veninha-confusa.png";
import caraFeliz from "../../assets/veninha/veninha-feliz.png";
import caraPensando from "../../assets/veninha/veninha-pensando.png";
import { useMovimentoReduzido } from "../../hooks/useMovimentoReduzido";
import type { HumorDaVeninha } from "../../types/chat";
import styles from "./styles.module.css";

interface VeninhaProps {
  mood: HumorDaVeninha;
  speaking: boolean;
  mouthOpen: boolean;
}

interface Rosto {
  cara: string;
  aberta: string;
  fechada: string;
  abertaQuieta: boolean;
  abertaSemMovimento: boolean;
}

const ROSTOS: Record<HumorDaVeninha, Rosto> = {
  feliz: {
    cara: caraFeliz,
    aberta: bocaAbertaEstreita,
    fechada: bocaFechadaFeliz,
    abertaQuieta: false,
    abertaSemMovimento: true,
  },
  chorando: {
    cara: caraChorando,
    aberta: bocaAbertaLarga,
    fechada: bocaFechadaTriste,
    abertaQuieta: false,
    abertaSemMovimento: false,
  },
  confusa: {
    cara: caraConfusa,
    aberta: bocaAbertaLarga,
    fechada: bocaFechada,
    abertaQuieta: true,
    abertaSemMovimento: true,
  },
  pensando: {
    cara: caraPensando,
    aberta: bocaAbertaLarga,
    fechada: bocaTriste,
    abertaQuieta: false,
    abertaSemMovimento: true,
  },
};

function bocaAberta(
  rosto: Rosto,
  reduzido: boolean,
  falando: boolean,
  aberta: boolean,
): boolean {
  if (reduzido) {
    return rosto.abertaSemMovimento;
  }

  return falando ? aberta : rosto.abertaQuieta;
}

function Veninha({ mood, speaking, mouthOpen }: VeninhaProps) {
  const reduzido = useMovimentoReduzido();
  const rosto = ROSTOS[mood];
  const aberta = bocaAberta(rosto, reduzido, speaking, mouthOpen);

  return (
    <div className={`${styles.veninha} ${styles[mood]}`} aria-hidden="true">
      <img className={styles.cara} src={rosto.cara} alt="" />

      <img
        className={`${styles.boca} ${aberta ? styles.aberta : styles.fechada}`}
        src={aberta ? rosto.aberta : rosto.fechada}
        alt=""
      />
    </div>
  );
}

export default Veninha;
