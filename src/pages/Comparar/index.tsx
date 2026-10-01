import { Check } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Button from "../../components/Button";
import ListaSuspensa from "../../components/ListaSuspensa";
import type { SelectOption } from "../../components/ListaSuspensa";
import MainLayout from "../../components/MainLayout";
import RiskBadge from "../../components/RiskBadge";
import ScoreBadge from "../../components/ScoreBadge";
import ScrollableTable from "../../components/ScrollableTable";
import Selo from "../../components/Selo";
import { useComparacao } from "../../hooks/useComparacao";
import { useOpcoesDeProduto } from "../../hooks/useOpcoesDeProduto";
import type { RiskLevel } from "../../types/ingrediente";
import type { NotasProduto, Produto } from "../../types/produto";
import { nivelDaNota } from "../../utils/niveis";
import styles from "./styles.module.css";

type Lado = 0 | 1;
type Parametro = "a" | "b";

interface LinhaDeNota {
  id: string;
  titulo: string;
  campo: keyof Pick<
    NotasProduto,
    "healthScore" | "environmentalScore" | "ethicalScore"
  >;
}

const LINHAS_DE_NOTA: LinhaDeNota[] = [
  { id: "saude", titulo: "Saúde", campo: "healthScore" },
  { id: "ambiental", titulo: "Ambiental", campo: "environmentalScore" },
  { id: "etico", titulo: "Ético", campo: "ethicalScore" },
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
  produtos: [Produto, Produto],
  lado: number,
  vencedor: Lado | null,
): string {
  const produto = produtos[lado];

  if (produto.level === "avoid") {
    return "Nota de evitar. Não é a escolha recomendada.";
  }

  if (vencedor === lado) {
    return "Melhor escolha pela nota geral.";
  }

  if (vencedor !== null) {
    return "Nota geral mais baixa que a do outro produto.";
  }

  const semNota = produtos.some(
    (item) => item.scores.overallScore === null,
  );

  return semNota
    ? "Sem nota geral suficiente para comparar os dois."
    : "Mesma nota geral do outro produto.";
}

function celulaDaNota(
  nota: number | null,
  melhor: boolean,
  nivel?: RiskLevel,
) {
  return (
    <span className={styles.nota}>
      <ScoreBadge score={nota} level={nivel ?? nivelDaNota(nota)} />
      {nivel === undefined ? null : <RiskBadge level={nivel} />}
      {melhor ? (
        <span className={styles.melhor}>
          <Check className={styles.icone} aria-hidden="true" />
          Melhor
        </span>
      ) : null}
    </span>
  );
}

function selosDaMarca(produto: Produto) {
  const selos = [
    produto.brand.hasCrueltyFreeClaim ? "Cruelty-free" : null,
    produto.brand.hasVeganClaim ? "Vegano" : null,
  ].filter((selo): selo is string => selo !== null);

  if (selos.length === 0) {
    return <span className={styles.semSelo}>Nenhum selo declarado</span>;
  }

  return (
    <span className={styles.selos}>
      {selos.map((selo) => (
        <Selo key={selo} label={selo} />
      ))}
    </span>
  );
}

function Comparar() {
  const [parametros, setParametros] = useSearchParams();
  const slugA = parametros.get("a");
  const slugB = parametros.get("b");

  const { estado: opcoes, recarregar: recarregarOpcoes } =
    useOpcoesDeProduto();
  const { estado, recarregar } = useComparacao(slugA, slugB);

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

  const vencedor =
    estado.status === "pronta"
      ? vencedorGeral(estado.produtos[0], estado.produtos[1])
      : null;

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Dois produtos, <span className={styles.destaque}>lado a lado.</span>
          </h1>
          <p className={styles.subtitle}>
            As três notas, os selos de cada marca e qual dos dois tem a nota
            geral mais alta.
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

        {opcoes.status === "pronto" ? (
          <div className={styles.escolha}>
            <ListaSuspensa
              id="produto-a"
              label="Primeiro produto"
              placeholder="Escolha um produto"
              options={opcoesPara(slugB)}
              value={slugA ?? ""}
              onChange={(slug) => escolher("a", slug)}
            />
            <ListaSuspensa
              id="produto-b"
              label="Segundo produto"
              placeholder="Escolha um produto"
              options={opcoesPara(slugA)}
              value={slugB ?? ""}
              onChange={(slug) => escolher("b", slug)}
            />
          </div>
        ) : null}

        <p className="texto-oculto" aria-live="polite">
          {estado.status === "carregando" ? "Carregando a comparação." : ""}
          {estado.status === "pronta"
            ? `Comparação entre ${estado.produtos[0].name} e ${estado.produtos[1].name} pronta.`
            : ""}
        </p>

        {estado.status === "incompleta" ? (
          <p className={styles.estado}>Escolha dois produtos para comparar.</p>
        ) : null}

        {estado.status === "carregando" ? (
          <p className={styles.estado}>Carregando a comparação...</p>
        ) : null}

        {estado.status === "erro" ? (
          <div className={styles.erro}>
            <p role="alert">{estado.mensagem}</p>

            <Button variant="secondary" onClick={recarregar}>
              Tentar de novo
            </Button>
          </div>
        ) : null}

        {estado.status === "pronta" ? (
          <ScrollableTable>
            <caption className="texto-oculto">
              Comparação entre {estado.produtos[0].name} e{" "}
              {estado.produtos[1].name}
            </caption>

            <thead>
              <tr>
                <td className={styles.canto} />
                {estado.produtos.map((produto) => (
                  <th key={produto.slug} scope="col" className={styles.produto}>
                    <span className={styles.foto}>
                      {produto.imageUrl ? (
                        <img
                          src={produto.imageUrl}
                          alt=""
                          className={styles.imagem}
                        />
                      ) : (
                        <span aria-hidden="true">{produto.name.charAt(0)}</span>
                      )}
                    </span>
                    <span className={styles.nome}>{produto.name}</span>
                    <span className={styles.meta}>
                      {produto.brand.name} · {produto.category}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr>
                <th scope="row">Nota geral</th>
                {estado.produtos.map((produto, lado) => (
                  <td
                    key={produto.slug}
                    className={vencedor === lado ? styles.celulaMelhor : undefined}
                  >
                    {celulaDaNota(
                      produto.scores.overallScore,
                      vencedor === lado,
                      produto.level,
                    )}
                  </td>
                ))}
              </tr>

              {LINHAS_DE_NOTA.map((linha) => {
                const melhor = maiorNota(
                  estado.produtos[0].scores[linha.campo],
                  estado.produtos[1].scores[linha.campo],
                );

                return (
                  <tr key={linha.id}>
                    <th scope="row">{linha.titulo}</th>
                    {estado.produtos.map((produto, lado) => (
                      <td
                        key={produto.slug}
                        className={
                          melhor === lado ? styles.celulaMelhor : undefined
                        }
                      >
                        {celulaDaNota(
                          produto.scores[linha.campo],
                          melhor === lado,
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}

              <tr>
                <th scope="row">Selos declarados pela marca</th>
                {estado.produtos.map((produto) => (
                  <td key={produto.slug}>{selosDaMarca(produto)}</td>
                ))}
              </tr>

              <tr>
                <th scope="row">Qual escolher</th>
                {estado.produtos.map((produto, lado) => (
                  <td
                    key={produto.slug}
                    className={vencedor === lado ? styles.celulaMelhor : undefined}
                  >
                    {textoDaEscolha(estado.produtos, lado, vencedor)}
                  </td>
                ))}
              </tr>
            </tbody>
          </ScrollableTable>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default Comparar;
