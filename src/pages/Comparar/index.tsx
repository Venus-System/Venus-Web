import { useState } from "react";
import { AlertTriangle, Check, Equal, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../../components/Button";
import ListaSuspensa from "../../components/ListaSuspensa";
import type { SelectOption } from "../../components/ListaSuspensa";
import MainLayout from "../../components/MainLayout";
import RiskBadge from "../../components/RiskBadge";
import ScoreBadge from "../../components/ScoreBadge";
import ScoreExplanation from "../../components/ScoreExplanation";
import { useAnalisePessoal } from "../../hooks/useAnalisePessoal";
import type { EstadoDaAnalisePessoal } from "../../hooks/useAnalisePessoal";
import { useComparacao } from "../../hooks/useComparacao";
import type { EstadoComparacao } from "../../hooks/useComparacao";
import { useOpcoesDeProduto } from "../../hooks/useOpcoesDeProduto";
import type { AnalisePersonalizada } from "../../types/analise";
import type { ProdutoComparado } from "../../types/comparacao";
import type { Produto } from "../../types/produto";
import { alertasDe, semAvaliacao } from "../../utils/alertas";
import {
  ROTULO_DA_FAIXA,
  ROTULO_DO_RISCO,
  faixaDaNota,
  nivelDaNota,
  nivelDaRecomendacao,
  nivelDoRisco,
} from "../../utils/niveis";
import { NOTAS_DE_QUALIDADE } from "../../utils/notas";
import { tomDoProduto } from "../../utils/tomDoProduto";
import { useTituloDaPagina } from "../../hooks/useTituloDaPagina";
import styles from "./styles.module.css";

type Lado = 0 | 1;
type Parametro = "a" | "b";
type TomDoVeredito = "melhor" | "nenhum" | "empate";

interface Veredito {
  tom: TomDoVeredito;
  texto: string;
}

const CLASSE_DO_VEREDITO: Record<TomDoVeredito, string> = {
  melhor: styles.vereditoMelhor,
  nenhum: styles.vereditoNenhum,
  empate: styles.vereditoEmpate,
};

const ICONE_DO_VEREDITO: Record<TomDoVeredito, LucideIcon> = {
  melhor: Check,
  nenhum: X,
  empate: Equal,
};

interface Coluna {
  parametro: Parametro;
  id: string;
  rotulo: string;
}

const POR_NOME = new Intl.Collator("pt-BR");

const COLUNAS: Coluna[] = [
  { parametro: "a", id: "produto-a", rotulo: "Primeiro produto" },
  { parametro: "b", id: "produto-b", rotulo: "Segundo produto" },
];

function maiorNota(a: number | null, b: number | null): Lado | null {
  if (a === null || b === null || a === b) {
    return null;
  }

  return a > b ? 0 : 1;
}

function vencedorGeral(a: Produto, b: Produto): Lado | null {
  if (a.scores.overallScore === null || b.scores.overallScore === null) {
    return null;
  }

  const evitarA = a.level === "avoid";
  const evitarB = b.level === "avoid";

  if (evitarA !== evitarB) {
    return evitarA ? 1 : 0;
  }

  if (evitarA && evitarB) {
    return null;
  }

  if (
    faixaDaNota(a.scores.overallScore) === faixaDaNota(b.scores.overallScore)
  ) {
    return null;
  }

  return maiorNota(a.scores.overallScore, b.scores.overallScore);
}

function rotuloDaNotaGeral(produto: Produto): string | undefined {
  const faixa = faixaDaNota(produto.scores.overallScore);

  if (faixa === null || nivelDaRecomendacao(faixa) !== produto.level) {
    return undefined;
  }

  return ROTULO_DA_FAIXA[faixa];
}

function fraseDosAlertas({ ingredients }: ProdutoComparado): string {
  const total = alertasDe(ingredients).length;

  if (total === 0) {
    return "";
  }

  return total === 1
    ? "A fórmula tem 1 ingrediente com alerta."
    : `A fórmula tem ${total} ingredientes com alerta.`;
}

function textoDaEscolha(
  produtos: [ProdutoComparado, ProdutoComparado],
  lado: number,
  vencedor: Lado | null,
): string {
  const { product } = produtos[lado];

  if (product.level === "avoid") {
    return "Nota de evitar. Não é a escolha recomendada.";
  }

  if (vencedor === lado) {
    return "Fica numa faixa mais alta pela nota geral.";
  }

  if (vencedor !== null) {
    return "Fica numa faixa mais baixa pela nota geral.";
  }

  const semNota = produtos.some(
    (item) => item.product.scores.overallScore === null,
  );

  return semNota
    ? "Sem nota geral suficiente para comparar os dois."
    : "Fica na mesma faixa do outro produto pela nota geral.";
}

function evitarParaAPessoa(analise: AnalisePersonalizada): boolean {
  return nivelDaRecomendacao(analise.recommendationLevel) === "avoid";
}

function vencedorPessoal(
  a: AnalisePersonalizada,
  b: AnalisePersonalizada,
): Lado | null {
  const evitarA = evitarParaAPessoa(a);
  const evitarB = evitarParaAPessoa(b);

  if (evitarA !== evitarB) {
    return evitarA ? 1 : 0;
  }

  if (evitarA && evitarB) {
    return null;
  }

  if (a.recommendationLevel === b.recommendationLevel) {
    return null;
  }

  return maiorNota(a.finalScore, b.finalScore);
}

function textoDaComparacaoIncompleta(
  estado: EstadoDaAnalisePessoal,
  algumaEvitar: boolean,
  calculando: boolean,
): string | null {
  if (estado.status === "pronta" && evitarParaAPessoa(estado.analise)) {
    return "Não é a escolha recomendada para o seu perfil.";
  }

  if (algumaEvitar) {
    return "Sem a nota para o seu perfil deste produto, não dá para dizer se ele combina mais com você.";
  }

  return calculando ? "Calculando a nota para o seu perfil." : null;
}

function textoDaEscolhaPessoal(
  analise: AnalisePersonalizada,
  lado: number,
  vencedor: Lado | null,
): string {
  if (evitarParaAPessoa(analise)) {
    return "Não é recomendado para o seu perfil.";
  }

  const faixa = ROTULO_DA_FAIXA[analise.recommendationLevel];

  if (vencedor === null) {
    return `Fica na mesma faixa do outro produto para o seu perfil: ${faixa}.`;
  }

  if (vencedor !== lado) {
    return `Fica numa faixa mais baixa para o seu perfil: ${faixa}.`;
  }

  const temAviso =
    analise.riskLevel !== "low" ||
    analise.reasons.some((motivo) => motivo.warning);

  return temAviso
    ? `Fica numa faixa mais alta para o seu perfil (${faixa}), mas confira os alertas.`
    : `Fica numa faixa mais alta para o seu perfil: ${faixa}.`;
}

function vereditoDaComparacao(
  produtos: [ProdutoComparado, ProdutoComparado],
  analises: [AnalisePersonalizada, AnalisePersonalizada] | null,
  vencedor: Lado | null,
  calculando: boolean,
): Veredito | null {
  if (vencedor !== null) {
    const nome = produtos[vencedor].product.name;

    return {
      tom: "melhor",
      texto:
        analises === null
          ? `${nome} é a melhor escolha pela nota geral.`
          : `${nome} é a melhor escolha para o seu perfil.`,
    };
  }

  if (analises !== null) {
    return analises.every(evitarParaAPessoa)
      ? {
          tom: "nenhum",
          texto:
            "Nenhum dos dois é recomendado para o seu perfil. Confira os alertas de cada um.",
        }
      : {
          tom: "empate",
          texto: "Os dois ficam na mesma faixa para o seu perfil.",
        };
  }

  const osDoisEvitar = produtos.every(
    ({ product }) => product.level === "avoid",
  );

  if (!calculando && osDoisEvitar) {
    return {
      tom: "nenhum",
      texto: "Nenhum dos dois é recomendado pela nota geral.",
    };
  }

  return null;
}

function vereditoNaTela({ tom, texto }: Veredito) {
  const Icone = ICONE_DO_VEREDITO[tom];

  return (
    <p className={`${styles.veredito} ${CLASSE_DO_VEREDITO[tom]}`}>
      <Icone className={styles.icone} aria-hidden="true" />
      {texto}
    </p>
  );
}

function celulaPessoal(
  estado: EstadoDaAnalisePessoal,
  tentarDeNovo: () => void,
) {
  if (estado.status === "pronta") {
    return (
      <span className={styles.linhaDaNota}>
        <span className={styles.notaGrande}>
          <span aria-hidden="true">
            {estado.analise.finalScore}
            <span className={styles.deCem}>/100</span>
          </span>
          <span className="texto-oculto">
            Nota {estado.analise.finalScore} de 100 para o seu perfil
          </span>
        </span>
        <RiskBadge
          level={nivelDaRecomendacao(estado.analise.recommendationLevel)}
          label={ROTULO_DA_FAIXA[estado.analise.recommendationLevel]}
        />
        <RiskBadge
          level={nivelDoRisco(estado.analise.riskLevel)}
          label={ROTULO_DO_RISCO[estado.analise.riskLevel]}
        />
      </span>
    );
  }

  if (estado.status === "erro") {
    return (
      <span className={styles.erro}>
        <span role="alert">{estado.mensagem}</span>
        <Button variant="secondary" onClick={tentarDeNovo}>
          Tentar de novo
        </Button>
      </span>
    );
  }

  return (
    <span className={styles.situacao}>
      {estado.status === "indisponivel"
        ? estado.mensagem
        : "Calculando para o seu perfil..."}
    </span>
  );
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
  useTituloDaPagina("Comparar produtos");
  const [parametros, setParametros] = useSearchParams();
  const slugs: [string | null, string | null] = [
    parametros.get("a"),
    parametros.get("b"),
  ];

  const { estado: opcoes, recarregar: recarregarOpcoes } =
    useOpcoesDeProduto();
  const { estado, recarregar } = useComparacao(slugs[0], slugs[1]);
  const [categoriaEscolhida, setCategoriaEscolhida] = useState<string | null>(
    null,
  );
  const catalogo = opcoes.status === "pronto" ? opcoes.dados : [];
  const produtoA = catalogo.find((produto) => produto.slug === slugs[0]);
  const categoria = categoriaEscolhida ?? produtoA?.category ?? "";
  const categorias = [
    ...new Set(catalogo.map((produto) => produto.category)),
  ].sort((a, b) => POR_NOME.compare(a, b));

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

  function opcoesPara(
    meuSlug: string | null,
    outroSlug: string | null,
  ): SelectOption<string>[] {
    return catalogo
      .filter(
        (produto) =>
          categoria === "" ||
          produto.category === categoria ||
          produto.slug === meuSlug,
      )
      .map((produto) => ({
        value: produto.slug,
        label: `${produto.name} · ${produto.brand.name}`,
        disabled: produto.slug === outroSlug,
      }));
  }

  const produtos = estado.status === "pronta" ? estado.produtos : null;
  const pessoalA = useAnalisePessoal(
    produtos?.[0].product.slug ?? null,
    produtos?.[0].versionId ?? null,
  );
  const pessoalB = useAnalisePessoal(
    produtos?.[1].product.slug ?? null,
    produtos?.[1].versionId ?? null,
  );
  const pessoais = [pessoalA, pessoalB];
  const analises: [AnalisePersonalizada, AnalisePersonalizada] | null =
    pessoalA.estado.status === "pronta" && pessoalB.estado.status === "pronta"
      ? [pessoalA.estado.analise, pessoalB.estado.analise]
      : null;
  const semAnalisePessoal =
    pessoalA.estado.status === "sem-conta" ||
    pessoalA.estado.status === "sem-perfil";
  const calculando =
    pessoalA.estado.status === "calculando" ||
    pessoalB.estado.status === "calculando";

  const algumaEvitar = pessoais.some(
    ({ estado: pessoal }) =>
      pessoal.status === "pronta" && evitarParaAPessoa(pessoal.analise),
  );

  let vencedor: Lado | null = null;

  if (produtos !== null && analises !== null) {
    vencedor = vencedorPessoal(analises[0], analises[1]);
  }

  if (produtos !== null && analises === null && !algumaEvitar && !calculando) {
    vencedor = vencedorGeral(produtos[0].product, produtos[1].product);
  }

  const veredito =
    produtos === null
      ? null
      : vereditoDaComparacao(produtos, analises, vencedor, calculando);

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Dois produtos,{" "}
            <span className={styles.destaque}>lado a lado.</span>
          </h1>
          <p className={styles.subtitle}>
            As quatro notas, os alertas de cada fórmula e qual dos dois{" "}
            <strong>
              {semAnalisePessoal
                ? "tem a nota geral mais alta."
                : "combina mais com o seu perfil."}
            </strong>
          </p>

          <ScoreExplanation />
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
          {produtos !== null && calculando
            ? " Calculando as notas para o seu perfil."
            : ""}
          {analises === null ? "" : " Notas para o seu perfil prontas."}
        </p>

        {opcoes.status === "pronto" ? (
          <div className={styles.filtro}>
            <ListaSuspensa
              id="categoria-comparar"
              label="Categoria"
              placeholder="Todas as categorias"
              options={categorias.map((nome) => ({ value: nome, label: nome }))}
              value={categoria}
              onChange={setCategoriaEscolhida}
              onClear={() => setCategoriaEscolhida("")}
            />

            {produtos !== null &&
            produtos[0].product.category !== produtos[1].product.category ? (
              <p className={styles.avisoCategoria} role="status">
                <AlertTriangle
                  className={styles.iconePequeno}
                  aria-hidden="true"
                />
                Estes produtos são de categorias diferentes, então a comparação
                ajuda menos.
              </p>
            ) : null}
          </div>
        ) : null}

        {opcoes.status === "pronto" ? (
          <div aria-live="polite">
            {veredito === null ? null : vereditoNaTela(veredito)}
          </div>
        ) : null}

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
                          options={opcoesPara(slug, slugs[lado === 0 ? 1 : 0])}
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
                              <Link
                                to={`/produto/${comparado.product.slug}`}
                                className={styles.nomeLink}
                              >
                                {comparado.product.name}
                              </Link>
                              {vencedor === lado ? (
                                <span className={styles.vencedor}>
                                  <Check
                                    className={styles.icone}
                                    aria-hidden="true"
                                  />
                                  <span className="texto-oculto">
                                    {analises === null
                                      ? ", melhor escolha pela nota geral"
                                      : ", melhor escolha para o seu perfil"}
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
                            analises === null && vencedor === lado
                              ? styles.celulaMelhor
                              : undefined
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
                            {analises === null ? (
                              <RiskBadge
                                level={product.level}
                                label={rotuloDaNotaGeral(product)}
                              />
                            ) : null}
                          </span>
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <th scope="row">Para o seu perfil</th>
                      {semAnalisePessoal ? (
                        <td colSpan={2}>
                          <span className={styles.convite}>
                            {pessoalA.estado.status === "sem-conta"
                              ? "Com um perfil, a Venus compara os dois para a sua pele. É opcional."
                              : "Responda o questionário e a Venus compara os dois para a sua pele. É opcional."}
                            <Button
                              variant="text"
                              to={
                                pessoalA.estado.status === "sem-conta"
                                  ? "/criar-conta"
                                  : "/perguntas"
                              }
                            >
                              {pessoalA.estado.status === "sem-conta"
                                ? "Criar perfil"
                                : "Responder o questionário"}
                            </Button>
                          </span>
                        </td>
                      ) : (
                        produtos.map(({ product }, lado) => (
                          <td
                            key={product.slug}
                            className={
                              analises !== null && vencedor === lado
                                ? styles.celulaMelhor
                                : undefined
                            }
                          >
                            {celulaPessoal(
                              pessoais[lado].estado,
                              pessoais[lado].tentarDeNovo,
                            )}
                          </td>
                        ))
                      )}
                    </tr>

                    {NOTAS_DE_QUALIDADE.map((linha) => {
                      const melhor = maiorNota(
                        produtos[0].product.scores[linha.campo],
                        produtos[1].product.scores[linha.campo],
                      );

                      return (
                        <tr key={linha.campo}>
                          <th scope="row">{linha.rotulo}</th>
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
                                      className={styles.preenchida}
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
                              {analises === null
                                ? "Melhor pela nota geral."
                                : "Melhor para você."}
                            </span>
                          ) : null}
                          {analises === null
                            ? (textoDaComparacaoIncompleta(
                                pessoais[lado].estado,
                                algumaEvitar,
                                calculando,
                              ) ?? textoDaEscolha(produtos, lado, vencedor))
                            : textoDaEscolhaPessoal(
                                analises[lado],
                                lado,
                                vencedor,
                              )}{" "}
                          {fraseDosAlertas(produtos[lado])}
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
