import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Button from "../../components/Button";
import MainLayout from "../../components/MainLayout";
import ProductRow from "../../components/ProductRow";
import ScoreBars from "../../components/ScoreBars";
import ScoreRing from "../../components/ScoreRing";
import StatCard from "../../components/StatCard";
import SwapCard from "../../components/SwapCard";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import { usePainel } from "../../hooks/usePainel";
import type { ContagemPorPeriodo, Painel } from "../../types/painel";
import { nivelDaNota, nivelDaRecomendacao } from "../../utils/niveis";
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
            <p className={styles.subtitle}>{resumoDoTopo(estado.painel)}</p>
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
                value={valorDaContagem(estado.painel.analyses)}
                valueLabel={rotuloDaContagem(estado.painel.analyses)}
                description={desdeQuando(estado.painel)}
                trend={tendencia(estado.painel.analyses)}
              />

              <StatCard
                label="Nota média"
                value={
                  estado.painel.summary.averageScore === null
                    ? "—"
                    : String(estado.painel.summary.averageScore)
                }
                suffix={
                  estado.painel.summary.averageScore === null
                    ? undefined
                    : "/100"
                }
                valueLabel={
                  estado.painel.summary.averageScore === null
                    ? "sem nota"
                    : `${estado.painel.summary.averageScore} de 100`
                }
                description={descricaoDaMedia(
                  estado.painel.summary.productCount,
                )}
              />

              <StatCard
                label="Alertas no seu perfil"
                value={valorDaContagem(estado.painel.alerts)}
                valueLabel={rotuloDaContagem(estado.painel.alerts)}
                description="Contraindicados para você"
                trend={tendencia(estado.painel.alerts)}
              />

              <StatCard
                label="Favoritos"
                value={String(estado.painel.favoriteCount)}
                description="Os produtos que você guardou"
              >
                <p className={styles.emBreveLinha}>
                  Ver favoritos
                  <span className={styles.emBreve}>Em breve</span>
                </p>
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
                  Média das três notas nos produtos que você analisou.
                </p>

                {estado.painel.summary.productCount === 0 ? (
                  <p className={styles.vazio}>
                    Quando você analisar um produto, as notas de saúde, meio
                    ambiente e ética aparecem aqui.
                  </p>
                ) : (
                  <div className={styles.saude}>
                    <ScoreRing
                      score={estado.painel.summary.averageScore}
                      level={nivelDaNota(estado.painel.summary.averageScore)}
                      label="Nota média"
                    />

                    <div className={styles.barras}>
                      <ScoreBars notas={estado.painel.summary} />
                    </div>

                    <ul className={styles.legenda}>
                      <li className={styles.aprovados}>
                        {plural(
                          estado.painel.summary.approved,
                          "produto aprovado",
                          "produtos aprovados",
                        )}
                      </li>
                      <li className={styles.atencao}>
                        {estado.painel.summary.warning} com atenção
                      </li>
                      <li className={styles.substituir}>
                        {estado.painel.summary.replace} para substituir
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

                {estado.painel.profileCompleteness === null ? (
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
                      aria-valuenow={estado.painel.profileCompleteness}
                      aria-valuetext={`${estado.painel.profileCompleteness}%`}
                    >
                      <div
                        className={styles.barraPreenchida}
                        style={{
                          width: `${estado.painel.profileCompleteness}%`,
                        }}
                      />
                    </div>

                    <p className={styles.perfilAviso}>
                      {estado.painel.profileCompleteness < 100
                        ? `Os ${100 - estado.painel.profileCompleteness}% que faltam deixam as análises menos precisas. Complete para os alertas funcionarem melhor.`
                        : "Seu perfil está completo. Cada análise já leva tudo em conta."}
                    </p>

                    <Button variant="secondary" to="/perfil">
                      {estado.painel.profileCompleteness < 100
                        ? "Completar agora"
                        : "Ver meu perfil"}
                      <ArrowRight className={styles.icone} aria-hidden="true" />
                    </Button>
                  </>
                )}
              </section>
            </div>

            <div className={styles.linha}>
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

                  <p className={styles.emBreveLinha}>
                    Histórico completo
                    <span className={styles.emBreve}>Em breve</span>
                  </p>
                </div>

                {estado.painel.recentAnalyses.length === 0 ? (
                  <p className={styles.vazio}>
                    Você ainda não analisou nenhum produto.{" "}
                    <Link to="/pesquisa" className={styles.link}>
                      Busque um produto para começar
                    </Link>
                    .
                  </p>
                ) : (
                  <ul className={styles.lista}>
                    {estado.painel.recentAnalyses.map((analise) => (
                      <li key={analise.id}>
                        <ProductRow
                          produto={analise.product}
                          nota={analise.finalScore}
                          nivel={nivelDaRecomendacao(
                            analise.recommendationLevel,
                          )}
                          realizadaEm={analise.analyzedAt}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section
                className={styles.cartao}
                aria-labelledby="titulo-troca"
              >
                <h2 id="titulo-troca" className={styles.cartaoTitulo}>
                  Troca <span className={styles.destaque}>recomendada</span>
                </h2>
                <p className={styles.cartaoSub}>
                  Uma alternativa mais alinhada com você para um produto que
                  você analisou.
                </p>

                {estado.painel.recommendedSwap === null ? (
                  <p className={styles.vazio}>
                    Quando a Venus encontrar uma alternativa melhor para um
                    produto que você analisou, ela aparece aqui.
                  </p>
                ) : (
                  <>
                    <SwapCard swap={estado.painel.recommendedSwap} />

                    <p className={styles.emBreveLinha}>
                      Comparar os dois
                      <span className={styles.emBreve}>Em breve</span>
                    </p>
                  </>
                )}
              </section>
            </div>
          </>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default Dashboard;
