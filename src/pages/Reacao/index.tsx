import { useState } from "react";
import Button from "../../components/Button";
import IngredientCard from "../../components/IngredientCard";
import ListaSuspensa from "../../components/ListaSuspensa";
import MainLayout from "../../components/MainLayout";
import RiskLegend from "../../components/RiskLegend";
import { useAnalisePessoal } from "../../hooks/useAnalisePessoal";
import { useAnalisePublica } from "../../hooks/useAnalisePublica";
import { useOpcoesDeProduto } from "../../hooks/useOpcoesDeProduto";
import type { MotivoDaAnalise } from "../../types/analise";
import type { IngredienteAvaliado } from "../../types/ingrediente";
import { ehAlertaPessoal, ordenarPorDestaque } from "../../utils/alertas";
import { ehFragrancia } from "../../utils/selos";
import styles from "./styles.module.css";

interface Escolha {
  marca: string;
  slug: string;
}

const SEM_ESCOLHA: Escolha = { marca: "", slug: "" };
const POR_NOME = new Intl.Collator("pt-BR");

function mereceAtencao(
  item: IngredienteAvaliado,
  nomesEmAlerta: string[],
): boolean {
  return (
    ehAlertaPessoal(item, nomesEmAlerta) ||
    ehFragrancia(item.inciName) ||
    item.level === "warning" ||
    item.level === "avoid"
  );
}

function notaDoIngrediente(
  item: IngredienteAvaliado,
  alertas: MotivoDaAnalise[],
): string | undefined {
  const motivo = alertas.find(
    (alerta) =>
      alerta.ingredientName?.toLowerCase() === item.inciName.toLowerCase(),
  );

  if (motivo !== undefined) {
    return `Alerta para o seu perfil: ${motivo.text}`;
  }

  return ehFragrancia(item.inciName)
    ? "Fragrância é uma causa comum de irritação em pele sensível."
    : undefined;
}

function Reacao() {
  const [escolha, setEscolha] = useState<Escolha>(SEM_ESCOLHA);
  const { estado: opcoes, recarregar: recarregarOpcoes } =
    useOpcoesDeProduto();
  const { estado: analise, recarregar: recarregarAnalise } = useAnalisePublica(
    escolha.slug === "" ? null : escolha.slug,
  );
  const carregada = analise.status === "pronta" ? analise.analise : null;
  const { estado: pessoal } = useAnalisePessoal(
    carregada?.product.slug ?? null,
    carregada?.versionId ?? null,
  );

  const produtos = opcoes.status === "pronto" ? opcoes.produtos : [];
  const marcas = [...new Set(produtos.map((produto) => produto.brand.name))].sort(
    (a, b) => POR_NOME.compare(a, b),
  );
  const daMarca = produtos.filter(
    (produto) => produto.brand.name === escolha.marca,
  );

  const alertas =
    pessoal.status === "pronta"
      ? pessoal.analise.reasons.filter(
          (motivo) => motivo.warning && motivo.ingredientName !== null,
        )
      : [];
  const nomesEmAlerta = alertas.flatMap((motivo) =>
    motivo.ingredientName === null ? [] : [motivo.ingredientName],
  );
  const emAtencao =
    carregada === null
      ? []
      : ordenarPorDestaque(carregada.ingredients, nomesEmAlerta).filter(
          (item) => mereceAtencao(item, nomesEmAlerta),
        );

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Um produto{" "}
            <span className={styles.destaque}>me fez mal.</span>
          </h1>

          <p className={styles.subtitle}>
            Diga qual foi o produto. A Venus mostra o que na fórmula mais
            costuma incomodar e o que é alerta para o seu perfil.
          </p>
        </header>

        <p className={styles.aviso}>
          A Venus não faz diagnóstico. Ela aponta os ingredientes da fórmula
          que merecem atenção, e a confirmação da causa é com dermatologista.
        </p>

        {opcoes.status === "carregando" ? (
          <p className={styles.estado}>Carregando as marcas...</p>
        ) : null}

        {opcoes.status === "erro" ? (
          <div className={styles.erro}>
            <p role="alert">{opcoes.mensagem}</p>

            <Button variant="secondary" onClick={recarregarOpcoes}>
              Tentar carregar as marcas de novo
            </Button>
          </div>
        ) : null}

        {opcoes.status === "pronto" ? (
          <div className={styles.escolhas}>
            <ListaSuspensa
              id="marca-da-reacao"
              label="Qual era a marca?"
              placeholder="Escolha a marca"
              options={marcas.map((marca) => ({ value: marca, label: marca }))}
              value={escolha.marca}
              onChange={(marca) => setEscolha({ marca, slug: "" })}
              onClear={() => setEscolha(SEM_ESCOLHA)}
              fullWidth
            />

            {escolha.marca === "" ? null : (
              <ListaSuspensa
                id="produto-da-reacao"
                label="Qual produto?"
                placeholder="Escolha o produto"
                options={daMarca.map((produto) => ({
                  value: produto.slug,
                  label: produto.name,
                }))}
                value={escolha.slug}
                onChange={(slug) =>
                  setEscolha((atual) => ({ ...atual, slug }))
                }
                onClear={() => setEscolha((atual) => ({ ...atual, slug: "" }))}
                fullWidth
              />
            )}
          </div>
        ) : null}

        <p className="texto-oculto" aria-live="polite">
          {analise.status === "carregando" ? "Carregando a fórmula." : ""}
          {carregada === null
            ? ""
            : `Fórmula de ${carregada.product.name} pronta: ${emAtencao.length} ingredientes merecem atenção.`}
          {pessoal.status === "calculando" && carregada !== null
            ? " Cruzando com o seu perfil."
            : ""}
        </p>

        {analise.status === "carregando" ? (
          <p className={styles.estado}>Carregando a fórmula...</p>
        ) : null}

        {analise.status === "erro" ? (
          <div className={styles.erro}>
            <p role="alert">{analise.mensagem}</p>

            <Button variant="secondary" onClick={recarregarAnalise}>
              Tentar de novo
            </Button>
          </div>
        ) : null}

        {carregada === null ? null : (
          <section className={styles.resultado} aria-labelledby="titulo-reacao">
            <h2 id="titulo-reacao" className={styles.resultadoTitulo}>
              O que merece atenção em {carregada.product.name}
            </h2>

            {pessoal.status === "calculando" ? (
              <p className={styles.estado}>Cruzando com o seu perfil...</p>
            ) : null}

            {pessoal.status === "erro" || pessoal.status === "indisponivel" ? (
              <p className={styles.estado} role="status">
                {pessoal.mensagem}
              </p>
            ) : null}

            {pessoal.status === "sem-conta" ? (
              <div className={styles.convite}>
                <p className={styles.estado}>
                  Com um perfil, a Venus também marca o que é alerta para a
                  sua pele e para as suas alergias. É opcional.
                </p>

                <Button variant="secondary" to="/criar-conta">
                  Criar perfil
                </Button>
              </div>
            ) : null}

            {pessoal.status === "sem-perfil" ? (
              <div className={styles.convite}>
                <p className={styles.estado}>
                  Responda o questionário e a Venus também marca o que é alerta
                  para a sua pele e para as suas alergias. É opcional.
                </p>

                <Button variant="secondary" to="/perguntas">
                  Responder o questionário
                </Button>
              </div>
            ) : null}

            {pessoal.status === "pronta" && alertas.length === 0 ? (
              <p className={styles.estado}>
                Nenhum ingrediente desta fórmula é alerta para o seu perfil.
              </p>
            ) : null}

            {carregada.ingredients.length === 0 ? (
              <p className={styles.estado}>
                Este produto está sem a lista de ingredientes, então não dá
                para apontar nada.
              </p>
            ) : null}

            {carregada.ingredients.length > 0 && emAtencao.length === 0 ? (
              <p className={styles.estado}>
                Nenhum ingrediente desta fórmula está marcado como atenção ou
                evitar. Isso não descarta o produto como causa: a reação pode
                vir de uma sensibilidade sua que a Venus não conhece.
              </p>
            ) : null}

            {emAtencao.length > 0 ? (
              <>
                <RiskLegend label="Legenda do semáforo" />

                <ul className={styles.ingredientes}>
                  {emAtencao.map((item) => (
                    <li key={item.id}>
                      <IngredientCard
                        item={item}
                        note={notaDoIngrediente(item, alertas)}
                      />
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <Button to={`/produto/${carregada.product.slug}`}>
              Ver a análise completa do produto
            </Button>
          </section>
        )}
      </div>
    </MainLayout>
  );
}

export default Reacao;
