import { useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import MainLayout from "../../components/MainLayout";
import SectionNav from "../../components/SectionNav";
import Button from "../../components/Button";
import styles from "./styles.module.css";

interface Integrante {
  id: string;
  nome: string;
  papel: string;
  github: string;
}

const NOTAS = [
  {
    id: "saude",
    titulo: "Saúde",
    texto:
      "Olha a fórmula em relação à sua pele, às suas condições e ao que você precisa evitar.",
    tom: styles.ruleHealth,
  },
  {
    id: "ambiental",
    titulo: "Impacto ambiental",
    texto:
      "Considera biodegradabilidade, presença de microplásticos e o material da embalagem.",
    tom: styles.ruleEnvironment,
  },
  {
    id: "etica",
    titulo: "Ética",
    texto:
      "Considera a origem dos ingredientes, testes em animais e a transparência da marca.",
    tom: styles.ruleEthics,
  },
];

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
  { id: "integrante-01", nome: "Nome do integrante", papel: "Papel na equipe", github: "" },
  { id: "integrante-02", nome: "Nome do integrante", papel: "Papel na equipe", github: "" },
  { id: "integrante-03", nome: "Nome do integrante", papel: "Papel na equipe", github: "" },
  { id: "integrante-04", nome: "Nome do integrante", papel: "Papel na equipe", github: "" },
  { id: "integrante-05", nome: "Nome do integrante", papel: "Papel na equipe", github: "" },
  { id: "integrante-06", nome: "Nome do integrante", papel: "Papel na equipe", github: "" },
  { id: "integrante-07", nome: "Nome do integrante", papel: "Papel na equipe", github: "" },
  { id: "integrante-08", nome: "Nome do integrante", papel: "Papel na equipe", github: "" },
  { id: "integrante-09", nome: "Nome do integrante", papel: "Papel na equipe", github: "" },
  { id: "integrante-10", nome: "Nome do integrante", papel: "Papel na equipe", github: "" },
  { id: "integrante-11", nome: "Nome do integrante", papel: "Papel na equipe", github: "" },
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

  function conteudoDoIntegrante(pessoa: Integrante) {
    return (
      <>
        {pessoa.github === "" ? (
          <span className={styles.avatar} aria-hidden="true">
            VN
          </span>
        ) : (
          <img
            className={styles.avatar}
            src={`https://github.com/${pessoa.github}.png?size=200`}
            alt=""
            loading="lazy"
          />
        )}

        <span className={styles.memberName}>{pessoa.nome}</span>
        <span className={styles.memberRole}>{pessoa.papel}</span>
      </>
    );
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
            Três notas, porque são três perguntas
          </h2>

          <p className={styles.text}>
            A Venus lê a lista de ingredientes, identifica cada um e cruza com o
            seu perfil. No fim, cada produto recebe três notas independentes.
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
            A Venus nasceu como projeto interdisciplinar do Instituto J&amp;F.
            Estamos em fase de construção, e preferimos dizer isso abertamente a
            passar a impressão de um produto pronto.
          </p>

          <p className={styles.photo}>Espaço reservado para a foto da equipe.</p>

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
              <li className={styles.member} key={pessoa.id}>
                {pessoa.github === "" ? (
                  <div className={styles.memberInner}>
                    {conteudoDoIntegrante(pessoa)}
                  </div>
                ) : (
                  <a
                    className={styles.memberLink}
                    href={`https://github.com/${pessoa.github}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Perfil de ${pessoa.nome} no GitHub, abre em nova aba`}
                  >
                    {conteudoDoIntegrante(pessoa)}
                  </a>
                )}
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
