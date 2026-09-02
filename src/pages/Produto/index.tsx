import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErroProdutoNaoEncontrado } from "../../services/produtos";
import { buscarAnalisePublica } from "../../services/analises";
import type { AnaliseExibicao } from "../../types/analise";
import type { IngredienteAvaliado } from "../../types/ingrediente";
import MainLayout from "../../components/MainLayout";
import ScoreBadge from "../../components/ScoreBadge";
import ScoreBars from "../../components/ScoreBars";
import Chip from "../../components/Chip";
import RiskBadge from "../../components/RiskBadge";
import styles from "./styles.module.css";

type EstadoProduto =
  | { situacao: "carregando" }
  | { situacao: "sucesso"; analise: AnaliseExibicao }
  | { situacao: "nao-encontrado" }
  | { situacao: "erro"; mensagem: string };

const NOMES_DE_FRAGRANCIA = ["parfum", "fragrance", "aroma"];

function temFragrancia(ingredientes: IngredienteAvaliado[]): boolean {
  return ingredientes.some((item) =>
    NOMES_DE_FRAGRANCIA.includes(item.inciName.toLowerCase()),
  );
}

function Produto() {
  const { slug } = useParams<{ slug: string }>();
  const [estado, setEstado] = useState<EstadoProduto>({
    situacao: "carregando",
  });

  useEffect(() => {
    if (!slug) {
      return;
    }

    async function carregar(slugAtual: string) {
      setEstado({ situacao: "carregando" });

      try {
        const analise = await buscarAnalisePublica(slugAtual);
        setEstado({ situacao: "sucesso", analise });
      } catch (erro) {
        if (erro instanceof ErroProdutoNaoEncontrado) {
          setEstado({ situacao: "nao-encontrado" });
          return;
        }

        setEstado({
          situacao: "erro",
          mensagem: "Não foi possível carregar este produto.",
        });
      }
    }

    carregar(slug);
  }, [slug]);

  if (!slug) {
    return (
      <MainLayout>
        <div className={styles.state}>
          <p role="alert">Endereço inválido: nenhum produto informado.</p>
        </div>
      </MainLayout>
    );
  }

  if (estado.situacao === "carregando") {
    return (
      <MainLayout>
        <div className={styles.state}>
          <p aria-live="polite">Carregando a análise do produto...</p>
        </div>
      </MainLayout>
    );
  }

  if (estado.situacao === "erro") {
    return (
      <MainLayout>
        <div className={styles.state}>
          <p role="alert">{estado.mensagem}</p>
        </div>
      </MainLayout>
    );
  }

  if (estado.situacao === "nao-encontrado") {
    return (
      <MainLayout>
        <div className={styles.state}>
          <h1 className={styles.title}>Produto não encontrado</h1>
          <p role="alert">Não temos nenhum produto com o endereço "{slug}".</p>
          <Link to="/">Voltar para a busca</Link>
        </div>
      </MainLayout>
    );
  }

  const { product, ingredients, personalized } = estado.analise;

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.frame}>
            {product.imageUrl ? (
              <img
                className={styles.image}
                src={product.imageUrl}
                alt={`Embalagem de ${product.name}`}
              />
            ) : (
              <span className={styles.placeholder} aria-hidden="true">
                {product.brand.name.charAt(0)}
              </span>
            )}
          </div>

          <div className={styles.heroInfo}>
            <p className={styles.eyebrow}>
              {product.brand.name} · {product.category}
            </p>

            <h1 className={styles.title}>{product.name}</h1>

            <div className={styles.scoreRow}>
              <ScoreBadge
                score={product.scores.overallScore}
                level={product.level}
              />
              <p className={styles.scoreCaption}>
                Avaliação geral da Venus, de 0 a 100.
              </p>
            </div>

            <ScoreBars notas={product.scores} />

            <div className={styles.chips}>
              {product.brand.hasCrueltyFreeClaim ? (
                <Chip label="Cruelty-free" />
              ) : null}
              {product.brand.hasVeganClaim ? <Chip label="Vegano" /> : null}
              {temFragrancia(ingredients) ? (
                <Chip label="Contém fragrância" level="warning" />
              ) : null}
            </div>
          </div>
        </header>

        {personalized === null ? (
          <section className={styles.card} aria-labelledby="titulo-perfil">
            <h2 id="titulo-perfil" className={styles.cardTitle}>
              Esta é a avaliação geral
            </h2>
            <p className={styles.cardText}>
              Crie seu perfil para ver como este produto se comporta na sua
              pele.
            </p>
            <Link className={styles.cardLink} to="/">
              Criar meu perfil
            </Link>
          </section>
        ) : (
          <section className={styles.card} aria-labelledby="titulo-perfil">
            <h2 id="titulo-perfil" className={styles.cardTitle}>
              Para você
            </h2>
            <p className={styles.cardText}>{personalized.summary}</p>
          </section>
        )}

        <section
          className={styles.section}
          aria-labelledby="titulo-ingredientes"
        >
          <p className={styles.eyebrow}>Ingredientes</p>

          <h2 id="titulo-ingredientes" className={styles.sectionTitle}>
            Um rótulo, cada item explicado
          </h2>

          <p className={styles.sectionText}>
            Cada ingrediente classificado pelo semáforo Venus: verde é aprovado,
            âmbar pede atenção e vermelho é melhor evitar.
          </p>

          <ul className={styles.ingredients}>
            {ingredients.map((item) => (
              <li className={styles.ingredient} key={item.inciName}>
                <h3 className={styles.ingredientName}>
                  {item.ingredient?.commonName ?? item.inciName}
                </h3>

                <div className={styles.ingredientRow}>
                  <RiskBadge level={item.level} />

                  <p className={styles.ingredientText}>
                    {item.ingredient?.functionSummary ??
                      "Ainda não temos informação verificada sobre este ingrediente."}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="titulo-avaliacoes">
          <h2 id="titulo-avaliacoes" className={styles.sectionTitle}>
            Avaliações de usuários
          </h2>

          <button
            type="button"
            className={styles.reviewButton}
            aria-disabled="true"
            aria-describedby="aviso-avaliacoes"
          >
            Escrever avaliação
          </button>

          <p id="aviso-avaliacoes" className={styles.sectionText}>
            As avaliações de usuários entram em uma próxima etapa do projeto.
          </p>
        </section>
      </div>
    </MainLayout>
  );
}

export default Produto;
