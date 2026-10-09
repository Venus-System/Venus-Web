import { AlertTriangle, Check, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Button from "../../components/Button";
import ListaSuspensa from "../../components/ListaSuspensa";
import type { SelectOption } from "../../components/ListaSuspensa";
import MainLayout from "../../components/MainLayout";
import RiskBadge from "../../components/RiskBadge";
import ScoreBadge from "../../components/ScoreBadge";
import { useComparacao } from "../../hooks/useComparacao";
import type { EstadoComparacao } from "../../hooks/useComparacao";
import { useOpcoesDeProduto } from "../../hooks/useOpcoesDeProduto";
import type { ProdutoComparado } from "../../types/comparacao";
import type { NotasProduto, Produto } from "../../types/produto";
import { alertasDe, semAvaliacao } from "../../utils/alertas";
import { nivelDaNota } from "../../utils/niveis";
import { tomDoProduto } from "../../utils/tomDoProduto";
import styles from "./styles.module.css";

type Lado = 0 | 1;
type Parametro = "a" | "b";

interface Coluna {
  parametro: Parametro;
  id: string;
  rotulo: string;
}

interface LinhaDeNota {
  id: string;
  titulo: string;
  campo: keyof Pick<
    NotasProduto,
    "healthScore" | "environmentalScore" | "ethicalScore"
  >;
  cor: "saude" | "ambiental" | "etica";
}

const COLUNAS: Coluna[] = [
  { parametro: "a", id: "produto-a", rotulo: "Primeiro produto" },
  { parametro: "b", id: "produto-b", rotulo: "Segundo produto" },
];

const LINHAS_DE_NOTA: LinhaDeNota[] = [
  { id: "saude", titulo: "Saúde", campo: "healthScore", cor: "saude" },
  {
    id: "ambiental",
    titulo: "Ambiental",
    campo: "environmentalScore",
    cor: "ambiental",
  },
  { id: "etico", titulo: "Ético", campo: "ethicalScore", cor: "etica" },
];

function maiorNota(a: number | null, b: number | null): Lado | null {
  if (a === null || b === null || a === b) {
    return null;
  }

  return a > b ? 0 : 1;
}

function vencedorGeral(a: Produto, b: Produto): Lado | null {
  const evitarA = a.level === "avoid";
  const evitarB = b.level === "avoid";

  if (evitarA !== evitarB) {
    return evitarA ? 1 : 0;
  }

  if (evitarA && evitarB) {
    return null;
  }

  return maiorNota(a.scores.overallScore, b.scores.overallScore);
}

function textoDaEscolha(
  produtos: [ProdutoComparado, ProdutoComparado],
  lado: number,
  vencedor: Lado | null,
): string {
  const { product, ingredients } = produtos[lado];

  if (product.level === "avoid") {
    return "Nota de evitar. Não é a escolha recomendada.";
  }

  if (vencedor === lado) {
    return alertasDe(ingredients).length > 0
      ? "Tem a nota geral mais alta, mas confira os alertas da fórmula."
      : "Tem a nota geral mais alta dos dois.";
  }

  if (vencedor !== null) {
    return "Nota geral mais baixa que a do outro produto.";
  }

  const semNota = produtos.some(
    (item) => item.product.scores.overallScore === null,
  );

  return semNota
    ? "Sem nota geral suficiente para comparar os dois."
    : "Mesma nota geral do outro produto.";
}

function mensagemDoEstado(estado: EstadoComparacao): string {
  if (estado.status === "carregando") {
    return "Carregando a comparação...";
  }

  return "Escolha dois produtos para comparar.";
}

function seloMelhor() {
  return (
    <span className={styles.melhor}>
      <Check className={styles.iconePequeno} aria-hidden="true" />
      Melhor
    </span>
  );
}

function selosEAlertas({ product, ingredients }: ProdutoComparado) {
  const selos = [
    product.brand.hasCrueltyFreeClaim ? "Cruelty-free" : null,
    product.brand.hasVeganClaim ? "Vegano" : null,
  ].filter((selo): selo is string => selo !== null);

  const alertas = alertasDe(ingredients);

  let situacao: string | null = null;

  if (ingredients.length === 0) {
    situacao = "Composição não cadastrada";
  } else if (semAvaliacao(ingredients)) {
    situacao = "Ingredientes ainda sem avaliação";
  } else if (alertas.length === 0) {
    situacao = "Nenhum alerta nos ingredientes";
  }

  return (
    <span className={styles.pilulas}>
      {selos.map((selo) => (
        <span key={selo} className={styles.selo}>
          <Check className={styles.iconePequeno} aria-hidden="true" />
          {selo}
        </span>
      ))}

      {alertas.map((alerta) => (
        <span
          key={alerta.id}
          className={
            alerta.level === "avoid" ? styles.alertaEvitar : styles.alerta
          }
        >
          {alerta.level === "avoid" ? (
            <X className={styles.iconePequeno} aria-hidden="true" />
          ) : (
            <AlertTriangle className={styles.iconePequeno} aria-hidden="true" />
          )}
          <span className="texto-oculto">
            {alerta.level === "avoid" ? "Evitar:" : "Atenção:"}
          </span>
          {alerta.ingredient?.commonName ?? alerta.inciName}
        </span>
      ))}

      {situacao === null ? null : (
        <span className={styles.situacao}>{situacao}</span>
      )}
    </span>
  );
}

function Comparar() {
  const [parametros, setParametros] = useSearchParams();
  const slugs: [string | null, string | null] = [
    parametros.get("a"),
    parametros.get("b"),
  ];

  const { estado: opcoes, recarregar: recarregarOpcoes } =
    useOpcoesDeProduto();
  const { estado, recarregar } = useComparacao(slugs[0], slugs[1]);

  function escolher(parametro: Parametro, slug: string) {
    setParametros(
      (atuais) => {
        const novos = new URLSearchParams(atuais);
        novos.set(parametro, slug);
        return novos;
      },
      { replace: true },
    );
  }

  function opcoesPara(outroSlug: string | null): SelectOption<string>[] {
    if (opcoes.status !== "pronto") {
      return [];
    }

    return opcoes.produtos.map((produto) => ({
      value: produto.slug,
      label: `${produto.name} · ${produto.brand.name}`,
      disabled: produto.slug === outroSlug,
    }));
  }

  const produtos = estado.status === "pronta" ? estado.produtos : null;
  const vencedor =
    produtos === null
      ? null
      : vencedorGeral(produtos[0].product, produtos[1].product);

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Dois produtos,{" "}
            <span className={styles.destaque}>lado a lado.</span>
          </h1>
          <p className={styles.subtitle}>
            As três notas, os alertas de cada fórmula e qual dos dois tem{" "}
            <strong>a nota geral mais alta.</strong>
          </p>
        </header>

        {opcoes.status === "carregando" ? (
          <p className={styles.estado}>Carregando os produtos...</p>
        ) : null}

        {opcoes.status === "erro" ? (
          <div className={styles.erro}>
            <p role="alert">{opcoes.mensagem}</p>

            <Button variant="secondary" onClick={recarregarOpcoes}>
              Tentar carregar os produtos de novo
            </Button>
          </div>
        ) : null}

        <p className="texto-oculto" aria-live="polite">
          {estado.status === "carregando" ? "Carregando a comparação." : ""}
          {produtos === null
            ? ""
            : `Comparação entre ${produtos[0].product.name} e ${produtos[1].product.name} pronta.`}
        </p>

        {opcoes.status === "pronto" ? (
          <div
            className={styles.moldura}
            role="region"
            aria-labelledby="titulo-tabela"
            tabIndex={0}
          >
            <table className={styles.tabela}>
              <caption id="titulo-tabela" className="texto-oculto">
                {produtos === null
                  ? "Tabela de comparação"
                  : `Comparação entre ${produtos[0].product.name} e ${produtos[1].product.name}`}
              </caption>

              <thead>
                <tr>
                  <th scope="row" className={styles.canto}>
                    Produto
                  </th>

                  {COLUNAS.map((coluna, lado) => {
                    const slug = slugs[lado];
                    const comparado = produtos === null ? null : produtos[lado];

                    return (
                      <th
                        key={coluna.parametro}
                        scope="col"
                        className={styles.colunaProduto}
                      >
                        <ListaSuspensa
                          id={coluna.id}
                          label={coluna.rotulo}
                          placeholder="Escolha um produto"
                          options={opcoesPara(slugs[lado === 0 ? 1 : 0])}
                          value={slug ?? ""}
                          onChange={(valor) => escolher(coluna.parametro, valor)}
                          hideLabel
                          fullWidth
                        />

                        <span
                          className={[
                            styles.foto,
                            slug === null ? "" : styles[tomDoProduto(slug)],
                          ].join(" ")}
                        >
                          {comparado?.product.imageUrl ? (
                            <img
                              src={comparado.product.imageUrl}
                              alt=""
                              className={styles.imagem}
                            />
                          ) : null}
                        </span>

                        {comparado === null ? null : (
                          <>
                            <span className={styles.nome}>
                              {comparado.product.name}
                              {vencedor === lado ? (
                                <span className={styles.vencedor}>
                                  <Check
                                    className={styles.icone}
                                    aria-hidden="true"
                                  />
                                  <span className="texto-oculto">
                                    , melhor escolha pela nota geral
                                  </span>
                                </span>
                              ) : null}
                            </span>
                            <span className={styles.meta}>
                              {comparado.product.brand.name} ·{" "}
                              {comparado.product.category}
                            </span>
                          </>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {produtos === null ? (
                  <tr>
                    <td colSpan={3} className={styles.mensagem}>
                      {estado.status === "erro" ? (
                        <span className={styles.erro}>
                          <span role="alert">{estado.mensagem}</span>
                          <Button variant="secondary" onClick={recarregar}>
                            Tentar de novo
                          </Button>
                        </span>
                      ) : (
                        mensagemDoEstado(estado)
                      )}
                    </td>
                  </tr>
                ) : (
                  <>
                    <tr>
                      <th scope="row">Nota geral</th>
                      {produtos.map(({ product }, lado) => (
                        <td
                          key={product.slug}
                          className={
                            vencedor === lado ? styles.celulaMelhor : undefined
                          }
                        >
                          <span className={styles.linhaDaNota}>
                            <span className={styles.notaGrande}>
                              <span aria-hidden="true">
                                {product.scores.overallScore ?? "—"}
                                <span className={styles.deCem}>/100</span>
                              </span>
                              <span className="texto-oculto">
                                {product.scores.overallScore === null
                                  ? "Sem nota disponível"
                                  : `Nota ${product.scores.overallScore} de 100`}
                              </span>
                            </span>
                            <RiskBadge level={product.level} />
                          </span>
                        </td>
                      ))}
                    </tr>

                    {LINHAS_DE_NOTA.map((linha) => {
                      const melhor = maiorNota(
                        produtos[0].product.scores[linha.campo],
                        produtos[1].product.scores[linha.campo],
                      );

                      return (
                        <tr key={linha.id}>
                          <th scope="row">{linha.titulo}</th>
                          {produtos.map(({ product }, lado) => {
                            const nota = product.scores[linha.campo];

                            return (
                              <td
                                key={product.slug}
                                className={
                                  melhor === lado
                                    ? styles.celulaMelhor
                                    : undefined
                                }
                              >
                                <span className={styles.linhaDaNota}>
                                  <ScoreBadge
                                    score={nota}
                                    level={nivelDaNota(nota)}
                                  />
                                  <span
                                    className={styles.trilha}
                                    aria-hidden="true"
                                  >
                                    <span
                                      className={`${styles.preenchida} ${styles[linha.cor]}`}
                                      style={{ width: `${nota ?? 0}%` }}
                                    />
                                  </span>
                                  {melhor === lado ? seloMelhor() : null}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}

                    <tr>
                      <th scope="row">Selos e alertas</th>
                      {produtos.map((comparado) => (
                        <td key={comparado.product.slug}>
                          {selosEAlertas(comparado)}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <th scope="row">Qual escolher</th>
                      {produtos.map(({ product }, lado) => (
                        <td
                          key={product.slug}
                          className={
                            vencedor === lado ? styles.celulaMelhor : undefined
                          }
                        >
                          {vencedor === lado ? (
                            <span className={styles.escolhaTitulo}>
                              Melhor pela nota geral.
                            </span>
                          ) : null}
                          {textoDaEscolha(produtos, lado, vencedor)}
                        </td>
                      ))}
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default Comparar;
