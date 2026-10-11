import { useCallback, useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { lerFotoDoScan } from "../../services/ocr";
import { enviarScan, novoScanId } from "../../services/escanear";
import { buscarProdutos } from "../../services/produtos";
import { TIPOS_DE_IMAGEM, validarFoto } from "../../services/avatar";
import type {
  FotoLida,
  LadoDoScan,
  MotivoDeBloqueio,
} from "../../types/escanear";
import type { Produto } from "../../types/produto";
import {
  PRODUTO_DE_EXEMPLO,
  gerarImagemDeExemplo,
} from "../../utils/imagemDeExemplo";
import {
  candidatosDoCatalogo,
  temTextoLegivel,
} from "../../utils/identificacaoDoProduto";
import { localizarIngredientes } from "../../utils/leituraDoRotulo";
import { motivoDoBloqueio } from "../../utils/qualidadeDaFoto";
import { usePreviaDaFoto } from "../../hooks/usePreviaDaFoto";
import Button from "../../components/Button";
import MainLayout from "../../components/MainLayout";
import Modal from "../../components/Modal";
import PhotoDropZone from "../../components/PhotoDropZone";
import ProductCard from "../../components/ProductCard";
import ScanReview from "../../components/ScanReview";
import type { DadosDaRevisao } from "../../components/ScanReview";
import styles from "./styles.module.css";

type Leitura =
  | { situacao: "ocioso" }
  | { situacao: "lendo"; lado: LadoDoScan }
  | { situacao: "erro"; mensagem: string };

type Identificacao =
  | { situacao: "pendente" }
  | { situacao: "procurando" }
  | { situacao: "encontrados"; produtos: Produto[] }
  | { situacao: "erro"; mensagem: string }
  | { situacao: "seguir" };

type Envio =
  | { situacao: "ocioso" }
  | { situacao: "enviando" }
  | { situacao: "erro"; mensagem: string }
  | { situacao: "enviado" };

interface FotoAmpliada {
  titulo: string;
  descricao: string;
  arquivo: Blob;
}

interface Escaneamento {
  scanId: string;
  startedAt: string;
  frente: FotoLida | null;
  verso: FotoLida | null;
  exemplos: Record<LadoDoScan, boolean>;
  leitura: Leitura;
  identificacao: Identificacao;
  avisos: string[];
  envio: Envio;
  ampliada: FotoAmpliada | null;
}

type Etapa = "frente" | "catalogo" | "verso" | "revisao" | "enviado";

const MENSAGENS_DE_BLOQUEIO: Record<MotivoDeBloqueio, string> = {
  BLUR_TOO_HIGH:
    "A foto saiu tremida ou desfocada. Tente de novo com a câmera parada e o rótulo em foco.",
  TOO_DARK: "A foto ficou escura demais. Tente de novo com mais luz.",
  TOO_BRIGHT:
    "A foto ficou clara demais, provavelmente com reflexo ou luz direta. Tente de novo com uma luz mais suave.",
};

const SEM_TEXTO: Record<LadoDoScan, string> = {
  front:
    "Não achamos texto nesta foto. Mostre a frente da embalagem, com o nome e a marca à vista.",
  back: "Não achamos texto nesta foto. Mostre o verso da embalagem, onde fica a lista de ingredientes.",
};

const SEM_LISTA =
  'Não achamos a lista de ingredientes nesta foto. Mostre a parte que começa com "Ingredientes" ou "Composição" e tente de novo.';

const AVISO_DE_FUNDO =
  "O fundo da foto não está uniforme. Se a leitura sair ruim, tente sobre uma superfície lisa.";

const FORA_DO_CATALOGO =
  "Não achamos esse produto no catálogo. Você pode adicioná-lo: agora mande a foto da lista de ingredientes.";

const DESCRICAO_DO_EXEMPLO: Record<LadoDoScan, string> = {
  front: `Imagem de exemplo com a frente do ${PRODUTO_DE_EXEMPLO.productName}, da ${PRODUTO_DE_EXEMPLO.brand}.`,
  back: "Imagem de exemplo com o verso de um sérum: a lista de ingredientes, o modo de uso e a origem.",
};

const PASSOS = [
  {
    numero: "01",
    titulo: "Fotografe a frente da embalagem",
    texto: (
      <>
        Com o nome e a marca à vista. Luz natural ajuda na leitura.
      </>
    ),
  },
  {
    numero: "02",
    titulo: "A Venus procura no catálogo",
    texto: (
      <>
        Se o produto já estiver cadastrado, você vai direto para a análise
        completa.
      </>
    ),
  },
  {
    numero: "03",
    titulo: "Não está no catálogo? Você adiciona",
    texto: (
      <>
        Mande a lista de ingredientes, geralmente depois da palavra{" "}
        <strong>"Ingredients:"</strong>. Os ingredientes já vêm preenchidos:
        confira, complete nome e marca, envie, e o produto entra no catálogo{" "}
        <strong>para toda a comunidade</strong>.
      </>
    ),
  },
];

const DICAS = [
  { texto: "Enquadre só o rótulo, sem reflexo.", evitar: false },
  { texto: "Rótulos amassados? Estique a embalagem com os dedos.", evitar: false },
  {
    texto: "No computador, o print da página do produto também funciona.",
    evitar: false,
  },
  { texto: "Evite fotos tremidas ou muito escuras.", evitar: true },
];

function novoEscaneamento(): Escaneamento {
  return {
    scanId: novoScanId(),
    startedAt: new Date().toISOString(),
    frente: null,
    verso: null,
    exemplos: { front: false, back: false },
    leitura: { situacao: "ocioso" },
    identificacao: { situacao: "pendente" },
    avisos: [],
    envio: { situacao: "ocioso" },
    ampliada: null,
  };
}

function etapaAtual(estado: Escaneamento): Etapa {
  if (estado.envio.situacao === "enviado") {
    return "enviado";
  }

  if (estado.frente === null) {
    return "frente";
  }

  if (estado.identificacao.situacao !== "seguir") {
    return "catalogo";
  }

  return estado.verso === null ? "verso" : "revisao";
}

function alvoDoFoco(etapa: Etapa, estado: Escaneamento): string | null {
  switch (etapa) {
    case "frente":
      return "foto-da-frente";
    case "catalogo":
      return estado.identificacao.situacao === "encontrados"
        ? "titulo-do-catalogo"
        : null;
    case "verso":
      return "foto-do-verso";
    case "revisao":
      return "nome-do-produto";
    case "enviado":
      return "titulo-do-envio";
  }
}

function Escanear() {
  const [estado, setEstado] = useState<Escaneamento>(novoEscaneamento);
  const previaDaFrente = usePreviaDaFoto(estado.frente?.arquivo ?? null);
  const previaDoVerso = usePreviaDaFoto(estado.verso?.arquivo ?? null);
  const previaAmpliada = usePreviaDaFoto(estado.ampliada?.arquivo ?? null);

  const etapa = etapaAtual(estado);
  const lado: LadoDoScan | null =
    etapa === "frente" ? "front" : etapa === "verso" ? "back" : null;
  const lendo = estado.leitura.situacao === "lendo";
  const enviando = estado.envio.situacao === "enviando";
  const alvo = alvoDoFoco(etapa, estado);
  const alvoAnteriorRef = useRef<string | null>(alvo);

  useEffect(() => {
    if (alvoAnteriorRef.current === alvo) {
      return;
    }

    alvoAnteriorRef.current = alvo;

    if (alvo !== null) {
      document.getElementById(alvo)?.focus();
    }
  }, [alvo]);

  const procurarNoCatalogo = useCallback(async (frente: FotoLida) => {
    try {
      const candidatos = candidatosDoCatalogo(frente.lines, await buscarProdutos());

      setEstado((atual) =>
        atual.frente !== frente
          ? atual
          : {
              ...atual,
              identificacao:
                candidatos.length > 0
                  ? { situacao: "encontrados", produtos: candidatos }
                  : { situacao: "seguir" },
              avisos:
                candidatos.length > 0 ? atual.avisos : [...atual.avisos, FORA_DO_CATALOGO],
            },
      );
    } catch {
      setEstado((atual) =>
        atual.frente !== frente
          ? atual
          : {
              ...atual,
              identificacao: {
                situacao: "erro",
                mensagem:
                  "Não foi possível procurar no catálogo agora. Você pode seguir e adicionar o produto.",
              },
            },
      );
    }
  }, []);

  const ler = useCallback(
    async (arquivo: Blob, exemplo: boolean) => {
      if (lado === null || lendo) {
        return;
      }

      setEstado((atual) => ({
        ...atual,
        leitura: { situacao: "lendo", lado },
        avisos: [],
      }));

      try {
        const foto = await lerFotoDoScan(arquivo, lado);
        const bloqueio = motivoDoBloqueio(foto.qualidade);
        const problema =
          bloqueio !== null
            ? MENSAGENS_DE_BLOQUEIO[bloqueio]
            : !temTextoLegivel(foto.lines)
              ? SEM_TEXTO[lado]
              : lado === "back" && !localizarIngredientes(foto.lines).encontrado
                ? SEM_LISTA
                : null;

        if (problema !== null) {
          setEstado((atual) => ({
            ...atual,
            leitura: { situacao: "erro", mensagem: problema },
          }));
          return;
        }

        const avisos = foto.qualidade.backgroundOk ? [] : [AVISO_DE_FUNDO];

        setEstado((atual) => ({
          ...atual,
          frente: lado === "front" ? foto : atual.frente,
          verso: lado === "back" ? foto : atual.verso,
          exemplos: { ...atual.exemplos, [lado]: exemplo },
          identificacao:
            lado === "front" ? { situacao: "procurando" } : atual.identificacao,
          leitura: { situacao: "ocioso" },
          avisos,
        }));

        if (lado === "front") {
          await procurarNoCatalogo(foto);
        }
      } catch (erro) {
        setEstado((atual) => ({
          ...atual,
          leitura: {
            situacao: "erro",
            mensagem:
              erro instanceof Error
                ? erro.message
                : "Não foi possível ler esta foto.",
          },
        }));
      }
    },
    [lado, lendo, procurarNoCatalogo],
  );

  const receberArquivo = useCallback(
    (arquivo: File) => {
      if (lado === null) {
        return;
      }

      const problema = validarFoto(arquivo);

      if (problema !== null) {
        setEstado((atual) => ({
          ...atual,
          leitura: { situacao: "erro", mensagem: problema },
        }));
        return;
      }

      void ler(arquivo, false);
    },
    [lado, ler],
  );

  useEffect(() => {
    function handleColar(evento: ClipboardEvent) {
      const arquivo = evento.clipboardData?.files[0];

      if (arquivo !== undefined) {
        evento.preventDefault();
        receberArquivo(arquivo);
      }
    }

    window.addEventListener("paste", handleColar);

    return () => window.removeEventListener("paste", handleColar);
  }, [receberArquivo]);

  function falharComExemplo() {
    setEstado((atual) => ({
      ...atual,
      leitura: {
        situacao: "erro",
        mensagem: "Não foi possível criar a imagem de exemplo.",
      },
    }));
  }

  async function usarExemplo() {
    if (lado === null) {
      return;
    }

    try {
      await ler(await gerarImagemDeExemplo(lado), true);
    } catch {
      falharComExemplo();
    }
  }

  async function verExemplo() {
    if (lado === null) {
      return;
    }

    try {
      const arquivo = await gerarImagemDeExemplo(lado);

      setEstado((atual) => ({
        ...atual,
        ampliada: {
          titulo: "Imagem de exemplo",
          descricao: DESCRICAO_DO_EXEMPLO[lado],
          arquivo,
        },
      }));
    } catch {
      falharComExemplo();
    }
  }

  function ampliar(foto: FotoLida, titulo: string, descricao: string) {
    setEstado((atual) => ({
      ...atual,
      ampliada: { titulo, descricao, arquivo: foto.arquivo },
    }));
  }

  function fecharAmpliada() {
    setEstado((atual) => ({ ...atual, ampliada: null }));
  }

  function seguirParaAdicionar() {
    setEstado((atual) => ({
      ...atual,
      identificacao: { situacao: "seguir" },
      avisos: [],
    }));
  }

  function trocar(ladoParaTrocar: LadoDoScan) {
    setEstado((atual) => ({
      ...atual,
      frente: ladoParaTrocar === "front" ? null : atual.frente,
      verso: ladoParaTrocar === "back" ? null : atual.verso,
      exemplos: { ...atual.exemplos, [ladoParaTrocar]: false },
      identificacao:
        ladoParaTrocar === "front" ? { situacao: "pendente" } : atual.identificacao,
      leitura: { situacao: "ocioso" },
      avisos: [],
    }));
  }

  function recomecar() {
    setEstado(novoEscaneamento());
  }

  async function enviar(dados: DadosDaRevisao) {
    const { frente, verso } = estado;

    if (frente === null || verso === null) {
      return;
    }

    setEstado((atual) => ({ ...atual, envio: { situacao: "enviando" } }));

    try {
      await enviarScan({
        scanId: estado.scanId,
        startedAt: estado.startedAt,
        frente,
        verso,
        usouExemplo: estado.exemplos.front || estado.exemplos.back,
        ...dados,
      });
      setEstado((atual) => ({ ...atual, envio: { situacao: "enviado" } }));
    } catch (erro) {
      setEstado((atual) => ({
        ...atual,
        envio: {
          situacao: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível enviar o produto.",
        },
      }));
    }
  }

  const textoDaDica = (
    <>
      Cole com <kbd>Ctrl</kbd> + <kbd>V</kbd>, arraste o arquivo, ou clique
      para escolher no computador.
    </>
  );

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.hero}>
          <h1 className={styles.title}>
            Envie a foto{" "}
            <span className={styles.linha}>
              do <span className={styles.destaque}>rótulo.</span>
            </span>
          </h1>

          <p className={styles.subtitle}>
            Cole (<kbd>Ctrl</kbd> + <kbd>V</kbd>), arraste ou envie a foto do
            produto. A Venus procura no catálogo e, se ele ainda não estiver lá,
            você mesmo adiciona e ele passa a valer para todo mundo.
          </p>
        </header>

        <div className={styles.grid}>
          <section className={styles.envio} aria-labelledby="titulo-envio">
            <h2 id="titulo-envio" className="texto-oculto">
              Fotos do rótulo
            </h2>

            {etapa === "frente" ? (
              <PhotoDropZone
                inputId="foto-da-frente"
                step="Foto 1 de 2: frente da embalagem"
                title="Solte a foto do rótulo aqui"
                description={
                  <>
                    Comece pela frente, com o nome e a marca. {textoDaDica}
                  </>
                }
                accept={TIPOS_DE_IMAGEM.join(",")}
                busy={lendo}
                onFile={receberArquivo}
                onExample={usarExemplo}
                onPreviewExample={verExemplo}
              />
            ) : null}

            {etapa === "verso" ? (
              <PhotoDropZone
                inputId="foto-do-verso"
                step="Foto 2 de 2: lista de ingredientes"
                title="Agora, a lista de ingredientes"
                description={
                  <>
                    Fotografe o verso, onde fica a lista. {textoDaDica} Quanto
                    mais nítida a lista, melhor a leitura.
                  </>
                }
                accept={TIPOS_DE_IMAGEM.join(",")}
                busy={lendo}
                onFile={receberArquivo}
                onExample={usarExemplo}
                onPreviewExample={verExemplo}
              />
            ) : null}

            <p className={styles.status} aria-live="polite">
              {estado.leitura.situacao === "lendo"
                ? estado.leitura.lado === "front"
                  ? "Lendo a frente da embalagem. A primeira leitura pode demorar um pouco."
                  : "Lendo a lista de ingredientes."
                : estado.identificacao.situacao === "procurando"
                  ? "Procurando o produto no catálogo."
                  : ""}
            </p>

            {estado.leitura.situacao === "erro" ? (
              <p className={styles.erro} role="alert">
                {estado.leitura.mensagem}
              </p>
            ) : null}

            {estado.avisos.length > 0 ? (
              <ul className={styles.avisos} role="status">
                {estado.avisos.map((aviso) => (
                  <li key={aviso}>{aviso}</li>
                ))}
              </ul>
            ) : null}

            {etapa === "catalogo" && estado.identificacao.situacao === "encontrados" ? (
              <div className={styles.catalogo}>
                <h3
                  id="titulo-do-catalogo"
                  className={styles.prontoTitulo}
                  tabIndex={-1}
                >
                  Achamos no catálogo
                </h3>

                <p className={styles.prontoTexto}>
                  É um destes? Abra a análise completa.
                </p>

                <ul className={styles.candidatos}>
                  {estado.identificacao.produtos.map((produto) => (
                    <li key={produto.slug}>
                      <ProductCard produto={produto} />
                    </li>
                  ))}
                </ul>

                <Button variant="secondary" onClick={seguirParaAdicionar}>
                  Não é nenhum destes, quero adicionar
                </Button>
              </div>
            ) : null}

            {etapa === "catalogo" && estado.identificacao.situacao === "erro" ? (
              <div className={styles.catalogo}>
                <p className={styles.erro} role="alert">
                  {estado.identificacao.mensagem}
                </p>

                <Button variant="secondary" onClick={seguirParaAdicionar}>
                  Seguir para adicionar
                </Button>
              </div>
            ) : null}

            {(estado.frente !== null || estado.verso !== null) && etapa !== "enviado" ? (
              <ul className={styles.lidas} aria-label="Fotos lidas">
                {estado.frente !== null && previaDaFrente !== null ? (
                  <li className={styles.lida}>
                    <button
                      type="button"
                      className={styles.miniaturaBotao}
                      onClick={() =>
                        estado.frente !== null &&
                        ampliar(
                          estado.frente,
                          "Frente da embalagem",
                          "Foto da frente da embalagem que você enviou.",
                        )
                      }
                    >
                      <img className={styles.miniatura} src={previaDaFrente} alt="" />
                      <span className="texto-oculto">Ver a foto da frente</span>
                    </button>
                    <span className={styles.lidaTexto}>Frente da embalagem</span>
                    <Button
                      variant="text"
                      onClick={() => trocar("front")}
                      disabled={lendo || enviando}
                    >
                      Trocar a foto da frente
                    </Button>
                  </li>
                ) : null}

                {estado.verso !== null && previaDoVerso !== null ? (
                  <li className={styles.lida}>
                    <button
                      type="button"
                      className={styles.miniaturaBotao}
                      onClick={() =>
                        estado.verso !== null &&
                        ampliar(
                          estado.verso,
                          "Lista de ingredientes",
                          "Foto da lista de ingredientes que você enviou.",
                        )
                      }
                    >
                      <img className={styles.miniatura} src={previaDoVerso} alt="" />
                      <span className="texto-oculto">
                        Ver a foto da lista de ingredientes
                      </span>
                    </button>
                    <span className={styles.lidaTexto}>Lista de ingredientes</span>
                    <Button
                      variant="text"
                      onClick={() => trocar("back")}
                      disabled={lendo || enviando}
                    >
                      Trocar a foto da lista
                    </Button>
                  </li>
                ) : null}
              </ul>
            ) : null}

            {etapa === "revisao" && estado.verso !== null ? (
              <ScanReview
                key={estado.scanId}
                initialName={estado.exemplos.front ? PRODUTO_DE_EXEMPLO.productName : ""}
                initialBrand={estado.exemplos.front ? PRODUTO_DE_EXEMPLO.brand : ""}
                initialIngredients={localizarIngredientes(estado.verso.lines).texto}
                fullText={estado.verso.fullText}
                sending={enviando}
                errorMessage={
                  estado.envio.situacao === "erro" ? estado.envio.mensagem : null
                }
                onSubmit={enviar}
                onRestart={recomecar}
              />
            ) : null}

            {etapa === "enviado" ? (
              <div className={styles.pronto}>
                <h3 id="titulo-do-envio" className={styles.prontoTitulo} tabIndex={-1}>
                  Produto enviado para análise!
                </h3>

                <p className={styles.prontoTexto}>
                  A equipe Venus confere os ingredientes antes de o produto
                  entrar no catálogo. Você acompanha a situação em Enviados.
                </p>

                <div className={styles.acoes}>
                  <Button to="/historico/enviados">Ver meus envios</Button>
                  <Button variant="secondary" onClick={recomecar}>
                    Enviar outro produto
                  </Button>
                </div>
              </div>
            ) : null}
          </section>

          <aside className={styles.lateral} aria-label="Como funciona o envio">
            <ol className={styles.passos}>
              {PASSOS.map((passo) => (
                <li className={styles.passo} key={passo.numero}>
                  <span className={styles.numero} aria-hidden="true">
                    {passo.numero}
                  </span>

                  <div>
                    <h2 className={styles.passoTitulo}>{passo.titulo}</h2>
                    <p className={styles.passoTexto}>{passo.texto}</p>
                  </div>
                </li>
              ))}
            </ol>

            <section className={styles.dicas} aria-labelledby="titulo-dicas">
              <h2 id="titulo-dicas" className={styles.dicasTitulo}>
                Dicas para uma boa foto
              </h2>

              <ul className={styles.listaDeDicas}>
                {DICAS.map((dica) => (
                  <li className={styles.dica} key={dica.texto}>
                    {dica.evitar ? (
                      <X className={styles.iconeDica} aria-hidden="true" />
                    ) : (
                      <Check className={styles.iconeDica} aria-hidden="true" />
                    )}
                    {dica.texto}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>

        <Modal
          open={estado.ampliada !== null}
          title={estado.ampliada?.titulo ?? ""}
          onClose={fecharAmpliada}
          size="wide"
        >
          {estado.ampliada !== null && previaAmpliada !== null ? (
            <img
              className={styles.ampliada}
              src={previaAmpliada}
              alt={estado.ampliada.descricao}
            />
          ) : null}
        </Modal>
      </div>
    </MainLayout>
  );
}

export default Escanear;
