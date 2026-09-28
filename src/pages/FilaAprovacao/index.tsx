import { useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import Button from "../../components/Button";
import DetalheCandidato from "../../components/DetalheCandidato";
import LayoutAdmin from "../../components/LayoutAdmin";
import ModalAprovacao from "../../components/ModalAprovacao";
import type { IngredienteACriar } from "../../components/ModalAprovacao";
import ModalRecusa from "../../components/ModalRecusa";
import Selo from "../../components/Selo";
import { useAutenticacaoAdmin } from "../../hooks/useAutenticacaoAdmin";
import { useCandidato } from "../../hooks/useCandidato";
import { useCatalogoDaRevisao } from "../../hooks/useCatalogoDaRevisao";
import { useFilaAprovacao } from "../../hooks/useFilaAprovacao";
import type { EstadoFila } from "../../hooks/useFilaAprovacao";
import {
  aprovarPendente,
  recusarPendente,
  sincronizarPendente,
} from "../../services/admin";
import {
  ErroCandidatoNaoEncontrado,
  ErroRevisaoEmConflito,
  ErroRevisaoInvalida,
  ErroSessaoAdminExpirada,
} from "../../services/erros";
import type {
  AprovacaoCandidato,
  Candidato,
  OrigemCandidato,
  RecusaCandidato,
} from "../../types/admin";
import { tempoRelativo } from "../../utils/tempoRelativo";
import {
  ORIGENS,
  ROTULO_ORIGEM,
  ROTULO_ORIGEM_DETALHE,
  lerOrigemDaUrl,
  rotuloDePendencias,
} from "./rotulos";
import { nomeCurto } from "../../utils/nomeCurto";
import styles from "./styles.module.css";

interface Filtro {
  id: string;
  origem: OrigemCandidato | null;
  rotulo: string;
}

const FILTROS: Filtro[] = [
  { id: "todas", origem: null, rotulo: "Todas" },
  ...ORIGENS.map((origem) => ({
    id: origem,
    origem,
    rotulo: ROTULO_ORIGEM[origem],
  })),
];

type ModalAberto = "nenhum" | "aprovar" | "recusar";

type PedidoDeDecisao =
  | { tipo: "aprovar"; aprovacao: AprovacaoCandidato }
  | { tipo: "recusar"; recusa: RecusaCandidato };

interface EstadoDecisao {
  modal: ModalAberto;
  aprovacao: AprovacaoCandidato | null;
  enviando: boolean;
  mensagem: string;
  detalhes: string[];
  anuncio: string;
  semSincronizar: string | null;
}

const SEM_DECISAO: EstadoDecisao = {
  modal: "nenhum",
  aprovacao: null,
  enviando: false,
  mensagem: "",
  detalhes: [],
  anuncio: "",
  semSincronizar: null,
};

function novosDaAprovacao(
  aprovacao: AprovacaoCandidato | null,
): IngredienteACriar[] {
  if (aprovacao === null) {
    return [];
  }

  return aprovacao.ingredients.flatMap((decisao) =>
    decisao.action === "create"
      ? [{ position: decisao.position, inciName: decisao.inciName }]
      : [],
  );
}

function anunciar(estado: EstadoFila): string {
  if (estado.status === "carregando") {
    return "Carregando a fila.";
  }

  if (estado.status === "pronto") {
    const total = estado.itens.length;

    return total === 1 ? "1 produto na fila." : `${total} produtos na fila.`;
  }

  return "";
}

function FilaAprovacao() {
  const { administrador, sair } = useAutenticacaoAdmin();
  const { id } = useParams<{ id: string }>();
  const [busca] = useSearchParams();
  const localizacao = useLocation();
  const navegar = useNavigate();

  const origem = lerOrigemDaUrl(busca.get("origem"));
  const idSelecionado = id === undefined ? null : id;
  const { estado, recarregar } = useFilaAprovacao(origem);
  const estadoCandidato = useCandidato(idSelecionado);
  const { estado: catalogo, recarregar: recarregarCatalogo } =
    useCatalogoDaRevisao();
  const [decisao, setDecisao] = useState<EstadoDecisao>(SEM_DECISAO);
  const tituloFilaRef = useRef<HTMLHeadingElement>(null);

  const podeDecidir =
    administrador !== null && administrador.role !== "analyst";

  function abrirRecusa() {
    setDecisao((atual) => ({
      ...atual,
      modal: "recusar",
      mensagem: "",
      detalhes: [],
    }));
  }

  function fecharModal() {
    setDecisao((atual) => ({
      ...atual,
      modal: "nenhum",
      aprovacao: null,
      mensagem: "",
      detalhes: [],
    }));
  }

  function proximoDaFila(atual: string): string | null {
    if (estado.status !== "pronto") {
      return null;
    }

    const posicao = estado.itens.findIndex((item) => item.id === atual);
    const vizinho = estado.itens[posicao + 1] ?? estado.itens[posicao - 1];

    return vizinho === undefined ? null : vizinho.id;
  }

  function pedirAprovacao(
    candidato: Candidato,
    aprovacao: AprovacaoCandidato,
  ) {
    if (novosDaAprovacao(aprovacao).length > 0) {
      setDecisao((atual) => ({
        ...atual,
        modal: "aprovar",
        aprovacao,
        mensagem: "",
        detalhes: [],
      }));
      return;
    }

    void executar(candidato, { tipo: "aprovar", aprovacao });
  }

  function avancar(atual: string, anuncio: string) {
    const proximo = proximoDaFila(atual);

    setDecisao({ ...SEM_DECISAO, anuncio });
    recarregar();
    navegar({
      pathname: proximo === null ? "/admin/fila" : `/admin/fila/${proximo}`,
      search: localizacao.search,
    });

    if (proximo === null) {
      tituloFilaRef.current?.focus();
    }
  }

  function tratarErro(erro: unknown) {
    if (erro instanceof ErroSessaoAdminExpirada) {
      void sair();
      return;
    }

    setDecisao((atual) => ({
      ...atual,
      modal: erro instanceof ErroRevisaoInvalida ? "nenhum" : atual.modal,
      enviando: false,
      mensagem:
        erro instanceof Error ? erro.message : "Não foi possível concluir.",
      detalhes: erro instanceof ErroRevisaoInvalida ? erro.detalhes : [],
    }));

    if (
      erro instanceof ErroCandidatoNaoEncontrado ||
      erro instanceof ErroRevisaoEmConflito
    ) {
      recarregar();
    }
  }

  async function executar(candidato: Candidato, pedido: PedidoDeDecisao) {
    setDecisao((atual) => ({
      ...atual,
      enviando: true,
      mensagem: "",
      detalhes: [],
    }));

    try {
      if (pedido.tipo === "recusar") {
        await recusarPendente(candidato.id, pedido.recusa);
        avancar(candidato.id, `${candidato.name} recusado.`);
        return;
      }

      const resultado = await aprovarPendente(candidato.id, pedido.aprovacao);

      if (resultado === "sincronizacaoFalhou") {
        setDecisao({
          ...SEM_DECISAO,
          semSincronizar: candidato.id,
          anuncio: `${candidato.name} aprovado, mas ainda não entrou no catálogo.`,
        });
        recarregar();
        return;
      }

      avancar(candidato.id, `${candidato.name} aprovado e publicado no catálogo.`);
    } catch (erro) {
      tratarErro(erro);
    }
  }

  async function sincronizar(candidato: Candidato) {
    setDecisao((atual) => ({
      ...atual,
      enviando: true,
      mensagem: "",
      detalhes: [],
    }));

    try {
      const resultado = await sincronizarPendente(candidato.id);

      if (resultado === "publicado") {
        avancar(candidato.id, `${candidato.name} publicado no catálogo.`);
        return;
      }

      setDecisao((atual) => ({
        ...atual,
        enviando: false,
        mensagem:
          "A API ainda não conseguiu publicar. Tente de novo em instantes.",
      }));
    } catch (erro) {
      tratarErro(erro);
    }
  }

  return (
    <LayoutAdmin onSair={() => void sair()}>
      <div className={styles.pagina}>
        <section className={styles.fila} aria-labelledby="titulo-fila">
          <div className={styles.topo}>
            <h1
              id="titulo-fila"
              ref={tituloFilaRef}
              className={styles.titulo}
              tabIndex={-1}
            >
              Fila de aprovação
            </h1>

            <nav aria-label="Filtrar por origem">
              <ul className={styles.filtros}>
                {FILTROS.map((filtro) => (
                  <li key={filtro.id}>
                    <Link
                      className={styles.filtro}
                      to={{
                        pathname: localizacao.pathname,
                        search:
                          filtro.origem === null
                            ? ""
                            : `?origem=${filtro.origem}`,
                      }}
                      aria-current={filtro.origem === origem ? "true" : undefined}
                    >
                      {filtro.rotulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <p className="texto-oculto" aria-live="polite">
            {anunciar(estado)}
          </p>

          {estado.status === "carregando" ? (
            <p className={styles.estado}>Carregando a fila...</p>
          ) : null}

          {estado.status === "erro" ? (
            <div className={styles.estadoErro}>
              <p role="alert">{estado.mensagem}</p>

              <Button variant="secondary" onClick={recarregar}>
                Tentar de novo
              </Button>
            </div>
          ) : null}

          {estado.status === "pronto" && estado.itens.length === 0 ? (
            <p className={styles.estado}>
              {origem === null
                ? "Nenhum produto aguardando aprovação. A fila está em dia."
                : `Nenhum produto de ${ROTULO_ORIGEM[origem]} aguardando aprovação.`}
            </p>
          ) : null}

          {estado.status === "pronto" && estado.itens.length > 0 ? (
            <ul className={styles.lista} aria-label="Produtos pendentes">
              {estado.itens.map((item) => {
                const selecionado = item.id === idSelecionado;

                return (
                  <li
                    key={item.id}
                    className={selecionado ? styles.itemAtivo : styles.item}
                  >
                    <div className={styles.linha}>
                      <Link
                        className={styles.itemLink}
                        to={{
                          pathname: `/admin/fila/${item.id}`,
                          search: localizacao.search,
                        }}
                        aria-current={selecionado ? "page" : undefined}
                      >
                        {item.name}
                      </Link>

                      <time
                        className={styles.suave}
                        dateTime={item.submittedAt}
                      >
                        {tempoRelativo(item.submittedAt)}
                      </time>
                    </div>

                    <div className={styles.linha}>
                      <span className={styles.suave}>
                        {item.brand}
                        <span aria-hidden="true"> · </span>
                        {item.category}
                      </span>

                      <span className={styles.suave}>
                        por {nomeCurto(item.submittedBy)}
                      </span>
                    </div>

                    <div className={styles.selos}>
                      <Selo label={ROTULO_ORIGEM[item.origin]} />
                      <Selo
                        label={rotuloDePendencias(
                          item.newIngredientCount,
                          item.ambiguousIngredientCount,
                        )}
                        variant={
                          item.newIngredientCount +
                            item.ambiguousIngredientCount >
                          0
                            ? "destaque"
                            : "contorno"
                        }
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </section>

        <section className={styles.detalhe} aria-label="Produto selecionado">
          {estadoCandidato.status === "nenhum" ? (
            <p className={styles.estado}>
              Selecione um produto da fila para revisar.
            </p>
          ) : null}

          {estadoCandidato.status === "carregando" ? (
            <p className={styles.estado} aria-live="polite">
              Carregando o produto...
            </p>
          ) : null}

          {estadoCandidato.status === "erro" ? (
            <div className={styles.estadoErro}>
              <p role="alert">{estadoCandidato.mensagem}</p>

              <Link
                className={styles.voltar}
                to={{ pathname: "/admin/fila", search: localizacao.search }}
              >
                Voltar para a fila
              </Link>
            </div>
          ) : null}

          {estadoCandidato.status === "pronto" ? (
            <DetalheCandidato
              key={estadoCandidato.candidato.id}
              candidato={estadoCandidato.candidato}
              rotuloDaOrigem={
                ROTULO_ORIGEM_DETALHE[estadoCandidato.candidato.origin]
              }
              rotuloDosNovos={rotuloDePendencias(
                estadoCandidato.candidato.newIngredientCount,
                estadoCandidato.candidato.ambiguousIngredientCount,
              )}
              catalogo={catalogo}
              podeDecidir={podeDecidir}
              enviando={decisao.enviando}
              semSincronizar={
                decisao.semSincronizar === estadoCandidato.candidato.id
              }
              mensagemDeErro={
                decisao.modal === "nenhum" ? decisao.mensagem : ""
              }
              detalhesDoErro={decisao.modal === "nenhum" ? decisao.detalhes : []}
              onTentarCatalogo={recarregarCatalogo}
              onAprovar={(aprovacao) =>
                pedirAprovacao(estadoCandidato.candidato, aprovacao)
              }
              onRecusar={abrirRecusa}
              onSincronizar={() => void sincronizar(estadoCandidato.candidato)}
            />
          ) : null}
        </section>
      </div>

      <p className="texto-oculto" aria-live="polite">
        {decisao.anuncio}
      </p>

      {estadoCandidato.status === "pronto" ? (
        <>
          <ModalAprovacao
            open={decisao.modal === "aprovar"}
            nomeDoProduto={estadoCandidato.candidato.name}
            novos={novosDaAprovacao(decisao.aprovacao)}
            enviando={decisao.enviando}
            mensagemDeErro={decisao.mensagem}
            onConfirmar={() => {
              if (decisao.aprovacao !== null) {
                void executar(estadoCandidato.candidato, {
                  tipo: "aprovar",
                  aprovacao: decisao.aprovacao,
                });
              }
            }}
            onClose={fecharModal}
          />

          <ModalRecusa
            open={decisao.modal === "recusar"}
            candidato={estadoCandidato.candidato}
            rotuloDaOrigem={
              ROTULO_ORIGEM_DETALHE[estadoCandidato.candidato.origin]
            }
            enviando={decisao.enviando}
            mensagemDeErro={decisao.mensagem}
            onConfirmar={(recusa) =>
              void executar(estadoCandidato.candidato, {
                tipo: "recusar",
                recusa,
              })
            }
            onClose={fecharModal}
          />
        </>
      ) : null}
    </LayoutAdmin>
  );
}

export default FilaAprovacao;
