import bocaAbertaEstreita from "../../assets/veninha/boca-aberta-estreita.png";
import bocaAbertaLarga from "../../assets/veninha/boca-aberta-larga.png";
import bocaFechada from "../../assets/veninha/boca-fechada.png";
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
  mouthOpen: boolean;
}

interface Rosto {
  cara: string;
  aberta: string;
  fechada: string;
  abertaQuandoParada: boolean;
}

const ROSTOS: Record<HumorDaVeninha, Rosto> = {
  feliz: {
    cara: caraFeliz,
    aberta: bocaAbertaEstreita,
    fechada: bocaFechada,
    abertaQuandoParada: true,
  },
  chorando: {
    cara: caraChorando,
    aberta: bocaAbertaLarga,
    fechada: bocaTriste,
    abertaQuandoParada: false,
  },
  confusa: {
    cara: caraConfusa,
    aberta: bocaAbertaLarga,
    fechada: bocaFechada,
    abertaQuandoParada: true,
  },
  pensando: {
    cara: caraPensando,
    aberta: bocaAbertaLarga,
    fechada: bocaTriste,
    abertaQuandoParada: true,
  },
};

function Veninha({ mood, mouthOpen }: VeninhaProps) {
  const reduzido = useMovimentoReduzido();
  const rosto = ROSTOS[mood];
  const aberta = reduzido ? rosto.abertaQuandoParada : mouthOpen;

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
