import { useEffect, useRef, useState } from "react";
import { buscarProdutos } from "../../services/produtos";
import type { Produto } from "../../types/produto";
import type { ChangeEvent, FormEvent } from "react";
import MainLayout from "../../components/MainLayout";
import Button from "../../components/Button";
import Input from "../../components/Input";
import ProductCard from "../../components/ProductCard";
import styles from "./styles.module.css";

type EstadoBusca =
  | { situacao: "carregando"; listaAnterior: Produto[] }
  | { situacao: "sucesso"; lista: Produto[] }
  | { situacao: "erro"; mensagem: string };

function listaVisivel(estado: EstadoBusca): Produto[] {
  if (estado.situacao === "carregando") {
    return estado.listaAnterior;
  }

  if (estado.situacao === "sucesso") {
    return estado.lista;
  }

  return [];
}

function textoDeStatus(estado: EstadoBusca, termo: string): string {
  if (estado.situacao === "carregando") {
    return termo === ""
      ? "Carregando os produtos do catálogo."
      : `Buscando produtos para "${termo}".`;
  }

  if (estado.situacao === "erro") {
    return "";
  }

  const total = estado.lista.length;

  if (total === 0) {
    return `Nenhum produto encontrado para "${termo}".`;
  }

  if (termo === "") {
    return `Mostrando os ${total} produtos do catálogo.`;
  }

  return total === 1
    ? `1 produto encontrado para "${termo}".`
    : `${total} produtos encontrados para "${termo}".`;
}

function Pesquisa() {
  const [estado, setEstado] = useState<EstadoBusca>({
    situacao: "carregando",
    listaAnterior: [],
  });
  const [termo, setTermo] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const valor = new FormData(event.currentTarget).get("termo");
    setTermo(typeof valor === "string" ? valor.trim() : "");
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.value === "") {
      setTermo("");
    }
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

    setTermo("");
  }

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setEstado((atual) => ({
        situacao: "carregando",
        listaAnterior: atual.situacao === "sucesso" ? atual.lista : [],
      }));

      try {
        const lista = await buscarProdutos(termo);

        if (ativo) {
          setEstado({ situacao: "sucesso", lista });
        }
      } catch {
        if (ativo) {
          setEstado({
            situacao: "erro",
            mensagem: "Não foi possível carregar os produtos.",
          });
        }
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [termo]);

  const lista = listaVisivel(estado);
  const carregando = estado.situacao === "carregando";

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.hero}>
          <h1 className={styles.title}>
            Analise qualquer produto <span>em segundos.</span>
          </h1>

          <p className={styles.subtitle}>
            Digite o nome do produto ou da marca. A Venus traduz cada
            ingrediente e avisa o que importa para a sua pele.
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
            placeholder="Nome do produto ou da marca"
            className={styles.field}
            onChange={handleChange}
          />

          <Button type="submit">Analisar</Button>
        </form>

        <section className={styles.results} aria-labelledby="titulo-resultados">
          <h2 id="titulo-resultados" className={styles.resultsTitle}>
            {termo === "" ? "Catálogo completo" : "Resultados da busca"}
          </h2>

          <p className={styles.status} role="status">
            {textoDeStatus(estado, termo)}
          </p>

          {estado.situacao === "erro" ? (
            <p className={styles.error} role="alert">
              {estado.mensagem}
            </p>
          ) : null}

          {estado.situacao === "sucesso" && estado.lista.length === 0 ? (
            <div className={styles.empty}>
              <h3 className={styles.emptyTitle}>Nada por aqui ainda</h3>

              <p className={styles.emptyText}>
                Confira a grafia do nome ou tente pela marca. Também é possível
                voltar e olhar o catálogo inteiro.
              </p>

              {termo === "" ? null : (
                <Button type="button" onClick={voltarAoCatalogo}>
                  Ver catálogo completo
                </Button>
              )}
            </div>
          ) : null}

          {lista.length > 0 ? (
            <ul
              className={carregando ? styles.gridBusy : styles.grid}
              aria-busy={carregando}
            >
              {lista.map((produto) => (
                <li key={produto.slug}>
                  <ProductCard produto={produto} />
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </MainLayout>
  );
}

export default Pesquisa;
