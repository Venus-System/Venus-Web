import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ErroProdutoNaoEncontrado } from "../../services/erros";
import { buscarAnalisePublica } from "../../services/analises";
import { temFragrancia } from "../../utils/selos";
import type { AnaliseExibicao } from "../../types/analise";
import type {
  Avaliacao,
  Denuncia,
  NovaAvaliacao,
} from "../../types/avaliacao";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import { useAvaliacoes } from "../../hooks/useAvaliacoes";
import { useDenunciarAvaliacao } from "../../hooks/useDenunciarAvaliacao";
import { usePublicarAvaliacao } from "../../hooks/usePublicarAvaliacao";
import Button from "../../components/Button";
import MainLayout from "../../components/MainLayout";
import RatingSummary from "../../components/RatingSummary";
import ReviewCard from "../../components/ReviewCard";
import ReportReviewModal from "../../components/ReportReviewModal";
import ReviewsModal from "../../components/ReviewsModal";
import WriteReviewModal from "../../components/WriteReviewModal";
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

type AcaoDeAvaliacao =
  | { tipo: "escrever" }
  | { tipo: "denunciar"; avaliacao: Avaliacao };

interface ModaisDeAvaliacao {
  todas: boolean;
  acao: AcaoDeAvaliacao | null;
}

const AVALIACOES_NA_PAGINA = 4;

function Produto() {
  const { slug } = useParams<{ slug: string }>();
  const [estado, setEstado] = useState<EstadoProduto>({
    situacao: "carregando",
  });
  const { usuario } = useAutenticacao();
  const navegar = useNavigate();
  const localizacao = useLocation();
  const {
    estado: avaliacoes,
    recarregar: recarregarAvaliacoes,
    atualizar: atualizarAvaliacoes,
  } = useAvaliacoes(slug ?? null);
  const [modais, setModais] = useState<ModaisDeAvaliacao>({
    todas: false,
    acao: null,
  });
  const {
    estado: publicacao,
    publicar,
    limpar: limparPublicacao,
  } = usePublicarAvaliacao();
  const {
    estado: denuncia,
    denunciar,
    limpar: limparDenuncia,
  } = useDenunciarAvaliacao();
  const logado = usuario !== null;

  function exigirLogin() {
    navegar("/login", { state: { de: localizacao.pathname } });
  }

  function abrirEscrita() {
    if (!logado) {
      exigirLogin();
      return;
    }

    limparPublicacao();
    setModais((atual) => ({ ...atual, acao: { tipo: "escrever" } }));
  }

  function fecharAcao() {
    setModais((atual) => ({ ...atual, acao: null }));
  }

  async function enviarAvaliacao(nova: NovaAvaliacao) {
    if (!slug) {
      return;
    }

    const publicou = await publicar(slug, nova);

    if (publicou) {
      fecharAcao();
      atualizarAvaliacoes();
    }
  }

  async function enviarDenuncia(avaliacaoId: string, nova: Denuncia) {
    const enviou = await denunciar(avaliacaoId, nova);

    if (enviou) {
      fecharAcao();
    }
  }

  function abrirDenuncia(avaliacao: Avaliacao) {
    limparDenuncia();
    setModais((atual) => ({
      ...atual,
      acao: { tipo: "denunciar", avaliacao },
    }));
  }

  function abrirTodas() {
    setModais((atual) => ({ ...atual, todas: true }));
  }

  function fecharTodas() {
    setModais((atual) => ({ ...atual, todas: false }));
    atualizarAvaliacoes();
  }

  useEffect(() => {
    if (!slug) {
      return;
    }

    const controle = new AbortController();
    let expirou = false;
    const limite = setTimeout(() => {
      expirou = true;
      controle.abort();
    }, 8000);

    async function carregar(slugAtual: string) {
      setEstado({ situacao: "carregando" });

      try {
        const analise = await buscarAnalisePublica(slugAtual, controle.signal);
        setEstado({ situacao: "sucesso", analise });
      } catch (erro) {
        if (erro instanceof ErroProdutoNaoEncontrado) {
          setEstado({ situacao: "nao-encontrado" });
          return;
        }

        if (erro instanceof DOMException && erro.name === "AbortError") {
          if (expirou) {
            setEstado({
              situacao: "erro",
              mensagem: "A busca demorou demais. Tente novamente",
            });
          }

          return;
        }

        setEstado({
          situacao: "erro",
          mensagem: "Não foi possível carregar este produto.",
        });
      }
    }

    carregar(slug);
    return () => {
      clearTimeout(limite);
      controle.abort();
    };
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
          <Link to="/">Ir para a página inicial</Link>
        </div>
      </MainLayout>
    );
  }

  const { product, ingredients, personalized } = estado.analise;
  const avaliacaoDenunciada =
    modais.acao?.tipo === "denunciar" ? modais.acao.avaliacao : null;

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
              Com um perfil, esta seção mostra como o produto se comporta na sua
              pele. A criação de perfil entra em uma próxima etapa do projeto.
            </p>
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

          {ingredients.length === 0 ? (
            <p className={styles.sectionText}>
              Ainda não temos a lista de ingredientes deste produto.
            </p>
          ) : (
            <ul className={styles.ingredients}>
              {ingredients.map((item) => (
                <li className={styles.ingredient} key={item.id}>
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
          )}
        </section>

        <section className={styles.section} aria-labelledby="titulo-avaliacoes">
          <h2 id="titulo-avaliacoes" className={styles.sectionTitle}>
            Avaliações de usuários
          </h2>

          <p className="texto-oculto" aria-live="polite">
            {avaliacoes.status === "carregando"
              ? "Carregando as avaliações."
              : ""}
            {publicacao.publicada ? "Sua avaliação foi publicada." : ""}
            {denuncia.enviada
              ? "Denúncia enviada. Um moderador vai analisar a avaliação."
              : ""}
          </p>

          {avaliacoes.status === "carregando" ? (
            <p className={styles.sectionText}>Carregando as avaliações...</p>
          ) : null}

          {avaliacoes.status === "erro" ? (
            <div className={styles.reviewsError}>
              <p role="alert">{avaliacoes.mensagem}</p>

              <Button variant="secondary" onClick={recarregarAvaliacoes}>
                Tentar carregar as avaliações de novo
              </Button>
            </div>
          ) : null}

          {avaliacoes.status === "pronto" ? (
            <>
              <div className={styles.reviewsSummary}>
                <RatingSummary summary={avaliacoes.avaliacoes.summary} />

                <Button onClick={abrirEscrita}>Escrever avaliação</Button>
              </div>

              {avaliacoes.avaliacoes.reviews.length === 0 ? null : (
                <ul className={styles.reviewList}>
                  {avaliacoes.avaliacoes.reviews
                    .slice(0, AVALIACOES_NA_PAGINA)
                    .map((avaliacao) => (
                      <li key={`${avaliacao.id}-${avaliacoes.rodada}`}>
                        <ReviewCard
                          review={avaliacao}
                          canInteract={logado}
                          onRequireLogin={exigirLogin}
                          onReport={abrirDenuncia}
                        />
                      </li>
                    ))}
                </ul>
              )}

              {avaliacoes.avaliacoes.reviews.length > AVALIACOES_NA_PAGINA ? (
                <Button
                  variant="secondary"
                  className={styles.allReviews}
                  onClick={abrirTodas}
                >
                  Ver todas as {avaliacoes.avaliacoes.reviews.length}{" "}
                  avaliações
                </Button>
              ) : null}

              <ReviewsModal
                open={modais.todas}
                onClose={fecharTodas}
                data={avaliacoes.avaliacoes}
                canInteract={logado}
                onRequireLogin={exigirLogin}
                onReport={abrirDenuncia}
                onWrite={abrirEscrita}
              />

              <WriteReviewModal
                open={modais.acao?.tipo === "escrever"}
                product={{
                  slug: product.slug,
                  name: product.name,
                  brandName: product.brand.name,
                  imageUrl: product.imageUrl,
                }}
                sending={publicacao.enviando}
                errorMessage={publicacao.erro}
                onSubmit={enviarAvaliacao}
                onClose={fecharAcao}
              />

              {avaliacaoDenunciada === null ? null : (
                <ReportReviewModal
                  open
                  review={avaliacaoDenunciada}
                  sending={denuncia.enviando}
                  errorMessage={denuncia.erro}
                  onSubmit={(nova) =>
                    enviarDenuncia(avaliacaoDenunciada.id, nova)
                  }
                  onClose={fecharAcao}
                />
              )}
            </>
          ) : null}
        </section>
      </div>
    </MainLayout>
  );
}

export default Produto;
