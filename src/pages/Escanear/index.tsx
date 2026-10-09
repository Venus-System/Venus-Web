import { useCallback, useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { lerFotoDoScan } from "../../services/ocr";
import { enviarScan, novoScanId } from "../../services/escanear";
import { TIPOS_DE_IMAGEM, validarFoto } from "../../services/avatar";
import type {
  FotoLida,
  LadoDoScan,
  MotivoDeBloqueio,
} from "../../types/escanear";
import { gerarImagemDeExemplo } from "../../utils/imagemDeExemplo";
import { localizarIngredientes } from "../../utils/leituraDoRotulo";
import { motivoDoBloqueio } from "../../utils/qualidadeDaFoto";
import { usePreviaDaFoto } from "../../hooks/usePreviaDaFoto";
import { useProdutosParecidos } from "../../hooks/useProdutosParecidos";
import Button from "../../components/Button";
import MainLayout from "../../components/MainLayout";
import PhotoDropZone from "../../components/PhotoDropZone";
import ScanReview from "../../components/ScanReview";
import type { DadosDaRevisao } from "../../components/ScanReview";
import styles from "./styles.module.css";

type Leitura =
  | { situacao: "ocioso" }
  | { situacao: "lendo"; lado: LadoDoScan }
  | { situacao: "erro"; mensagem: string };

type Envio =
  | { situacao: "ocioso" }
  | { situacao: "enviando" }
  | { situacao: "erro"; mensagem: string }
  | { situacao: "enviado" };

interface Escaneamento {
  scanId: string;
  startedAt: string;
  verso: FotoLida | null;
  frente: FotoLida | null;
  usouExemplo: boolean;
  leitura: Leitura;
  avisos: string[];
  nomeBuscado: string;
  envio: Envio;
}

const MENSAGENS_DE_BLOQUEIO: Record<MotivoDeBloqueio, string> = {
  BLUR_TOO_HIGH:
    "A foto saiu tremida ou desfocada. Tente de novo com a câmera parada e a lista em foco.",
  TOO_DARK: "A foto ficou escura demais. Tente de novo com mais luz.",
  TOO_BRIGHT:
    "A foto ficou clara demais, provavelmente com reflexo ou luz direta. Tente de novo com uma luz mais suave.",
};

const AVISO_DE_FUNDO =
  "O fundo da foto não está uniforme. Se a leitura sair ruim, tente sobre uma superfície lisa.";

const AVISO_SEM_LISTA =
  'Não achamos o título da lista de ingredientes ("Ingredientes" ou "Composição") nesta foto. Você pode seguir e conferir o texto na revisão, ou trocar a foto.';

const PASSOS = [
  {
    numero: "01",
    titulo: "Encontre a lista de ingredientes",
    texto: (
      <>
        É a parte de trás da embalagem, geralmente depois da palavra{" "}
        <strong>"Ingredients:"</strong>. Luz natural ajuda na leitura.
      </>
    ),
  },
  {
    numero: "02",
    titulo: "A Venus lê e procura no catálogo",
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
        Os ingredientes já vêm preenchidos. Complete nome e marca, envie, e o
        produto entra no catálogo <strong>para toda a comunidade</strong>.
      </>
    ),
  },
];

const DICAS = [
  { texto: "Enquadre só a lista de ingredientes, sem reflexo.", evitar: false },
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
    verso: null,
    frente: null,
    usouExemplo: false,
    leitura: { situacao: "ocioso" },
    avisos: [],
    nomeBuscado: "",
    envio: { situacao: "ocioso" },
  };
}

function avisosDaFoto(foto: FotoLida, lado: LadoDoScan): string[] {
  const avisos: string[] = [];

  if (!foto.qualidade.backgroundOk) {
    avisos.push(AVISO_DE_FUNDO);
  }

  if (lado === "back" && !localizarIngredientes(foto.lines).encontrado) {
    avisos.push(AVISO_SEM_LISTA);
  }

  return avisos;
}

function Escanear() {
  const [estado, setEstado] = useState<Escaneamento>(novoEscaneamento);
  const previaDoVerso = usePreviaDaFoto(estado.verso?.arquivo ?? null);
  const previaDaFrente = usePreviaDaFoto(estado.frente?.arquivo ?? null);
  const parecidos = useProdutosParecidos(estado.nomeBuscado);
  const tituloDoEnviadoRef = useRef<HTMLHeadingElement>(null);
  const enviado = estado.envio.situacao === "enviado";

  useEffect(() => {
    if (enviado) {
      tituloDoEnviadoRef.current?.focus();
    }
  }, [enviado]);

  const lado: LadoDoScan | null =
    estado.verso === null ? "back" : estado.frente === null ? "front" : null;
  const lendo = estado.leitura.situacao === "lendo";

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

        if (bloqueio !== null) {
          setEstado((atual) => ({
            ...atual,
            leitura: { situacao: "erro", mensagem: MENSAGENS_DE_BLOQUEIO[bloqueio] },
          }));
          return;
        }

        setEstado((atual) => ({
          ...atual,
          verso: lado === "back" ? foto : atual.verso,
          frente: lado === "front" ? foto : atual.frente,
          usouExemplo: atual.usouExemplo || exemplo,
          leitura: { situacao: "ocioso" },
          avisos: avisosDaFoto(foto, lado),
        }));
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
    [lado, lendo],
  );

  const receberArquivo = useCallback(
    (arquivo: File) => {
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
    [ler],
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

  async function usarExemplo() {
    if (lado === null) {
      return;
    }

    try {
      await ler(await gerarImagemDeExemplo(lado), true);
    } catch {
      setEstado((atual) => ({
        ...atual,
        leitura: {
          situacao: "erro",
          mensagem: "Não foi possível criar a imagem de exemplo.",
        },
      }));
    }
  }

  function trocar(ladoParaTrocar: LadoDoScan) {
    setEstado((atual) => ({
      ...atual,
      verso: ladoParaTrocar === "back" ? null : atual.verso,
      frente: ladoParaTrocar === "front" ? null : atual.frente,
      leitura: { situacao: "ocioso" },
      avisos: [],
    }));
  }

  function recomecar() {
    setEstado(novoEscaneamento());
  }

  async function enviar(dados: DadosDaRevisao) {
    const { verso, frente } = estado;

    if (verso === null || frente === null) {
      return;
    }

    setEstado((atual) => ({ ...atual, envio: { situacao: "enviando" } }));

    try {
      await enviarScan({
        scanId: estado.scanId,
        startedAt: estado.startedAt,
        verso,
        frente,
        usouExemplo: estado.usouExemplo,
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

  const trecho =
    estado.verso === null ? null : localizarIngredientes(estado.verso.lines);

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
            Cole (<kbd>Ctrl</kbd> + <kbd>V</kbd>), arraste ou envie a foto da
            lista de ingredientes. Se o produto ainda não estiver no catálogo,
            você mesmo adiciona e ele passa a valer para todo mundo.
          </p>
        </header>

        <div className={styles.grid}>
          <section className={styles.envio} aria-labelledby="titulo-envio">
            <h2 id="titulo-envio" className="texto-oculto">
              Fotos do rótulo
            </h2>

            {lado === "back" ? (
              <PhotoDropZone
                inputId="foto-do-verso"
                step="Foto 1 de 2: lista de ingredientes"
                title="Solte a foto do rótulo aqui"
                description={
                  <>
                    Cole com <kbd>Ctrl</kbd> + <kbd>V</kbd>, arraste o arquivo,
                    ou clique para escolher no computador. Quanto mais nítida a
                    lista de ingredientes, melhor a leitura.
                  </>
                }
                accept={TIPOS_DE_IMAGEM.join(",")}
                busy={lendo}
                onFile={receberArquivo}
                onExample={usarExemplo}
              />
            ) : null}

            {lado === "front" ? (
              <PhotoDropZone
                inputId="foto-da-frente"
                step="Foto 2 de 2: frente da embalagem"
                title="Agora, a frente da embalagem"
                description={
                  <>
                    A frente mostra o nome e a marca, e ajuda a equipe a
                    conferir o produto. Cole com <kbd>Ctrl</kbd> +{" "}
                    <kbd>V</kbd>, arraste o arquivo, ou clique para escolher no
                    computador.
                  </>
                }
                accept={TIPOS_DE_IMAGEM.join(",")}
                busy={lendo}
                onFile={receberArquivo}
                onExample={usarExemplo}
              />
            ) : null}

            <p className={styles.status} aria-live="polite">
              {estado.leitura.situacao === "lendo"
                ? estado.leitura.lado === "back"
                  ? "Lendo a lista de ingredientes. A primeira leitura pode demorar um pouco."
                  : "Lendo a frente da embalagem."
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

            {(estado.verso !== null || estado.frente !== null) && !enviado ? (
              <ul className={styles.lidas} aria-label="Fotos lidas">
                {estado.verso !== null && previaDoVerso !== null ? (
                  <li className={styles.lida}>
                    <img
                      className={styles.miniatura}
                      src={previaDoVerso}
                      alt="Foto da lista de ingredientes que você enviou"
                    />
                    <span className={styles.lidaTexto}>Lista de ingredientes</span>
                    <Button
                      variant="text"
                      onClick={() => trocar("back")}
                      disabled={estado.envio.situacao === "enviando"}
                    >
                      Trocar a foto da lista
                    </Button>
                  </li>
                ) : null}

                {estado.frente !== null && previaDaFrente !== null ? (
                  <li className={styles.lida}>
                    <img
                      className={styles.miniatura}
                      src={previaDaFrente}
                      alt="Foto da frente da embalagem que você enviou"
                    />
                    <span className={styles.lidaTexto}>Frente da embalagem</span>
                    <Button
                      variant="text"
                      onClick={() => trocar("front")}
                      disabled={estado.envio.situacao === "enviando"}
                    >
                      Trocar a foto da frente
                    </Button>
                  </li>
                ) : null}
              </ul>
            ) : null}

            {lado === null && trecho !== null && estado.verso !== null && !enviado ? (
              <ScanReview
                key={estado.scanId}
                initialIngredients={trecho.texto}
                fullText={estado.verso.fullText}
                similar={parecidos}
                sending={estado.envio.situacao === "enviando"}
                errorMessage={
                  estado.envio.situacao === "erro" ? estado.envio.mensagem : null
                }
                onNameBlur={(nome) =>
                  setEstado((atual) => ({ ...atual, nomeBuscado: nome }))
                }
                onSubmit={enviar}
                onRestart={recomecar}
              />
            ) : null}

            {enviado ? (
              <div className={styles.pronto}>
                <h3
                  ref={tituloDoEnviadoRef}
                  className={styles.prontoTitulo}
                  tabIndex={-1}
                >
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
      </div>
    </MainLayout>
  );
}

export default Escanear;
