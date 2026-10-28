import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftRight } from "lucide-react";
import { temFragrancia } from "../../utils/selos";
import { ehAlertaPessoal, ordenarPorDestaque } from "../../utils/alertas";
import {
  ROTULO_DA_FAIXA,
  ROTULO_DO_RISCO,
  nivelDaRecomendacao,
  nivelDoRisco,
} from "../../utils/niveis";
import type {
  Avaliacao,
  Denuncia,
  NovaAvaliacao,
} from "../../types/avaliacao";
import { useAnaliseDoProduto } from "../../hooks/useAnaliseDoProduto";
import { useAnalisePessoal } from "../../hooks/useAnalisePessoal";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import { useAvaliacoes } from "../../hooks/useAvaliacoes";
import { useDenunciarAvaliacao } from "../../hooks/useDenunciarAvaliacao";
import { usePublicarAvaliacao } from "../../hooks/usePublicarAvaliacao";
import BackButton from "../../components/BackButton";
import Button from "../../components/Button";
import FavoriteButton from "../../components/FavoriteButton";
import MainLayout from "../../components/MainLayout";
import ProductFavorite from "../../components/ProductFavorite";
import RatingSummary from "../../components/RatingSummary";
import ReviewCard from "../../components/ReviewCard";
import ReportReviewModal from "../../components/ReportReviewModal";
import ReviewsModal from "../../components/ReviewsModal";
import WriteReviewModal from "../../components/WriteReviewModal";
import BigScore from "../../components/BigScore";
import ScoreBars from "../../components/ScoreBars";
import ScoreExplanation from "../../components/ScoreExplanation";
import Chip from "../../components/Chip";
import IngredientCard from "../../components/IngredientCard";
import IngredientsModal from "../../components/IngredientsModal";
import PersonalAnalysis from "../../components/PersonalAnalysis";
import RiskBadge from "../../components/RiskBadge";
import RiskLegend from "../../components/RiskLegend";
import { useTituloDaPagina } from "../../hooks/useTituloDaPagina";
import styles from "./styles.module.css";

type AcaoDeAvaliacao =
  | { tipo: "escrever" }
  | { tipo: "denunciar"; avaliacao: Avaliacao };

interface ModaisDoProduto {
  ingredientes: boolean;
  todas: boolean;
  acao: AcaoDeAvaliacao | null;
}

const AVALIACOES_NA_PAGINA = 4;
const INGREDIENTES_NA_PAGINA = 3;

function Produto() {
  const { slug } = useParams<{ slug: string }>();
  const estado = useAnaliseDoProduto(slug);
  const carregado = estado.situacao === "sucesso" ? estado.analise : null;
  const titulo =
    carregado?.product.name ??
    (estado.situacao === "nao-encontrado" ? "Produto não encontrado" : "Produto");
  const { usuario, carregando: carregandoConta } = useAutenticacao();
  const navegar = useNavigate();
  const localizacao = useLocation();
  useTituloDaPagina(titulo);
  const {
    estado: avaliacoes,
    recarregar: recarregarAvaliacoes,
    atualizar: atualizarAvaliacoes,
  } = useAvaliacoes(
    carregado?.product.slug ?? null,
    carregado?.versionId ?? null,
  );
  const [modais, setModais] = useState<ModaisDoProduto>({
    ingredientes: false,
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
  const {
    estado: analisePessoal,
    tentarDeNovo: tentarAnaliseDeNovo,
    recalcular,
  } = useAnalisePessoal(
    carregado?.product.slug ?? null,
    carregado?.versionId ?? null,
  );

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

  function abrirIngredientes() {
    setModais((atual) => ({ ...atual, ingredientes: true }));
  }

  function fecharIngredientes() {
    setModais((atual) => ({ ...atual, ingredientes: false }));
  }

  function abrirTodas() {
    setModais((atual) => ({ ...atual, todas: true }));
    atualizarAvaliacoes();
  }

  function fecharTodas() {
    setModais((atual) => ({ ...atual, todas: false }));
    atualizarAvaliacoes();
  }

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

  const { product, ingredients } = estado.analise;
  const avaliacaoDenunciada =
    modais.acao?.tipo === "denunciar" ? modais.acao.avaliacao : null;
  const pessoal =
    analisePessoal.status === "pronta" ? analisePessoal.analise : null;
  const alertas =
    pessoal === null
      ? []
      : pessoal.reasons.filter((motivo) => motivo.warning);
  const nomesEmAlerta = alertas.flatMap((motivo) => motivo.ingredientNames);

  let favorito: ReactNode = null;

  if (logado) {
    favorito = <ProductFavorite slug={product.slug} name={product.name} />;
  } else if (!carregandoConta) {
    favorito = (
      <FavoriteButton
        productName={product.name}
        isFavorite={false}
        isPending={false}
        onToggle={exigirLogin}
      />
    );
  }

  return (
    <MainLayout chatProductName={product.name}>
      <div className={styles.page}>
        <div className={styles.voltar}>
          <BackButton fallback="/pesquisa" />
        </div>

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

            {pessoal === null ? (
              <div className={styles.scoreRow}>
                <BigScore score={product.scores.overallScore} />
                <p className={styles.scoreCaption}>
                  Avaliação geral da Venus, de 0 a 100. É a mesma para todo
                  mundo.
                </p>
              </div>
            ) : (
              <div className={styles.scoreRow}>
                <BigScore score={pessoal.finalScore} />

                <div className={styles.veredito}>
                  <div className={styles.chips}>
                    <RiskBadge
                      level={nivelDaRecomendacao(pessoal.recommendationLevel)}
                      label={ROTULO_DA_FAIXA[pessoal.recommendationLevel]}
                    />
                    <RiskBadge
                      level={nivelDoRisco(pessoal.riskLevel)}
                      label={ROTULO_DO_RISCO[pessoal.riskLevel]}
                    />
                  </div>

                  <p className={styles.scoreCaption}>
                    Nota cruzada com o seu perfil, de 0 a 100
                    {alertas.length === 0
                      ? "."
                      : alertas.length === 1
                        ? ", com 1 alerta."
                        : `, com ${alertas.length} alertas.`}
                  </p>
                </div>
              </div>
            )}

            {analisePessoal.status === "sem-conta" ? (
              <div className={styles.convite}>
                <p className={styles.conviteTexto}>
                  <strong>Quer a nota para a sua pele?</strong> Com um perfil, a
                  Venus cruza esta fórmula com a sua pele, as suas alergias e as
                  suas preferências. É opcional: a avaliação geral continua
                  aqui.
                </p>

                <div className={styles.conviteAcoes}>
                  <Button to="/criar-conta">Criar perfil</Button>
                  <Button
                    variant="text"
                    to="/login"
                    state={{ de: localizacao.pathname }}
                  >
                    Já tenho conta
                  </Button>
                </div>
              </div>
            ) : null}

            {analisePessoal.status === "sem-perfil" ? (
              <div className={styles.convite}>
                <p className={styles.conviteTexto}>
                  <strong>Quer a nota para a sua pele?</strong> Responda o
                  questionário e a Venus cruza esta fórmula com a sua pele, as
                  suas alergias e as suas preferências. É opcional: a avaliação
                  geral continua aqui.
                </p>

                <div className={styles.conviteAcoes}>
                  <Button to="/perguntas">Responder o questionário</Button>
                </div>
              </div>
            ) : null}

            <ScoreBars
              notas={pessoal === null ? product.scores : pessoal.breakdown}
            />

            <ScoreExplanation breakdown={pessoal?.breakdown} />

            <div className={styles.chips}>
              {product.brand.hasCrueltyFreeClaim ? (
                <Chip label="Cruelty-free" />
              ) : null}
              {product.brand.hasVeganClaim ? <Chip label="Vegano" /> : null}
              {temFragrancia(ingredients) ? (
                <Chip label="Contém fragrância" level="warning" />
              ) : null}
            </div>

            <div className={styles.acoes}>
              <Button variant="secondary" to={`/comparar?a=${product.slug}`}>
                <ArrowLeftRight
                  className={styles.acaoIcone}
                  aria-hidden="true"
                />
                Comparar com outro produto
              </Button>

              {favorito}
            </div>
          </div>
        </header>

        <PersonalAnalysis
          state={analisePessoal}
          firstName={usuario?.name.split(" ")[0] ?? ""}
          onRetry={tentarAnaliseDeNovo}
          onRecalculate={recalcular}
        />

        <section
          className={styles.section}
          aria-labelledby="titulo-ingredientes"
        >
          <p className={styles.eyebrow}>Ingredientes</p>

          <h2 id="titulo-ingredientes" className={styles.sectionTitle}>
            Um rótulo, cada item explicado
          </h2>

          <p className={styles.sectionText}>
            Cada ingrediente classificado pelo semáforo Venus. A fragrância e o
            que é alerta para o seu perfil aparecem primeiro.
          </p>

          <RiskLegend label="Legenda do semáforo" />

          {ingredients.length === 0 ? (
            <p className={styles.sectionText}>
              Não temos a lista de ingredientes deste produto.
            </p>
          ) : (
            <>
              <ul className={styles.ingredients}>
                {ordenarPorDestaque(ingredients, nomesEmAlerta)
                  .slice(0, INGREDIENTES_NA_PAGINA)
                  .map((item) => (
                    <li key={item.id}>
                      <IngredientCard
                        item={item}
                        note={
                          ehAlertaPessoal(item, nomesEmAlerta)
                            ? "Alerta para o seu perfil"
                            : undefined
                        }
                      />
                    </li>
                  ))}
              </ul>

              {ingredients.length > INGREDIENTES_NA_PAGINA ? (
                <Button
                  variant="secondary"
                  className={styles.seeAll}
                  onClick={abrirIngredientes}
                >
                  Ver todos os {ingredients.length} ingredientes
                </Button>
              ) : null}

              <IngredientsModal
                open={modais.ingredientes}
                onClose={fecharIngredientes}
                ingredients={ingredients}
                alertNames={nomesEmAlerta}
              />
            </>
          )}
        </section>

        <section className={styles.section} aria-labelledby="titulo-avaliacoes">
          <p className={styles.eyebrow}>Quem usou</p>

          <h2 id="titulo-avaliacoes" className={styles.sectionTitle}>
            Avaliações de usuários
          </h2>

          <p className={styles.sectionText}>
            A experiência de outras pessoas com o produto. Elas não entram na
            nota da Venus, que vem só da fórmula.
          </p>

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
                  className={styles.seeAll}
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
