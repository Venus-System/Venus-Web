import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { FiltrosDaPesquisa } from "../../types/pesquisa";
import { useOpcoesDaPesquisa } from "../../hooks/useOpcoesDaPesquisa";
import { usePesquisaDeProdutos } from "../../hooks/usePesquisaDeProdutos";
import type {
  BuscaDaPesquisa,
  EstadoDaPesquisa,
} from "../../hooks/usePesquisaDeProdutos";
import MainLayout from "../../components/MainLayout";
import Button from "../../components/Button";
import Input from "../../components/Input";
import ListaSuspensa from "../../components/ListaSuspensa";
import ProductCard from "../../components/ProductCard";
import styles from "./styles.module.css";

type FiltroDeLista = "categoria" | "marca";

const FILTROS_VAZIOS: FiltrosDaPesquisa = {
  termo: "",
  categoria: "",
  marca: "",
};

function semFiltro(filtros: FiltrosDaPesquisa): boolean {
  return (
    filtros.termo === "" && filtros.categoria === "" && filtros.marca === ""
  );
}

function descricaoDosFiltros(filtros: FiltrosDaPesquisa): string {
  const partes: string[] = [];

  if (filtros.termo !== "") {
    partes.push(`para "${filtros.termo}"`);
  }

  if (filtros.categoria !== "") {
    partes.push(`na categoria ${filtros.categoria}`);
  }

  if (filtros.marca !== "") {
    partes.push(`da marca ${filtros.marca}`);
  }

  return partes.length === 0 ? "no catálogo" : partes.join(", ");
}

function textoDeStatus(
  estado: EstadoDaPesquisa,
  busca: BuscaDaPesquisa,
): string {
  const descricao = descricaoDosFiltros(busca.filtros);

  if (estado.situacao === "carregando") {
    return busca.pagina > 0
      ? "Carregando mais produtos."
      : `Buscando produtos ${descricao}.`;
  }

  if (estado.situacao === "erro") {
    return "";
  }

  const total = estado.lista.length;

  if (total === 0) {
    return `Nenhum produto encontrado ${descricao}.`;
  }

  if (estado.temMais) {
    return `Mostrando os primeiros ${total} produtos ${descricao}.`;
  }

  return total === 1
    ? `1 produto encontrado ${descricao}.`
    : `${total} produtos encontrados ${descricao}.`;
}

function Pesquisa() {
  const [busca, setBusca] = useState<BuscaDaPesquisa>({
    filtros: FILTROS_VAZIOS,
    pagina: 0,
  });
  const estado = usePesquisaDeProdutos(busca);
  const { estado: opcoes, recarregar: recarregarOpcoes } =
    useOpcoesDaPesquisa();
  const formRef = useRef<HTMLFormElement>(null);
  const filtrosRef = useRef<HTMLFieldSetElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const focarNoIndice = useRef<number | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const valor = new FormData(event.currentTarget).get("termo");
    const termo = typeof valor === "string" ? valor.trim() : "";

    setBusca((atual) => ({ filtros: { ...atual.filtros, termo }, pagina: 0 }));
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.value !== "") {
      return;
    }

    setBusca((atual) =>
      atual.filtros.termo === ""
        ? atual
        : { filtros: { ...atual.filtros, termo: "" }, pagina: 0 },
    );
  }

  function mudarFiltro(campo: FiltroDeLista, valor: string) {
    setBusca((atual) => ({
      filtros: { ...atual.filtros, [campo]: valor },
      pagina: 0,
    }));
  }

  function limparFiltros() {
    setBusca((atual) => ({
      filtros: { ...atual.filtros, categoria: "", marca: "" },
      pagina: 0,
    }));

    filtrosRef.current?.querySelector("select")?.focus();
  }

  function voltarAoCatalogo() {
    const formulario = formRef.current;

    if (formulario) {
      formulario.reset();

      const campo = formulario.elements.namedItem("termo");

      if (campo instanceof HTMLInputElement) {
        campo.focus();
      }
    }

    setBusca({ filtros: FILTROS_VAZIOS, pagina: 0 });
  }

  function mostrarMais() {
    if (estado.situacao === "carregando") {
      return;
    }

    focarNoIndice.current = estado.lista.length;
    setBusca((atual) => ({ ...atual, pagina: estado.paginasCarregadas }));
  }

  useEffect(() => {
    const indice = focarNoIndice.current;

    if (indice === null || estado.situacao === "carregando") {
      return;
    }

    focarNoIndice.current = null;

    if (estado.situacao === "sucesso") {
      gridRef.current?.children[indice]
        ?.querySelector<HTMLAnchorElement>("a")
        ?.focus();
    }
  }, [estado]);

  const { lista } = estado;
  const carregando = estado.situacao === "carregando";
  const carregandoDoComeco = carregando && busca.pagina === 0;
  const filtrando = busca.filtros.categoria !== "" || busca.filtros.marca !== "";

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.hero}>
          <h1 className={styles.title}>
            Analise qualquer produto <span>em segundos.</span>
          </h1>

          <p className={styles.subtitle}>
            Digite o nome do produto ou filtre por categoria e marca. A Venus
            traduz cada ingrediente e avisa o que importa para a sua pele.
          </p>

          <p className={styles.reacao}>
            Um produto te fez mal?{" "}
            <Link to="/reacao">Veja o que pode ter causado</Link>
          </p>
        </header>

        <form
          className={styles.form}
          role="search"
          onSubmit={handleSubmit}
          ref={formRef}
        >
          <Input
            id="termo-busca"
            name="termo"
            label="Buscar produto"
            hideLabel
            type="search"
            placeholder="Nome do produto"
            className={styles.field}
            onChange={handleChange}
          />

          <Button type="submit">Analisar</Button>
        </form>

        <fieldset className={styles.filters} ref={filtrosRef}>
          <legend className={styles.filtersLegend}>Filtrar resultados</legend>

          {opcoes.status === "carregando" ? (
            <p className={styles.status} aria-live="polite">
              Carregando as categorias e as marcas...
            </p>
          ) : null}

          {opcoes.status === "erro" ? (
            <div className={styles.filtersError}>
              <p role="alert">{opcoes.mensagem}</p>

              <Button variant="secondary" onClick={recarregarOpcoes}>
                Tentar carregar os filtros de novo
              </Button>
            </div>
          ) : null}

          {opcoes.status === "pronto" ? (
            <>
              <ListaSuspensa
                id="filtro-categoria"
                label="Categoria"
                placeholder="Todas as categorias"
                options={opcoes.opcoes.categorias.map((nome) => ({
                  value: nome,
                  label: nome,
                }))}
                value={busca.filtros.categoria}
                onChange={(valor) => mudarFiltro("categoria", valor)}
                onClear={() => mudarFiltro("categoria", "")}
                fullWidth
              />

              <ListaSuspensa
                id="filtro-marca"
                label="Marca"
                placeholder="Todas as marcas"
                options={opcoes.opcoes.marcas.map((nome) => ({
                  value: nome,
                  label: nome,
                }))}
                value={busca.filtros.marca}
                onChange={(valor) => mudarFiltro("marca", valor)}
                onClear={() => mudarFiltro("marca", "")}
                fullWidth
              />

              {filtrando ? (
                <Button variant="text" onClick={limparFiltros}>
                  Limpar filtros
                </Button>
              ) : null}
            </>
          ) : null}
        </fieldset>

        <section className={styles.results} aria-labelledby="titulo-resultados">
          <h2 id="titulo-resultados" className={styles.resultsTitle}>
            {semFiltro(busca.filtros) ? "Catálogo completo" : "Resultados da busca"}
          </h2>

          <p className={styles.status} role="status">
            {textoDeStatus(estado, busca)}
          </p>

          {estado.situacao === "erro" ? (
            <p className={styles.error} role="alert">
              {estado.mensagem}
            </p>
          ) : null}

          {estado.situacao === "sucesso" &&
          lista.length === 0 &&
          semFiltro(busca.filtros) ? (
            <div className={styles.empty}>
              <h3 className={styles.emptyTitle}>Nada por aqui</h3>

              <p className={styles.emptyText}>
                O catálogo não tem produtos no momento.
              </p>
            </div>
          ) : null}

          {estado.situacao === "sucesso" &&
          lista.length === 0 &&
          !semFiltro(busca.filtros) ? (
            <div className={styles.empty}>
              <h3 className={styles.emptyTitle}>Não achamos esse produto</h3>

              <p className={styles.emptyText}>
                Confira a grafia do nome, com os acentos, ou tire algum filtro.
              </p>

              <p className={styles.emptyText}>
                <strong>Está com o produto em mãos?</strong> Busque pela foto
                do rótulo. Se ele não estiver no catálogo, instale o app Venus
                no celular e escaneie o produto com ele na mão: ele entra no
                catálogo para toda a comunidade.
              </p>

              <div className={styles.emptyActions}>
                <Button to="/escanear">Buscar pela foto do rótulo</Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={voltarAoCatalogo}
                >
                  Ver catálogo completo
                </Button>
              </div>
            </div>
          ) : null}

          {lista.length > 0 ? (
            <ul
              ref={gridRef}
              className={carregandoDoComeco ? styles.gridBusy : styles.grid}
              aria-busy={carregandoDoComeco}
            >
              {lista.map((produto) => (
                <li key={produto.slug}>
                  <ProductCard produto={produto} />
                </li>
              ))}
            </ul>
          ) : null}

          {estado.temMais && !carregandoDoComeco ? (
            <Button
              variant="secondary"
              className={styles.more}
              onClick={mostrarMais}
              aria-disabled={carregando}
            >
              {carregando ? "Carregando mais produtos..." : "Mostrar mais produtos"}
            </Button>
          ) : null}
        </section>
      </div>
    </MainLayout>
  );
}

export default Pesquisa;
