import { useEffect, useRef, useState } from "react";

interface Transcricao {
  readonly transcript: string;
}

interface ResultadoDaFala {
  readonly length: number;
  readonly [indice: number]: Transcricao;
}

interface ResultadosDaFala {
  readonly length: number;
  readonly [indice: number]: ResultadoDaFala;
}

interface EventoDeResultado extends Event {
  readonly results: ResultadosDaFala;
}

interface EventoDeErro extends Event {
  readonly error: string;
}

interface Reconhecimento {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((evento: EventoDeResultado) => void) | null;
  onerror: ((evento: EventoDeErro) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type ConstrutorDeReconhecimento = new () => Reconhecimento;

type JanelaComFala = Window & {
  SpeechRecognition?: ConstrutorDeReconhecimento;
  webkitSpeechRecognition?: ConstrutorDeReconhecimento;
};

export type EstadoDoDitado =
  | { status: "parado"; anuncio: string }
  | { status: "ouvindo" }
  | { status: "erro"; mensagem: string };

const MENSAGENS_DE_ERRO: Record<string, string> = {
  "not-allowed":
    "O navegador não deixou usar o microfone. Libere o microfone nas configurações do site e tente de novo.",
  "service-not-allowed":
    "O navegador não deixou usar o microfone. Libere o microfone nas configurações do site e tente de novo.",
  "no-speech": "Não ouvimos nada. Aperte o microfone e fale de novo.",
  "audio-capture": "Não encontramos um microfone ligado.",
  network: "O ditado precisa de internet. Confira a conexão e tente de novo.",
};

const ERRO_GENERICO = "Não deu para usar o ditado agora. Você pode digitar a pergunta.";

function construtorDoNavegador(): ConstrutorDeReconhecimento | null {
  const janela: JanelaComFala = window;

  return janela.SpeechRecognition ?? janela.webkitSpeechRecognition ?? null;
}

function textoDoResultado(resultados: ResultadosDaFala): string {
  const partes: string[] = [];

  for (let indice = 0; indice < resultados.length; indice += 1) {
    partes.push(resultados[indice][0].transcript);
  }

  return partes.join(" ").trim();
}

export function useDitado(aoReconhecer: (texto: string) => void) {
  const [estado, setEstado] = useState<EstadoDoDitado>({
    status: "parado",
    anuncio: "",
  });
  const reconhecimentoRef = useRef<Reconhecimento | null>(null);
  const aoReconhecerRef = useRef(aoReconhecer);
  const disponivel = construtorDoNavegador() !== null;

  useEffect(() => {
    aoReconhecerRef.current = aoReconhecer;
  }, [aoReconhecer]);

  useEffect(() => {
    return () => reconhecimentoRef.current?.abort();
  }, []);

  function comecar() {
    const Construtor = construtorDoNavegador();

    if (Construtor === null) {
      return;
    }

    const reconhecimento = new Construtor();
    let ouviuAlgo = false;

    reconhecimento.lang = "pt-BR";
    reconhecimento.continuous = false;
    reconhecimento.interimResults = false;

    reconhecimento.onresult = (evento) => {
      const texto = textoDoResultado(evento.results);

      if (texto !== "") {
        ouviuAlgo = true;
        aoReconhecerRef.current(texto);
      }
    };

    reconhecimento.onerror = (evento) => {
      if (evento.error === "aborted") {
        return;
      }

      setEstado({
        status: "erro",
        mensagem: MENSAGENS_DE_ERRO[evento.error] ?? ERRO_GENERICO,
      });
    };

    reconhecimento.onend = () => {
      reconhecimentoRef.current = null;
      setEstado((atual) =>
        atual.status === "erro"
          ? atual
          : {
              status: "parado",
              anuncio: ouviuAlgo
                ? "Pronto. O texto ditado está no campo: revise e envie."
                : "",
            },
      );
    };

    reconhecimentoRef.current = reconhecimento;
    setEstado({ status: "ouvindo" });

    try {
      reconhecimento.start();
    } catch {
      reconhecimentoRef.current = null;
      setEstado({ status: "erro", mensagem: ERRO_GENERICO });
    }
  }

  function alternar() {
    if (reconhecimentoRef.current !== null) {
      reconhecimentoRef.current.stop();
      return;
    }

    comecar();
  }

  return { disponivel, estado, alternar };
}
