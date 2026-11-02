import { AlertCircle, Minus, Plus, X } from "lucide-react";
import MainLayout from "../../components/MainLayout";
import SectionNav from "../../components/SectionNav";
import Button from "../../components/Button";
import Chip from "../../components/Chip";
import ScoreBadge from "../../components/ScoreBadge";
import RiskBadge from "../../components/RiskBadge";
import { NOTAS_DE_QUALIDADE } from "../../utils/notas";
import { useTituloDaPagina } from "../../hooks/useTituloDaPagina";
import styles from "./styles.module.css";

const ETAPAS = [
  {
    id: "leitura",
    numero: "01",
    titulo: "Leitura",
    texto: "A lista de ingredientes é lida e cada nome é identificado.",
  },
  {
    id: "cruzamento",
    numero: "02",
    titulo: "Cruzamento",
    texto: "Cada ingrediente é comparado com as regras e com o seu perfil.",
  },
  {
    id: "efeitos",
    numero: "03",
    titulo: "Efeitos",
    texto: "As regras que se aplicam somam ou descontam pontos.",
  },
  {
    id: "resultado",
    numero: "04",
    titulo: "Resultado",
    texto: "A nota final aparece com os avisos que valem para você.",
  },
];

const EFEITOS = [
  {
    id: "bonificar",
    titulo: "Bonificar",
    texto: "O ingrediente é benéfico para aquele perfil e soma pontos.",
    Icone: Plus,
    tom: styles.effectBonus,
  },
  {
    id: "penalizar",
    titulo: "Penalizar",
    texto: "Não é ideal para aquele perfil e desconta pontos.",
    Icone: Minus,
    tom: styles.effectPenalty,
  },
  {
    id: "informar",
    titulo: "Informar",
    texto: "Não muda a nota, mas aparece na lista de motivos para você saber.",
    Icone: AlertCircle,
    tom: styles.effectWarning,
  },
  {
    id: "bloquear",
    titulo: "Bloquear",
    texto: "Há contraindicação real. A nota vai a zero e o produto fica contraindicado.",
    Icone: X,
    tom: styles.effectBlock,
  },
];

const ORDEM_EXEMPLO = [
  "Aqua",
  "Glycerin",
  "Niacinamide",
  "Panthenol",
  "Tocopherol",
  "Parfum",
  "Limonene",
];

const LIMITES = [
  {
    id: "formula-declarada",
    titulo: "A Venus lê a fórmula declarada, não testa o produto.",
    texto:
      "A análise parte da lista de ingredientes do rótulo, e não de um ensaio de laboratório.",
  },
  {
    id: "concentracao",
    titulo: "A concentração exata não é pública.",
    texto:
      "Os rótulos não informam quanto de cada ingrediente existe, e a nota ainda não estima isso pela ordem da lista.",
  },
  {
    id: "dermatologista",
    titulo: "Não substitui dermatologista.",
    texto:
      "A análise ajuda a decidir uma compra, não a diagnosticar ou tratar uma condição de pele.",
  },
  {
    id: "fora-da-base",
    titulo: "Ingrediente fora da base não é avaliado.",
    texto:
      "Quando a Venus não conhece um ingrediente, ele aparece como não verificado e entra na fila de curadoria.",
  },
  {
    id: "fora-do-rotulo",
    titulo: "Nem tudo sai do rótulo.",
    texto:
      "Embalagem, certificações e características sensoriais vêm de outras fontes, e nem todo produto tem todas elas.",
  },
  {
    id: "preco",
    titulo: "A Venus não mostra preço.",
    texto:
      "A Venus não é loja. O preço muda de loja para loja e não entra na nota.",
  },
  {
    id: "resultado",
    titulo: "A nota não promete resultado.",
    texto:
      "Ela diz o que a fórmula tem e como isso combina com o seu perfil, não como a sua pele ou o seu cabelo vão ficar depois do uso.",
  },
];

function Metodologia() {
  useTituloDaPagina("Metodologia");
  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1>Como a Venus calcula as notas.</h1>

            <p className={styles.subtitle}>
              A gente traduz o rótulo para você saber o que está passando na
              pele.
            </p>
          </div>

          <SectionNav />
        </header>

        <section className={styles.section} aria-labelledby="titulo-partida">
          <p className={styles.eyebrow}>Ponto de partida</p>

          <h2 id="titulo-partida" className={styles.sectionTitle}>
            Quatro notas, e não uma só
          </h2>

          <p className={styles.text}>
            Cada produto recebe quatro notas independentes, porque são perguntas
            diferentes. Juntas, elas formam a qualidade do produto, que é igual
            para todo mundo. O seu perfil entra depois, no cálculo.
          </p>

          <ul className={styles.cards}>
            {NOTAS_DE_QUALIDADE.map((nota) => (
              <li className={styles.card} key={nota.campo}>
                <h3 className={styles.cardTitle}>{nota.rotulo}</h3>
                <p className={styles.cardText}>{nota.descricao}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="titulo-calculo">
          <p className={styles.eyebrow}>O cálculo</p>

          <h2 id="titulo-calculo" className={styles.sectionTitle}>
            Do rótulo até a nota
          </h2>

          <ol className={styles.steps}>
            {ETAPAS.map((etapa) => (
              <li className={styles.step} key={etapa.id}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {etapa.numero}
                </span>
                <h3 className={styles.stepTitle}>{etapa.titulo}</h3>
                <p className={styles.cardText}>{etapa.texto}</p>
              </li>
            ))}
          </ol>

          <p className={styles.text}>
            Uma regra liga um ingrediente a uma característica do perfil e diz
            qual é o efeito. Existem quatro efeitos possíveis.
          </p>

          <ul className={styles.cards}>
            {EFEITOS.map((efeito) => (
              <li className={[styles.card, efeito.tom].join(" ")} key={efeito.id}>
                <efeito.Icone className={styles.effectIcon} aria-hidden="true" />
                <h3 className={styles.effectTitle}>{efeito.titulo}</h3>
                <p className={styles.cardText}>{efeito.texto}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="titulo-prioridade">
          <p className={styles.eyebrow}>Prioridade</p>

          <h2 id="titulo-prioridade" className={styles.sectionTitle}>
            A segurança vem antes de tudo
          </h2>

          <div className={styles.highlight}>
            <h3 className={styles.highlightTitle}>
              Um bônus nunca anula um risco
            </h3>

            <p className={styles.highlightText}>
              Quando um ingrediente é contraindicado para você, ou você tem
              alergia crítica a ele, nenhuma qualidade do produto compensa. A
              nota vai a zero e o produto aparece como contraindicado, mesmo
              que seja excelente em todo o resto. Com alergia alta, a nota fica
              em no máximo 15 e o produto também aparece como contraindicado.
              Alergias médias e leves baixam a nota, sem zerar.
            </p>
          </div>

          <div className={styles.example}>
            <div className={styles.exampleBadges}>
              <ScoreBadge score={0} level="avoid" />
              <RiskBadge level="avoid" label="Contraindicado" />
            </div>

            <p className={styles.cardText}>
              Um creme com retinol pode ter fórmula muito boa e nota alta para a
              maioria das pessoas. Para quem está grávida, ele é bloqueado,
              porque retinoides são contraindicados na gestação.
            </p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="titulo-quantidade">
          <p className={styles.eyebrow}>Detalhe importante</p>

          <h2 id="titulo-quantidade" className={styles.sectionTitle}>
            A ordem da lista também informa
          </h2>

          <p className={styles.text}>
            Pela regra dos rótulos, o que aparece no começo está em maior
            quantidade. A nota da Venus ainda não usa essa ordem: hoje cada
            ingrediente avaliado pesa o mesmo. Use a ordem para ler o rótulo: um
            ingrediente que preocupa no começo merece mais atenção do que no
            fim.
          </p>

          <div className={styles.order}>
            <ol className={styles.orderList}>
              {ORDEM_EXEMPLO.map((ingrediente) => (
                <li key={ingrediente}>
                  <Chip label={ingrediente} />
                </li>
              ))}
            </ol>

            <p className={styles.cardText}>
              Os primeiros ingredientes definem o produto. Os últimos aparecem
              em quantidade pequena.
            </p>
          </div>
        </section>

        <section
          className={styles.section}
          aria-labelledby="titulo-transparencia"
        >
          <p className={styles.eyebrow}>Transparência</p>

          <h2 id="titulo-transparencia" className={styles.sectionTitle}>
            O que a nota não diz
          </h2>

          <p className={styles.text}>
            Tão importante quanto explicar o cálculo é dizer onde ele não
            alcança.
          </p>

          <ul className={styles.limits}>
            {LIMITES.map((limite) => (
              <li className={styles.limit} key={limite.id}>
                <AlertCircle className={styles.limitIcon} aria-hidden="true" />

                <div>
                  <h3 className={styles.limitTitle}>{limite.titulo}</h3>
                  <p className={styles.cardText}>{limite.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.cta} aria-labelledby="titulo-cta">
          <h2 id="titulo-cta" className={styles.ctaTitle}>
            Encontrou um erro?
          </h2>

          <p className={styles.ctaText}>
            Escreva para venussystem2026@gmail.com dizendo qual é o produto e o
            que está errado. Regras clínicas são revisadas por um profissional
            antes de valer.
          </p>

          <Button to="/fontes">Ver as nossas fontes</Button>
        </section>
      </div>
    </MainLayout>
  );
}

export default Metodologia;
