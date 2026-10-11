import { useCallback, useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { lerTextoDaImagem } from "../../services/ocr";
import { buscarProdutos } from "../../services/produtos";
import { TIPOS_DE_IMAGEM, validarFoto } from "../../services/avatar";
import type { TextoLido } from "../../types/escanear";
import type { Produto } from "../../types/produto";
import {
  DESCRICAO_DO_EXEMPLO,
  gerarImagemDeExemplo,
} from "../../utils/imagemDeExemplo";
import {
  procurarPeloTexto,
  temTextoLegivel,
} from "../../utils/identificacaoDoProduto";
import { usePreviaDaFoto } from "../../hooks/usePreviaDaFoto";
import Button from "../../components/Button";
import MainLayout from "../../components/MainLayout";
import Modal from "../../components/Modal";
import PhotoDropZone from "../../components/PhotoDropZone";
import ProductCard from "../../components/ProductCard";
import styles from "./styles.module.css";

interface ImagemLida {
  arquivo: Blob;
  texto: TextoLido;
}

type Busca =
  | { situacao: "ocioso" }
  | { situacao: "lendo" }
  | { situacao: "procurando"; imagem: ImagemLida }
  | { situacao: "encontrados"; imagem: ImagemLida; produtos: Produto[] }
  | {
      situacao: "nenhum";
      imagem: ImagemLida;
      daMesmaMarca: Produto[];
      parecidos: Produto[];
    }
  | { situacao: "erro"; mensagem: string; imagem: ImagemLida | null };

interface Ampliada {
  titulo: string;
  descricao: string;
  arquivo: Blob;
}

interface Escaneamento {
  busca: Busca;
  ampliada: Ampliada | null;
}

const SEM_TEXTO =
  "Não achamos texto nesta imagem. Mande uma foto ou um print em que o nome e a marca do produto apareçam.";

const PASSOS = [
  {
    numero: "01",
    titulo: "Envie uma imagem do produto",
    texto: (
      <>
        Pode ser a frente da embalagem, o verso ou o print da página do produto
        numa loja. O importante é <strong>o nome e a marca</strong> aparecerem.
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
    titulo: "Não está no catálogo? Adicione pelo app",
    texto: (
      <>
        Instale o app Venus no celular e escaneie o produto com ele na mão. Ele
        entra no catálogo <strong>para toda a comunidade</strong>.
      </>
    ),
  },
];

const DICAS = [
  { texto: "Enquadre o nome e a marca do produto, sem reflexo.", evitar: false },
  { texto: "Rótulos amassados? Estique a embalagem com os dedos.", evitar: false },
  {
    texto: "No computador, o print da página do produto também funciona.",
    evitar: false,
  },
  { texto: "Evite fotos tremidas ou muito escuras.", evitar: true },
];

const INICIAL: Escaneamento = {
  busca: { situacao: "ocioso" },
  ampliada: null,
};

function alvoDoFoco(busca: Busca): string | null {
  switch (busca.situacao) {
    case "ocioso":
      return "foto-do-rotulo";
    case "encontrados":
    case "nenhum":
      return "titulo-do-resultado";
    default:
      return null;
  }
}

function imagemDaBusca(busca: Busca): ImagemLida | null {
  return "imagem" in busca ? busca.imagem : null;
}

function Escanear() {
  const [estado, setEstado] = useState<Escaneamento>(INICIAL);
  const { busca } = estado;
  const imagem = imagemDaBusca(busca);
  const previa = usePreviaDaFoto(imagem?.arquivo ?? null);
  const previaAmpliada = usePreviaDaFoto(estado.ampliada?.arquivo ?? null);
  const ocupado = busca.situacao === "lendo" || busca.situacao === "procurando";
  const alvo = alvoDoFoco(busca);
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

  const pesquisar = useCallback(
    async (arquivo: Blob) => {
      if (ocupado) {
        return;
      }

      setEstado((atual) => ({ ...atual, busca: { situacao: "lendo" } }));

      let lida: ImagemLida | null = null;

      try {
        lida = { arquivo, texto: await lerTextoDaImagem(arquivo) };

        if (!temTextoLegivel(lida.texto.lines)) {
          setEstado((atual) => ({
            ...atual,
            busca: { situacao: "erro", mensagem: SEM_TEXTO, imagem: null },
          }));
          return;
        }

        const imagemLida = lida;

        setEstado((atual) => ({
          ...atual,
          busca: { situacao: "procurando", imagem: imagemLida },
        }));

        const { candidatos, daMesmaMarca, parecidos } = procurarPeloTexto(
          imagemLida.texto.lines,
          await buscarProdutos(),
        );

        setEstado((atual) => ({
          ...atual,
          busca:
            candidatos.length > 0
              ? { situacao: "encontrados", imagem: imagemLida, produtos: candidatos }
              : { situacao: "nenhum", imagem: imagemLida, daMesmaMarca, parecidos },
        }));
      } catch (erro) {
        const imagemComErro = lida;

        setEstado((atual) => ({
          ...atual,
          busca: {
            situacao: "erro",
            mensagem:
              erro instanceof Error
                ? erro.message
                : "Não foi possível procurar o produto agora.",
            imagem: imagemComErro,
          },
        }));
      }
    },
    [ocupado],
  );

  const receberArquivo = useCallback(
    (arquivo: File) => {
      const problema = validarFoto(arquivo);

      if (problema !== null) {
        setEstado((atual) => ({
          ...atual,
          busca: { situacao: "erro", mensagem: problema, imagem: null },
        }));
        return;
      }

      void pesquisar(arquivo);
    },
    [pesquisar],
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
      busca: {
        situacao: "erro",
        mensagem: "Não foi possível criar a imagem de exemplo.",
        imagem: null,
      },
    }));
  }

  async function usarExemplo() {
    try {
      await pesquisar(await gerarImagemDeExemplo());
    } catch {
      falharComExemplo();
    }
  }

  async function verExemplo() {
    try {
      const arquivo = await gerarImagemDeExemplo();

      setEstado((atual) => ({
        ...atual,
        ampliada: {
          titulo: "Imagem de exemplo",
          descricao: DESCRICAO_DO_EXEMPLO,
          arquivo,
        },
      }));
    } catch {
      falharComExemplo();
    }
  }

  function verImagemEnviada() {
    if (imagem === null) {
      return;
    }

    setEstado((atual) => ({
      ...atual,
      ampliada: {
        titulo: "Imagem enviada",
        descricao: "A imagem que você enviou para a busca.",
        arquivo: imagem.arquivo,
      },
    }));
  }

  function tentarDeNovo() {
    if (imagem !== null) {
      void pesquisar(imagem.arquivo);
    }
  }

  function fecharAmpliada() {
    setEstado((atual) => ({ ...atual, ampliada: null }));
  }

  function recomecar() {
    setEstado(INICIAL);
  }

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
            Cole (<kbd>Ctrl</kbd> + <kbd>V</kbd>), arraste ou envie uma foto ou
            um print do produto. A Venus lê o rótulo e procura a análise no
            catálogo.
          </p>
        </header>

        <div className={styles.grid}>
          <section className={styles.envio} aria-labelledby="titulo-envio">
            <h2 id="titulo-envio" className="texto-oculto">
              Buscar pela imagem
            </h2>

            {imagem === null ? (
              <PhotoDropZone
                inputId="foto-do-rotulo"
                title="Solte a foto do rótulo aqui"
                description={
                  <>
                    Cole com <kbd>Ctrl</kbd> + <kbd>V</kbd>, arraste o arquivo,
                    ou clique para escolher no computador. Quanto mais nítidos o
                    nome e a marca, melhor a busca.
                  </>
                }
                accept={TIPOS_DE_IMAGEM.join(",")}
                busy={ocupado}
                onFile={receberArquivo}
                onExample={usarExemplo}
                onPreviewExample={verExemplo}
              />
            ) : (
              <div className={styles.lida}>
                {previa !== null ? (
                  <button
                    type="button"
                    className={styles.miniaturaBotao}
                    onClick={verImagemEnviada}
                  >
                    <img className={styles.miniatura} src={previa} alt="" />
                    <span className="texto-oculto">Ver a imagem enviada</span>
                  </button>
                ) : null}

                <span className={styles.lidaTexto}>Imagem enviada</span>

                <Button variant="text" onClick={recomecar} disabled={ocupado}>
                  Buscar com outra imagem
                </Button>
              </div>
            )}

            <p className={styles.status} aria-live="polite">
              {busca.situacao === "lendo"
                ? "Lendo a imagem. A primeira leitura pode demorar um pouco."
                : busca.situacao === "procurando"
                  ? "Procurando o produto no catálogo."
                  : ""}
            </p>

            {busca.situacao === "erro" ? (
              <div className={styles.resultado}>
                <p className={styles.erro} role="alert">
                  {busca.mensagem}
                </p>

                {busca.imagem !== null ? (
                  <Button variant="secondary" onClick={tentarDeNovo}>
                    Tentar de novo
                  </Button>
                ) : null}
              </div>
            ) : null}

            {busca.situacao === "encontrados" ? (
              <div className={styles.resultado}>
                <h3
                  id="titulo-do-resultado"
                  className={styles.resultadoTitulo}
                  tabIndex={-1}
                >
                  Achamos no catálogo
                </h3>

                <p className={styles.resultadoTexto}>
                  É um destes? Abra a análise completa.
                </p>

                <ul className={styles.candidatos}>
                  {busca.produtos.map((produto) => (
                    <li key={produto.slug}>
                      <ProductCard produto={produto} />
                    </li>
                  ))}
                </ul>

                <p className={styles.resultadoTexto}>
                  Não é nenhum destes? Procure pelo nome ou tente outra imagem.
                </p>

                <div className={styles.acoes}>
                  <Button variant="secondary" to="/pesquisa">
                    Procurar pelo nome
                  </Button>
                </div>
              </div>
            ) : null}

            {busca.situacao === "nenhum" ? (
              <div className={styles.resultado}>
                <h3
                  id="titulo-do-resultado"
                  className={styles.resultadoTitulo}
                  tabIndex={-1}
                >
                  Não achamos esse produto
                </h3>

                <p className={styles.resultadoTexto}>
                  A imagem pode não mostrar o nome e a marca, ou o produto
                  ainda não está no catálogo. Procure pelo nome ou tente outra
                  imagem. Se ele não estiver lá, adicione pelo app Venus no
                  celular.
                </p>

                {busca.daMesmaMarca.length > 0 ? (
                  <section
                    className={styles.sugestoes}
                    aria-labelledby="titulo-da-mesma-marca"
                  >
                    <h4 id="titulo-da-mesma-marca" className={styles.sugestoesTitulo}>
                      Outros produtos da {busca.daMesmaMarca[0].brand.name}
                    </h4>

                    <ul className={styles.candidatos}>
                      {busca.daMesmaMarca.map((produto) => (
                        <li key={produto.slug}>
                          <ProductCard produto={produto} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {busca.parecidos.length > 0 ? (
                  <section
                    className={styles.sugestoes}
                    aria-labelledby="titulo-dos-parecidos"
                  >
                    <h4 id="titulo-dos-parecidos" className={styles.sugestoesTitulo}>
                      Com nome parecido
                    </h4>

                    <ul className={styles.candidatos}>
                      {busca.parecidos.map((produto) => (
                        <li key={produto.slug}>
                          <ProductCard produto={produto} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <div className={styles.acoes}>
                  <Button variant="secondary" to="/pesquisa">
                    Procurar pelo nome
                  </Button>
                  <Button variant="secondary" onClick={recomecar}>
                    Tentar outra imagem
                  </Button>
                </div>

                <details className={styles.textoLido}>
                  <summary>Ver o texto que a Venus leu</summary>
                  <pre
                    className={styles.textoLidoConteudo}
                    tabIndex={0}
                    aria-label="Texto lido na imagem"
                  >
                    {busca.imagem.texto.fullText}
                  </pre>
                </details>
              </div>
            ) : null}
          </section>

          <aside className={styles.lateral} aria-label="Como funciona a busca">
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
