import { AlertCircle, Minus, Plus, X } from "lucide-react";
import MainLayout from "../../components/MainLayout";
import SectionNav from "../../components/SectionNav";
import Button from "../../components/Button";
import Chip from "../../components/Chip";
import ScoreBadge from "../../components/ScoreBadge";
import RiskBadge from "../../components/RiskBadge";
import styles from "./styles.module.css";

const NOTAS = [
  {
    id: "saude",
    titulo: "Saúde",
    texto:
      "A fórmula combina com a sua pele, com as suas condições e com o que você evita?",
    tom: styles.ruleHealth,
  },
  {
    id: "ambiental",
    titulo: "Impacto ambiental",
    texto: "Biodegradabilidade, microplásticos e o material da embalagem.",
    tom: styles.ruleEnvironment,
  },
  {
    id: "etica",
    titulo: "Ética",
    texto: "Origem dos ingredientes, testes em animais e transparência da marca.",
    tom: styles.ruleEthics,
  },
];

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
    id: "alertar",
    titulo: "Alertar",
    texto: "Merece atenção e gera um aviso visível, além de descontar.",
    Icone: AlertCircle,
    tom: styles.effectWarning,
  },
  {
    id: "bloquear",
    titulo: "Bloquear",
    texto: "Há contraindicação real. O produto é marcado para evitar.",
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
      "Os rótulos não informam quanto de cada ingrediente existe, então trabalhamos com estimativa pela ordem da lista.",
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
];

function Metodologia() {
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
            Três notas, e não uma só
          </h2>

          <p className={styles.text}>
            Cada produto recebe três notas independentes, porque são perguntas
            diferentes.
          </p>

          <ul className={styles.cards}>
            {NOTAS.map((nota) => (
              <li className={styles.card} key={nota.id}>
                <span className={nota.tom} aria-hidden="true" />
                <h3 className={styles.cardTitle}>{nota.titulo}</h3>
                <p className={styles.cardText}>{nota.texto}</p>
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
              Quando existe contraindicação real, nenhuma qualidade do produto
              compensa. A nota é travada num valor baixo e o produto aparece
              como algo a evitar, mesmo que seja excelente em todo o resto.
            </p>
          </div>

          <div className={styles.example}>
            <div className={styles.exampleBadges}>
              <ScoreBadge score={20} level="avoid" />
              <RiskBadge level="avoid" />
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
            A quantidade também conta
          </h2>

          <p className={styles.text}>
            A ordem da lista indica concentração: o que aparece no começo está
            em maior quantidade. Um ingrediente problemático no fim da lista
            pesa menos do que o mesmo ingrediente logo no início.
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
              Quanto mais no início, maior o peso na nota. Os primeiros
              ingredientes definem o produto, os últimos aparecem em quantidade
              pequena.
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
            Toda página de produto tem a opção de reportar. Regras clínicas são
            revisadas por um profissional antes de valer.
          </p>

          <Button to="/fontes">Ver as nossas fontes</Button>
        </section>
      </div>
    </MainLayout>
  );
}

export default Metodologia;
