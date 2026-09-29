import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button";
import MainLayout from "../../components/MainLayout";
import MySpaceNav from "../../components/MySpaceNav";
import ProductRow from "../../components/ProductRow";
import { useHistorico } from "../../hooks/useHistorico";
import type { EstadoHistorico } from "../../hooks/useHistorico";
import { agruparPorData } from "../../utils/agruparPorData";
import { nivelDaRecomendacao } from "../../utils/niveis";
import styles from "./styles.module.css";

function anuncio(estado: EstadoHistorico): string {
  if (estado.status === "carregando") {
    return "Carregando o seu histórico.";
  }

  if (estado.status !== "pronto") {
    return "";
  }

  if (estado.carregandoMais) {
    return "Carregando mais análises.";
  }

  if (estado.recemCarregadas === null) {
    return "";
  }

  return estado.recemCarregadas === 1
    ? "1 análise carregada."
    : `${estado.recemCarregadas} análises carregadas.`;
}

function Historico() {
  const { estado, recarregar, carregarMais } = useHistorico();
  const fimRef = useRef<HTMLParagraphElement>(null);

  const chegouAoFimCarregando =
    estado.status === "pronto" &&
    !estado.temMais &&
    estado.recemCarregadas !== null;

  useEffect(() => {
    if (chegouAoFimCarregando) {
      fimRef.current?.focus();
    }
  }, [chegouAoFimCarregando]);

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Tudo que você <span className={styles.destaque}>já analisou.</span>
          </h1>
          <p className={styles.subtitle}>
            Cada análise fica salva aqui. Volte quando quiser,{" "}
            <strong>a memória é sua.</strong>
          </p>
        </header>

        <MySpaceNav />

        <p className="texto-oculto" aria-live="polite">
          {anuncio(estado)}
        </p>

        {estado.status === "carregando" ? (
          <p className={styles.estado}>Carregando o seu histórico...</p>
        ) : null}

        {estado.status === "erro" ? (
          <div className={styles.erro}>
            <p role="alert">{estado.mensagem}</p>

            <Button variant="secondary" onClick={recarregar}>
              Tentar de novo
            </Button>
          </div>
        ) : null}

        {estado.status === "pronto" && estado.analises.length === 0 ? (
          <p className={styles.vazio}>
            Você ainda não analisou nenhum produto.{" "}
            <Link to="/pesquisa">Busque um produto para começar</Link>.
          </p>
        ) : null}

        {estado.status === "pronto"
          ? agruparPorData(
              estado.analises,
              (analise) => analise.analyzedAt,
            ).map((grupo) => (
              <section
                key={grupo.id}
                className={styles.secao}
                aria-labelledby={`titulo-${grupo.id}`}
              >
                <h2 id={`titulo-${grupo.id}`} className={styles.secaoTitulo}>
                  {grupo.titulo}
                </h2>

                <ul className={styles.lista}>
                  {grupo.itens.map((analise) => (
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
              </section>
            ))
          : null}

        {estado.status === "pronto" && estado.temMais ? (
          <div className={styles.mais}>
            <Button
              variant="secondary"
              onClick={carregarMais}
              aria-disabled={estado.carregandoMais}
            >
              {estado.carregandoMais ? "Carregando..." : "Carregar mais"}
            </Button>

            {estado.erroAoCarregarMais === null ? null : (
              <p role="alert" className={styles.erroMais}>
                {estado.erroAoCarregarMais}
              </p>
            )}
          </div>
        ) : null}

        {estado.status === "pronto" &&
        !estado.temMais &&
        estado.analises.length > 0 ? (
          <p ref={fimRef} tabIndex={-1} className={styles.fim}>
            Essas são todas as suas análises.
          </p>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default Historico;
