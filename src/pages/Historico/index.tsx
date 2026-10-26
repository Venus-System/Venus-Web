import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import Button from "../../components/Button";
import FavoriteButton from "../../components/FavoriteButton";
import Input from "../../components/Input";
import MainLayout from "../../components/MainLayout";
import MySpaceNav from "../../components/MySpaceNav";
import ProductRow from "../../components/ProductRow";
import { useFavoritos } from "../../hooks/useFavoritos";
import type { EstadoFavoritos } from "../../hooks/useFavoritos";
import { useHistorico } from "../../hooks/useHistorico";
import type { EstadoHistorico } from "../../hooks/useHistorico";
import { agruparPorData } from "../../utils/agruparPorData";
import { filtrarAnalises } from "../../utils/filtrarAnalises";
import { nivelDaRecomendacao } from "../../utils/niveis";
import { useTituloDaPagina } from "../../hooks/useTituloDaPagina";
import styles from "./styles.module.css";

const AVISO_DE_BUSCA_PARCIAL =
  "A busca olha só as análises já carregadas. Use Carregar mais para buscar nas anteriores.";

function resultadoDaBusca(encontradas: number, temMais: boolean): string {
  let resultado = `${encontradas} análises encontradas.`;

  if (encontradas === 0) {
    resultado = "Nenhuma análise com esse nome ou essa marca.";
  }

  if (encontradas === 1) {
    resultado = "1 análise encontrada.";
  }

  return temMais ? `${resultado} ${AVISO_DE_BUSCA_PARCIAL}` : resultado;
}

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

  if (estado.recemCarregadas === 0) {
    return "Nenhuma análise nova nesta parte do histórico.";
  }

  return estado.recemCarregadas === 1
    ? "1 análise carregada."
    : `${estado.recemCarregadas} análises carregadas.`;
}

function anuncioDoFavorito(favoritos: EstadoFavoritos): string {
  if (favoritos.status !== "pronto" || favoritos.ultimaAcao === null) {
    return "";
  }

  const { nome, favoritado } = favoritos.ultimaAcao;

  return favoritado
    ? `Você favoritou ${nome}.`
    : `Você tirou ${nome} dos favoritos.`;
}

function Historico() {
  useTituloDaPagina("Histórico");
  const { estado, recarregar, carregarMais } = useHistorico();
  const {
    estado: favoritos,
    recarregar: recarregarFavoritos,
    alternar,
  } = useFavoritos();
  const fimRef = useRef<HTMLParagraphElement>(null);
  const [termo, setTermo] = useState("");

  const carregadas = estado.status === "pronto" ? estado.analises : [];
  const temMais = estado.status === "pronto" && estado.temMais;
  const encontradas = filtrarAnalises(carregadas, termo);
  const buscando = termo.trim() !== "";

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

        <p className="texto-oculto" aria-live="polite">
          {anuncioDoFavorito(favoritos)}
        </p>

        {estado.status === "pronto" &&
        estado.analises.length > 0 &&
        favoritos.status === "erro" ? (
          <div className={styles.avisoFavoritos} role="status">
            <p>
              Não conseguimos carregar seus favoritos agora, por isso os
              corações não aparecem.
            </p>

            <Button variant="text" onClick={recarregarFavoritos}>
              Carregar os favoritos de novo
            </Button>
          </div>
        ) : null}

        {favoritos.status === "pronto" && favoritos.erroAoAlternar !== null ? (
          <p role="alert" className={styles.erroMais}>
            {favoritos.erroAoAlternar}
          </p>
        ) : null}

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

        {carregadas.length > 0 ? (
          <div className={styles.busca} role="search">
            <Input
              id="busca-historico"
              type="search"
              label="Buscar no histórico"
              hideLabel
              placeholder="Buscar por produto ou marca"
              icon={<Search />}
              value={termo}
              onChange={(event) => setTermo(event.target.value)}
            />

            <p className={styles.buscaResultado} aria-live="polite">
              {buscando ? resultadoDaBusca(encontradas.length, temMais) : ""}
            </p>
          </div>
        ) : null}

        {estado.status === "pronto"
          ? agruparPorData(
              encontradas,
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
                        action={
                          favoritos.status === "pronto" ? (
                            <FavoriteButton
                              productName={analise.product.name}
                              isFavorite={favoritos.slugs.includes(
                                analise.product.slug,
                              )}
                              isPending={favoritos.pendentes.includes(
                                analise.product.slug,
                              )}
                              onToggle={() => alternar(analise.product)}
                            />
                          ) : undefined
                        }
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
            {buscando
              ? "Todas as suas análises já foram carregadas."
              : "Essas são todas as suas análises."}
          </p>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default Historico;
