import { AlertCircle } from "lucide-react";
import MainLayout from "../../components/MainLayout";
import SectionNav from "../../components/SectionNav";
import Button from "../../components/Button";
import Chip from "../../components/Chip";
import styles from "./styles.module.css";

interface Fonte {
  id: string;
  titulo: string;
  texto: string;
  origem: string;
  revisada?: boolean;
}

interface Grupo {
  id: string;
  rotulo: string;
  titulo: string;
  fontes: Fonte[];
}

const GRUPOS: Grupo[] = [
  {
    id: "ingredientes",
    rotulo: "Ingredientes",
    titulo: "Identificação e propriedades",
    fontes: [
      {
        id: "nomenclatura",
        titulo: "Nomenclatura internacional",
        texto:
          "Todo ingrediente é identificado pelo nome oficial usado nos rótulos do mundo inteiro. É isso que permite reconhecer a mesma substância em produtos de marcas e países diferentes.",
        origem: "Bases públicas de referência de ingredientes cosméticos",
      },
      {
        id: "propriedades",
        titulo: "Propriedades e comportamento",
        texto:
          "Função no produto, potencial de irritação, tendência a obstruir poros e biodegradabilidade vêm de literatura técnica e de bases de referência, complementadas por curadoria da nossa equipe.",
        origem: "Literatura dermatológica e bases técnicas de referência",
      },
    ],
  },
  {
    id: "regulacao",
    rotulo: "Regulação",
    titulo: "O que a lei restringe",
    fontes: [
      {
        id: "anvisa",
        titulo: "Regulação brasileira e internacional",
        texto:
          "Ingredientes proibidos, restritos ou com limite de concentração seguem a regulação aplicável. Quando uma norma muda, a regra correspondente é revisada.",
        origem:
          "ANVISA no Brasil, e referências internacionais para produtos importados",
      },
    ],
  },
  {
    id: "saude",
    rotulo: "Saúde",
    titulo: "Regras que passam por revisão",
    fontes: [
      {
        id: "clinicas",
        titulo: "Gestação, medicamentos e condições de pele",
        texto:
          "As regras que envolvem risco à saúde não entram em vigor sem revisão de um profissional. Nenhuma regra clínica é publicada apenas com base em pesquisa nossa.",
        origem:
          "Revisão dermatológica, apoiada em literatura e sociedades médicas",
        revisada: true,
      },
    ],
  },
  {
    id: "comunidade",
    rotulo: "Comunidade",
    titulo: "O que vem de quem usa",
    fontes: [
      {
        id: "envios",
        titulo: "Produtos e correções enviados por usuários",
        texto:
          "Boa parte do catálogo brasileiro cresce com a contribuição de quem usa a Venus. Produtos novos, correções e avaliações passam por curadoria antes de entrar no catálogo.",
        origem: "Comunidade Venus, com revisão da nossa equipe",
      },
    ],
  },
];

function Fontes() {
  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1>De onde vêm os nossos dados.</h1>

            <p className={styles.subtitle}>
              Cada regra que gera uma nota tem uma origem. Aqui está de onde vem
              cada tipo de informação.
            </p>
          </div>

          <SectionNav />
        </header>

        {GRUPOS.map((grupo) => (
          <section
            className={styles.section}
            key={grupo.id}
            aria-labelledby={`titulo-${grupo.id}`}
          >
            <p className={styles.eyebrow}>{grupo.rotulo}</p>

            <h2 id={`titulo-${grupo.id}`} className={styles.sectionTitle}>
              {grupo.titulo}
            </h2>

            <ul className={styles.cards}>
              {grupo.fontes.map((fonte) => (
                <li className={styles.card} key={fonte.id}>
                  {fonte.revisada ? (
                    <Chip label="Revisão profissional" level="safe" />
                  ) : null}

                  <h3 className={styles.cardTitle}>{fonte.titulo}</h3>

                  <p className={styles.cardText}>{fonte.texto}</p>

                  <p className={styles.source}>
                    <span className={styles.sourceLabel}>Fonte: </span>
                    {fonte.origem}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className={styles.section} aria-labelledby="titulo-limites">
          <p className={styles.eyebrow}>Limites</p>

          <h2 id="titulo-limites" className={styles.sectionTitle}>
            O que ainda não temos
          </h2>

          <p className={styles.text}>
            Alguns dados não saem da lista de ingredientes e dependem de fontes
            paralelas, que nem todo produto tem. É o caso das informações de
            embalagem, das certificações e das características sensoriais, como
            cheiro e textura.
          </p>

          <div className={styles.notice}>
            <AlertCircle className={styles.noticeIcon} aria-hidden="true" />

            <p className={styles.noticeText}>
              A base de ingredientes é revisada periodicamente para acompanhar
              mudanças de regulação e novas evidências. Se você encontrar uma
              informação desatualizada, pode reportar pela página do produto.
            </p>
          </div>
        </section>

        <section className={styles.cta} aria-labelledby="titulo-cta">
          <h2 id="titulo-cta" className={styles.ctaTitle}>
            Quer entender o cálculo?
          </h2>

          <p className={styles.ctaText}>
            A página de metodologia mostra como essas fontes viram regras, e
            como as regras viram nota.
          </p>

          <Button to="/metodologia">Ver a metodologia</Button>
        </section>
      </div>
    </MainLayout>
  );
}

export default Fontes;
