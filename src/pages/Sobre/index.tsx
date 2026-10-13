import { useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import MainLayout from "../../components/MainLayout";
import SectionNav from "../../components/SectionNav";
import Button from "../../components/Button";
import { NOTAS_DE_QUALIDADE } from "../../utils/notas";
import fotoDaEquipeUm from "../../assets/equipe-1.jpg";
import fotoDaEquipeDois from "../../assets/equipe-2.jpg";
import styles from "./styles.module.css";

interface Integrante {
  nome: string;
  github: string;
}

const LIMITES = [
  {
    id: "marca-nao-compra-nota",
    titulo: "Marca não compra nota",
    texto:
      "Nenhuma marca paga para melhorar a avaliação de um produto. A nota vem das regras, e as regras têm fonte.",
  },
  {
    id: "dados-nao-sao-vendidos",
    titulo: "Seus dados não são vendidos",
    texto:
      "O que você responde no perfil serve para personalizar a análise, e não vai para marcas nem anunciantes.",
  },
  {
    id: "seguranca-nao-e-plano-pago",
    titulo: "Segurança não é plano pago",
    texto:
      "Avisar que um produto pode te fazer mal é obrigação, não recurso premium. Esse alerta é sempre gratuito.",
  },
  {
    id: "nao-inventamos-dado",
    titulo: "Não inventamos dado",
    texto:
      "Quando um ingrediente não está na base, ele aparece como não verificado, e nunca como aprovado.",
  },
];

const EQUIPE: Integrante[] = [
  { nome: "Matheus Orestes", github: "matheus-orestes" },
  { nome: "Rafael Lopes", github: "rafasepol" },
  { nome: "Sophia Castro", github: "Shhiaa" },
  { nome: "Laura Gonçalves", github: "Laura-986" },
  { nome: "Felipe Augusto", github: "FelipeAugustoSan" },
  { nome: "Akira Komati", github: "Akira-132" },
  { nome: "Bianca Bazoni", github: "starbias" },
  { nome: "Bruno Vinicius", github: "brunorisadas" },
  { nome: "Miguel Oliveira", github: "miguelh19max" },
  { nome: "Sarah Delatorre", github: "sarahdelatorre" },
  { nome: "Gustavo Herance", github: "GAHerance" },
];

const NO_FRASCO =
  "Aqua, Glycerin, Niacinamide, Parfum, Retinol, Phenoxyethanol, Tocopherol, Lanolin";

const TRADUCAO = [
  { id: "niacinamide", texto: "Niacinamida, boa para controlar oleosidade" },
  { id: "parfum", texto: "Fragrância, pode irritar pele sensível" },
  { id: "retinol", texto: "Retinol, contraindicado na gestação" },
  { id: "lanolin", texto: "Lanolina, está nas suas alergias" },
];

function Sobre() {
  const trilhaRef = useRef<HTMLUListElement>(null);

  function rolar(direcao: number) {
    const trilha = trilhaRef.current;

    if (!trilha) {
      return;
    }

    trilha.scrollBy({
      left: trilha.clientWidth * 0.8 * direcao,
      behavior: "smooth",
    });
  }

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>
              Por que a <span>Venus</span> existe.
            </h1>

            <p className={styles.subtitle}>
              A gente traduz o rótulo para você saber o que está passando na
              pele.
            </p>
          </div>

          <SectionNav />
        </header>

        <section className={styles.section} aria-labelledby="titulo-problema">
          <p className={styles.eyebrow}>O problema</p>

          <h2 id="titulo-problema" className={styles.sectionTitle}>
            O rótulo é escrito para quem fabrica
          </h2>

          <p className={styles.text}>
            A lista de ingredientes segue uma nomenclatura técnica
            internacional, a mesma no mundo inteiro. Isso é ótimo para quem
            produz e péssimo para quem compra, porque quase ninguém fora da área
            consegue ler.
          </p>

          <p className={styles.text}>
            O resultado é que decisões importantes acabam sendo tomadas no
            escuro. Quem tem alergia não sabe se o produto tem o ingrediente que
            precisa evitar. Quem está grávida não sabe se aquele ativo é
            contraindicado.
          </p>

          <div className={styles.compare}>
            <div className={styles.compareCard}>
              <h3 className={styles.compareTitle}>O que está no frasco</h3>
              <p className={styles.compareList}>{NO_FRASCO}</p>
            </div>

            <ArrowRight className={styles.compareArrow} aria-hidden="true" />

            <div className={styles.compareCardVenus}>
              <h3 className={styles.compareTitleVenus}>O que a Venus mostra</h3>

              <ul className={styles.compareItems}>
                {TRADUCAO.map((item) => (
                  <li key={item.id}>{item.texto}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="titulo-notas">
          <p className={styles.eyebrow}>O que a Venus faz</p>

          <h2 id="titulo-notas" className={styles.sectionTitle}>
            Quatro notas, porque são quatro perguntas
          </h2>

          <p className={styles.text}>
            A Venus lê a lista de ingredientes, identifica cada um e cruza com o
            seu perfil. No fim, cada produto recebe quatro notas independentes.
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

        <section className={styles.section} aria-labelledby="titulo-limites">
          <p className={styles.eyebrow}>Nossos limites</p>

          <h2 id="titulo-limites" className={styles.sectionTitle}>
            No que a gente não mexe
          </h2>

          <ul className={styles.limits}>
            {LIMITES.map((limite) => (
              <li className={styles.limit} key={limite.id}>
                <X className={styles.limitIcon} aria-hidden="true" />

                <div>
                  <h3 className={styles.cardTitle}>{limite.titulo}</h3>
                  <p className={styles.cardText}>{limite.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="titulo-equipe">
          <p className={styles.eyebrow}>Quem faz</p>

          <h2 id="titulo-equipe" className={styles.sectionTitle}>
            Um projeto de estudantes
          </h2>

          <p className={styles.text}>
            A Venus nasceu como projeto interdisciplinar do Instituto J&amp;F e
            é feita por onze estudantes. Cada nome leva ao perfil da pessoa no
            GitHub.
          </p>

          <div className={styles.photos}>
            <img
              className={styles.photo}
              src={fotoDaEquipeUm}
              alt="Cinco integrantes da equipe da Venus, lado a lado, com o uniforme preto do Instituto J&F."
              width={1200}
              height={675}
              loading="lazy"
            />

            <img
              className={styles.photo}
              src={fotoDaEquipeDois}
              alt="Seis integrantes da equipe da Venus, abraçados, com o uniforme preto do Instituto J&F."
              width={1200}
              height={675}
              loading="lazy"
            />
          </div>

          <div className={styles.carouselHeader}>
            <h3 className={styles.cardTitle}>Integrantes</h3>

            <div className={styles.carouselControls}>
              <Button
                variant="secondary"
                onClick={() => rolar(-1)}
                aria-label="Ver integrantes anteriores"
              >
                <ChevronLeft aria-hidden="true" />
              </Button>

              <Button
                variant="secondary"
                onClick={() => rolar(1)}
                aria-label="Ver próximos integrantes"
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          </div>

          <ul
            className={styles.track}
            ref={trilhaRef}
            tabIndex={0}
            aria-label="Integrantes da equipe"
          >
            {EQUIPE.map((pessoa) => (
              <li className={styles.member} key={pessoa.github}>
                <a
                  className={styles.memberLink}
                  href={`https://github.com/${pessoa.github}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Perfil de ${pessoa.nome} no GitHub, abre em nova aba`}
                >
                  <img
                    className={styles.avatar}
                    src={`https://github.com/${pessoa.github}.png?size=200`}
                    alt=""
                    loading="lazy"
                  />

                  <span className={styles.memberName}>{pessoa.nome}</span>
                  <span className={styles.memberHandle}>@{pessoa.github}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.cta} aria-labelledby="titulo-cta">
          <h2 id="titulo-cta" className={styles.ctaTitle}>
            Quer ver como a conta é feita?
          </h2>

          <p className={styles.ctaText}>
            A página de metodologia explica de onde sai cada nota, incluindo o
            que ela não consegue dizer.
          </p>

          <Button to="/metodologia">Ver a metodologia</Button>
        </section>
      </div>
    </MainLayout>
  );
}

export default Sobre;
