import { useState } from "react";
import type { NotasDaAnalise } from "../../types/analise";
import {
  FAIXAS,
  ROTULO_DA_FAIXA,
  nivelDaRecomendacao,
} from "../../utils/niveis";
import { NOTAS_DE_QUALIDADE } from "../../utils/notas";
import Button from "../Button";
import Modal from "../Modal";
import RiskBadge from "../RiskBadge";
import styles from "./styles.module.css";

interface ScoreExplanationProps {
  breakdown?: NotasDaAnalise;
}

const TRAVAS = [
  {
    id: "contraindicado",
    texto:
      "Ingrediente contraindicado para você, como retinol na gestação, ou alergia crítica: a nota vai a zero.",
  },
  { id: "alta", texto: "Alergia alta: a nota fica em 15, no máximo." },
  { id: "media", texto: "Alergia média: a nota fica em 49, no máximo." },
  { id: "leve", texto: "Alergia leve: a nota perde 15 pontos." },
];

function intervalo(posicao: number): string {
  const maximo = posicao === 0 ? 100 : FAIXAS[posicao - 1].minimo - 1;

  return `${FAIXAS[posicao].minimo} a ${maximo}`;
}

function comVirgula(pontos: number): string {
  return pontos.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

function ScoreExplanation({ breakdown }: ScoreExplanationProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <Button variant="text" onClick={() => setAberto(true)}>
        Como a nota é calculada
      </Button>

      <Modal
        open={aberto}
        title="Como a Venus chega à nota"
        onClose={() => setAberto(false)}
      >
        <div className={styles.corpo}>
          <section className={styles.bloco}>
            <h3 className={styles.titulo}>A nota tem duas partes</h3>

            <p className={styles.texto}>
              Sem perfil, você vê a <strong>qualidade do produto</strong>, de 0
              a 100, igual para todo mundo. Com perfil, a nota junta duas
              coisas: até 35 pontos vêm da qualidade e até 65 de quanto a
              fórmula combina com você.
            </p>

            {breakdown !== undefined && breakdown.qualityPoints !== null ? (
              <p className={styles.destaque}>
                Neste produto: {comVirgula(breakdown.qualityPoints)} de 35 pela
                qualidade
                {breakdown.profilePoints === null
                  ? ". Nenhuma resposta do seu perfil entrou na conta."
                  : ` e ${comVirgula(breakdown.profilePoints)} de 65 pelo seu perfil.`}
              </p>
            ) : null}
          </section>

          <section className={styles.bloco}>
            <h3 className={styles.titulo}>As quatro notas de qualidade</h3>

            <dl className={styles.notas}>
              {NOTAS_DE_QUALIDADE.map((nota) => (
                <div className={styles.nota} key={nota.campo}>
                  <dt className={styles.termo}>
                    {nota.rotulo}{" "}
                    <span className={styles.peso}>({nota.peso})</span>
                  </dt>
                  <dd className={styles.definicao}>{nota.descricao}</dd>
                </div>
              ))}
            </dl>

            <p className={styles.texto}>
              Quando falta dado para uma nota, ela aparece como "Sem dado" e
              sai da média, em vez de valer zero.
            </p>
          </section>

          <section className={styles.bloco}>
            <h3 className={styles.titulo}>A segurança vem antes</h3>

            <p className={styles.texto}>
              Alergia e contraindicação não descontam pontos como o resto:
              elas travam a nota.
            </p>

            <ul className={styles.lista}>
              {TRAVAS.map((trava) => (
                <li key={trava.id}>{trava.texto}</li>
              ))}
            </ul>
          </section>

          <section className={styles.bloco}>
            <h3 className={styles.titulo}>Faixa e risco</h3>

            <p className={styles.texto}>
              A faixa vem da nota e responde "vale a pena?". O risco vem da
              segurança e responde "tem algo que eu preciso saber antes de
              usar?". Por isso os dois aparecem juntos.
            </p>

            <ul className={styles.faixas}>
              {FAIXAS.map((item, posicao) => (
                <li className={styles.faixa} key={item.faixa}>
                  <RiskBadge
                    level={nivelDaRecomendacao(item.faixa)}
                    label={ROTULO_DA_FAIXA[item.faixa]}
                  />
                  <span className={styles.texto}>{intervalo(posicao)}</span>
                </li>
              ))}
            </ul>
          </section>

          <Button variant="secondary" to="/metodologia">
            Ver a metodologia completa
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default ScoreExplanation;
