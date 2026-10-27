import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Button from "../../components/Button";
import MainLayout from "../../components/MainLayout";
import ProductRow from "../../components/ProductRow";
import ScoreBars from "../../components/ScoreBars";
import ScoreExplanation from "../../components/ScoreExplanation";
import ScoreRing from "../../components/ScoreRing";
import StatCard from "../../components/StatCard";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import { usePainel } from "../../hooks/usePainel";
import type { ContagemPorPeriodo, Painel } from "../../types/painel";
import { nivelDaNota, nivelDaRecomendacao } from "../../utils/niveis";
import { useTituloDaPagina } from "../../hooks/useTituloDaPagina";
import styles from "./styles.module.css";

const FORMATO_MES = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

function saudacao(): string {
  const hora = new Date().getHours();

  if (hora < 12) {
    return "Bom dia";
  }

  if (hora < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
}

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? "";
}

function plural(quantidade: number, singular: string, plural: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}

function valorDaContagem(contagem: ContagemPorPeriodo): string {
  return contagem.truncated ? `${contagem.total}+` : String(contagem.total);
}

function rotuloDaContagem(contagem: ContagemPorPeriodo): string {
  return contagem.truncated
    ? `mais de ${contagem.total}`
    : String(contagem.total);
}

function tendencia(contagem: ContagemPorPeriodo): string | undefined {
  return contagem.thisMonth > 0 ? `${contagem.thisMonth} este mês` : undefined;
}

function desdeQuando(painel: Painel): string {
  if (painel.firstAnalysisAt !== null) {
    return `Desde ${FORMATO_MES.format(new Date(painel.firstAnalysisAt))}`;
  }

  return painel.analyses.total === 0
    ? "Nenhuma análise ainda"
    : "Suas análises na Venus";
}

function descricaoDaMedia(produtos: number): string {
  if (produtos === 0) {
    return "Nenhum produto analisado ainda";
  }

  if (produtos === 1) {
    return "Média do produto analisado";
  }

  return `Média dos ${produtos} produtos analisados`;
}

function resumoDoTopo(painel: Painel): string {
  if (painel.summary.averageScore === null) {
    return "Analise um produto para ver aqui como ele combina com você.";
  }

  return `A nota média das suas análises é ${painel.summary.averageScore}. Veja o que está puxando pra cima e o que dá pra melhorar.`;
}

function Dashboard() {
  useTituloDaPagina("Dashboard");
  const { usuario } = useAutenticacao();
  const { estado, recarregar } = usePainel();
  const nome = primeiroNome(usuario?.name ?? "");

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            {saudacao()}
            {nome === "" ? "." : ", "}
            {nome === "" ? null : <span className={styles.name}>{nome}.</span>}
          </h1>

          {estado.status === "pronto" ? (
            <p className={styles.subtitle}>{resumoDoTopo(estado.dados)}</p>
          ) : null}
        </header>

        <p className="texto-oculto" aria-live="polite">
          {estado.status === "carregando" ? "Carregando o seu painel." : ""}
        </p>

        {estado.status === "carregando" ? (
          <p className={styles.estado}>Carregando o seu painel...</p>
        ) : null}

        {estado.status === "erro" ? (
          <div className={styles.erro}>
            <p role="alert">{estado.mensagem}</p>

            <Button variant="secondary" onClick={recarregar}>
              Tentar de novo
            </Button>
          </div>
        ) : null}

        {estado.status === "pronto" ? (
          <>
            <section className={styles.stats} aria-label="Seus números">
              <StatCard
                label="Análises feitas"
                value={valorDaContagem(estado.dados.analyses)}
                valueLabel={rotuloDaContagem(estado.dados.analyses)}
                description={desdeQuando(estado.dados)}
                trend={tendencia(estado.dados.analyses)}
              />

              <StatCard
                label="Nota média"
                value={
                  estado.dados.summary.averageScore === null
                    ? "—"
                    : String(estado.dados.summary.averageScore)
                }
                suffix={
                  estado.dados.summary.averageScore === null
                    ? undefined
                    : "/100"
                }
                valueLabel={
                  estado.dados.summary.averageScore === null
                    ? "sem nota"
                    : `${estado.dados.summary.averageScore} de 100`
                }
                description={descricaoDaMedia(
                  estado.dados.summary.productCount,
                )}
              />

              <StatCard
                label="Alertas no seu perfil"
                value={valorDaContagem(estado.dados.alerts)}
                valueLabel={rotuloDaContagem(estado.dados.alerts)}
                description="Contraindicados para você"
                trend={tendencia(estado.dados.alerts)}
              />

              <StatCard
                label="Favoritos"
                value={String(estado.dados.favoriteCount)}
                description="Os produtos que você guardou"
              >
                <Link to="/favoritos" className={styles.verTudo}>
                  Ver favoritos
                  <ArrowRight className={styles.icone} aria-hidden="true" />
                </Link>
              </StatCard>
            </section>

            <div className={styles.linha}>
              <section
                className={styles.cartao}
                aria-labelledby="titulo-saude"
              >
                <h2 id="titulo-saude" className={styles.cartaoTitulo}>
                  Saúde das suas análises
                </h2>
                <p className={styles.cartaoSub}>
                  Média das quatro notas nos produtos que você analisou.
                </p>

                <ScoreExplanation />

                {estado.dados.summary.productCount === 0 ? (
                  <p className={styles.vazio}>
                    Quando você analisar um produto, as quatro notas dele
                    aparecem aqui.
                  </p>
                ) : (
                  <div className={styles.saude}>
                    <ScoreRing
                      score={estado.dados.summary.averageScore}
                      level={nivelDaNota(estado.dados.summary.averageScore)}
                      label="Nota média"
                    />

                    <div className={styles.barras}>
                      <ScoreBars notas={estado.dados.summary} />
                    </div>

                    <ul className={styles.legenda}>
                      <li className={styles.aprovados}>
                        {plural(
                          estado.dados.summary.approved,
                          "produto aprovado",
                          "produtos aprovados",
                        )}
                      </li>
                      <li className={styles.atencao}>
                        {estado.dados.summary.warning} com atenção
                      </li>
                      <li className={styles.substituir}>
                        {estado.dados.summary.replace} para substituir
                      </li>
                    </ul>
                  </div>
                )}
              </section>

              <section
                className={styles.perfil}
                aria-labelledby="titulo-perfil"
              >
                <h2 id="titulo-perfil" className={styles.perfilTitulo}>
                  Seu perfil Venus
                </h2>
                <p className={styles.perfilSub}>
                  O que personaliza cada análise.
                </p>

                {estado.dados.profileCompleteness === null ? (
                  <>
                    <p className={styles.perfilAviso}>
                      Você ainda não respondeu o questionário. Sem ele, as
                      análises não levam em conta a sua pele.
                    </p>

                    <Button variant="secondary" to="/perguntas">
                      Responder agora
                      <ArrowRight className={styles.icone} aria-hidden="true" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div
                      className={styles.barra}
                      role="progressbar"
                      aria-label="Perfil completo"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={estado.dados.profileCompleteness}
                      aria-valuetext={`${estado.dados.profileCompleteness}%`}
                    >
                      <div
                        className={styles.barraPreenchida}
                        style={{
                          width: `${estado.dados.profileCompleteness}%`,
                        }}
                      />
                    </div>

                    <p className={styles.perfilAviso}>
                      {estado.dados.profileCompleteness < 100
                        ? `Os ${100 - estado.dados.profileCompleteness}% que faltam deixam as análises menos precisas. Complete para os alertas funcionarem melhor.`
                        : "Seu perfil está completo. Cada análise já leva tudo em conta."}
                    </p>

                    <Button
                      variant="secondary"
                      to={
                        estado.dados.profileCompleteness < 100
                          ? "/perfil#titulo-faltando"
                          : "/perfil"
                      }
                    >
                      {estado.dados.profileCompleteness < 100
                        ? "Completar agora"
                        : "Ver meu perfil"}
                      <ArrowRight className={styles.icone} aria-hidden="true" />
                    </Button>
                  </>
                )}
              </section>
            </div>

            <section
              className={styles.cartao}
              aria-labelledby="titulo-recentes"
            >
              <div className={styles.cartaoTopo}>
                <div>
                  <h2 id="titulo-recentes" className={styles.cartaoTitulo}>
                    Análises recentes
                  </h2>
                  <p className={styles.cartaoSub}>
                    Os últimos produtos que você analisou.
                  </p>
                </div>

                <Button variant="secondary" to="/historico">
                  Histórico completo
                  <ArrowRight className={styles.icone} aria-hidden="true" />
                </Button>
              </div>

              {estado.dados.recentAnalyses.length === 0 ? (
                <p className={styles.vazio}>
                  Você ainda não analisou nenhum produto.{" "}
                  <Link to="/pesquisa" className={styles.link}>
                    Busque um produto para começar
                  </Link>
                  .
                </p>
              ) : (
                <ul className={styles.lista}>
                  {estado.dados.recentAnalyses.map((analise) => (
                    <li key={analise.id}>
                      <ProductRow
                        produto={analise.product}
                        nota={analise.finalScore}
                        nivel={nivelDaRecomendacao(analise.recommendationLevel)}
                        realizadaEm={analise.analyzedAt}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default Dashboard;
