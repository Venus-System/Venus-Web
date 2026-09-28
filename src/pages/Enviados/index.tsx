import Button from "../../components/Button";
import MainLayout from "../../components/MainLayout";
import SegmentedNav from "../../components/SegmentedNav";
import type { SegmentedNavItem } from "../../components/SegmentedNav";
import SubmissionRow from "../../components/SubmissionRow";
import { useEnvios } from "../../hooks/useEnvios";
import type { Envio } from "../../types/envio";
import styles from "./styles.module.css";

const ABAS: SegmentedNavItem[] = [
  { to: "/historico", label: "Histórico", end: true, emBreve: true },
  { to: "/favoritos", label: "Favoritos", emBreve: true },
  { to: "/historico/enviados", label: "Enviados" },
];

interface GrupoDeEnvios {
  id: string;
  titulo: string;
  envios: Envio[];
}

function agrupar(envios: Envio[]): GrupoDeEnvios[] {
  const grupos = [
    {
      id: "em-analise",
      titulo: "Em análise",
      envios: envios.filter((envio) => envio.status === "in_review"),
    },
    {
      id: "decididos",
      titulo: "Já decididos",
      envios: envios.filter((envio) => envio.status !== "in_review"),
    },
  ];

  return grupos.filter((grupo) => grupo.envios.length > 0);
}

function Enviados() {
  const { estado, recarregar } = useEnvios();
  const envios = estado.status === "pronto" ? estado.envios : null;

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Tudo que você <span className={styles.destaque}>enviou.</span>
          </h1>
          <p className={styles.subtitle}>
            Os produtos que você mandou para a Venus analisar. A equipe confere
            cada um antes de ele entrar no catálogo.
          </p>
        </header>

        <SegmentedNav label="Meu espaço" items={ABAS} />

        <p className="texto-oculto" aria-live="polite">
          {estado.status === "carregando" ? "Carregando os seus envios." : ""}
        </p>

        {estado.status === "carregando" ? (
          <p className={styles.estado}>Carregando os seus envios...</p>
        ) : null}

        {estado.status === "erro" ? (
          <div className={styles.erro}>
            <p role="alert">{estado.mensagem}</p>

            <Button variant="secondary" onClick={recarregar}>
              Tentar de novo
            </Button>
          </div>
        ) : null}

        {envios !== null && !envios.listAvailable ? (
          <p className={styles.vazio}>
            Ainda não conseguimos listar seus envios aqui na web. Assim que
            essa lista estiver disponível, os produtos que você enviou pelo app
            aparecem nesta página.
          </p>
        ) : null}

        {envios !== null &&
        envios.listAvailable &&
        envios.submissions.length === 0 ? (
          <p className={styles.vazio}>
            Você ainda não enviou nenhum produto para análise. Quando um
            produto não estiver na Venus, você pode enviar a foto do rótulo
            pelo app.
          </p>
        ) : null}

        {envios === null
          ? null
          : agrupar(envios.submissions).map((grupo) => (
              <section
                key={grupo.id}
                className={styles.secao}
                aria-labelledby={`titulo-${grupo.id}`}
              >
                <h2 id={`titulo-${grupo.id}`} className={styles.secaoTitulo}>
                  {grupo.titulo}
                </h2>

                <ul className={styles.lista}>
                  {grupo.envios.map((envio) => (
                    <li key={envio.id}>
                      <SubmissionRow envio={envio} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
      </div>
    </MainLayout>
  );
}

export default Enviados;
