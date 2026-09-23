import { useEffect, useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";
import type { ErroResumo } from "../components/ResumoErros";
import { buscarCatalogoAlergias } from "../services/alergias";
import { buscarPerfil, paraRespostas, salvarPerfil } from "../services/perfil";
import type { AlergiaCatalogo } from "../types/perfil";
import type { RespostasQuestionario } from "../types/questionario";
import type { CondicaoPele } from "../types/usuario";
import {
  guardarProgresso,
  lerProgresso,
  limparProgresso,
} from "../utils/progressoQuestionario";
import {
  validarFaixaEtaria,
  validarGravidadeDasAlergias,
} from "../utils/validacao";

export const TOTAL_PERGUNTAS = 11;
export const TOTAL_PERGUNTAS_DE_SAUDE = 7;

export type EstadoCatalogo =
  | { status: "loading" }
  | { status: "success"; options: AlergiaCatalogo[] }
  | { status: "error" };

type SituacaoEnvio = "ocioso" | "enviando" | "sucesso" | "erro";

interface ErrosQuestionario {
  ageRange: string | null;
  allergies: string | null;
}

export interface EstadoFormulario {
  erros: ErrosQuestionario;
  situacao: SituacaoEnvio;
  mensagem: string;
  aguardandoDecisao: boolean;
}

export interface Questionario {
  respostas: RespostasQuestionario;
  responder: <Campo extends keyof RespostasQuestionario>(
    campo: Campo,
    valor: RespostasQuestionario[Campo],
  ) => void;
  trocarCondicoes: (marcadas: CondicaoPele[]) => void;
  catalogo: EstadoCatalogo;
  tentarCatalogoDeNovo: () => void;
  formulario: EstadoFormulario;
  itensDoResumo: ErroResumo[];
  respostasDeSaude: number;
  resumoRef: RefObject<HTMLDivElement>;
  decisaoRef: RefObject<HTMLDivElement>;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  enviar: () => void;
  voltarParaConsentimento: () => void;
  salvarProgresso: () => void;
}

const SEM_ERROS: ErrosQuestionario = { ageRange: null, allergies: null };

const RESPOSTAS_INICIAIS: RespostasQuestionario = {
  gender: "",
  hairCurvature: "",
  skinType: "",
  ageRange: "",
  skinPhototype: "",
  skinSensitivity: "",
  scalpType: "",
  allergies: [],
  preferences: [],
  healthDataConsent: false,
  currentSituation: "",
  skinConditions: [],
};

function contarRespostasDeSaude(respostas: RespostasQuestionario): number {
  const campos = [
    respostas.skinType,
    respostas.skinPhototype,
    respostas.skinSensitivity,
    respostas.scalpType,
    respostas.currentSituation,
  ];

  const respondidos = campos.filter((valor) => valor !== "").length;
  const condicoes = respostas.skinConditions.length > 0 ? 1 : 0;
  const alergias = respostas.allergies.length > 0 ? 1 : 0;

  return respondidos + condicoes + alergias;
}

export function useQuestionario(): Questionario {
  const [respostas, setRespostas] = useState<RespostasQuestionario>(
    () => lerProgresso() ?? RESPOSTAS_INICIAIS,
  );
  const [temRascunho] = useState(() => lerProgresso() !== null);
  const [catalogo, setCatalogo] = useState<EstadoCatalogo>({
    status: "loading",
  });
  const [tentativaCatalogo, setTentativaCatalogo] = useState(0);
  const [formulario, setFormulario] = useState<EstadoFormulario>({
    erros: SEM_ERROS,
    situacao: "ocioso",
    mensagem: "",
    aguardandoDecisao: false,
  });
  const resumoRef = useRef<HTMLDivElement>(null);
  const decisaoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controle = new AbortController();
    let ativo = true;

    buscarCatalogoAlergias(controle.signal)
      .then((options) => {
        if (ativo) {
          setCatalogo({ status: "success", options });
        }
      })
      .catch(() => {
        if (ativo) {
          setCatalogo({ status: "error" });
        }
      });

    return () => {
      ativo = false;
      controle.abort();
    };
  }, [tentativaCatalogo]);

  useEffect(() => {
    if (temRascunho) {
      return;
    }

    let ativo = true;

    buscarPerfil()
      .then((carregado) => {
        if (!ativo || carregado === null) {
          return;
        }

        setRespostas((atual) =>
          atual === RESPOSTAS_INICIAIS ? paraRespostas(carregado.perfil) : atual,
        );
      })
      .catch(() => undefined);

    return () => {
      ativo = false;
    };
  }, [temRascunho]);

  useEffect(() => {
    const temErro =
      formulario.erros.ageRange !== null || formulario.erros.allergies !== null;

    if (temErro) {
      resumoRef.current?.focus();
    }
  }, [formulario.erros]);

  useEffect(() => {
    if (formulario.aguardandoDecisao) {
      decisaoRef.current?.focus();
    }
  }, [formulario.aguardandoDecisao]);

  function responder<Campo extends keyof RespostasQuestionario>(
    campo: Campo,
    valor: RespostasQuestionario[Campo],
  ) {
    setRespostas((atual) => ({ ...atual, [campo]: valor }));
  }

  function trocarCondicoes(marcadas: CondicaoPele[]) {
    const ultima = marcadas[marcadas.length - 1];
    const semNenhuma = marcadas.filter((condicao) => condicao !== "none");

    setRespostas((atual) => ({
      ...atual,
      skinConditions: ultima === "none" ? ["none"] : semNenhuma,
    }));
  }

  function tentarCatalogoDeNovo() {
    setCatalogo({ status: "loading" });
    setTentativaCatalogo((atual) => atual + 1);
  }

  function voltarParaConsentimento() {
    setFormulario((atual) => ({ ...atual, aguardandoDecisao: false }));

    const caixa = document.getElementById("consentimento-saude");

    caixa?.scrollIntoView();
    caixa?.focus({ preventScroll: true });
  }

  function salvarProgresso() {
    guardarProgresso(respostas);
  }

  async function enviarRespostas() {
    setFormulario((atual) => ({
      ...atual,
      situacao: "enviando",
      aguardandoDecisao: false,
    }));

    try {
      await salvarPerfil(respostas);
      limparProgresso();

      setFormulario((atual) => ({ ...atual, situacao: "sucesso" }));
    } catch (erro) {
      setFormulario((atual) => ({
        ...atual,
        situacao: "erro",
        mensagem:
          erro instanceof Error ? erro.message : "Não foi possível salvar.",
      }));
    }
  }

  function validarEEnviar() {
    const alergias = respostas.healthDataConsent ? respostas.allergies : [];

    const erros: ErrosQuestionario = {
      ageRange: validarFaixaEtaria(respostas.ageRange),
      allergies: validarGravidadeDasAlergias(alergias),
    };

    const temErro = Object.values(erros).some((mensagem) => mensagem !== null);

    setFormulario((atual) => ({
      ...atual,
      erros,
      situacao: "ocioso",
      aguardandoDecisao: false,
    }));

    if (!temErro) {
      void enviarRespostas();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const saudeSemConsentimento =
      !respostas.healthDataConsent && contarRespostasDeSaude(respostas) > 0;

    if (saudeSemConsentimento) {
      setFormulario((atual) => ({
        ...atual,
        erros: SEM_ERROS,
        situacao: "ocioso",
        aguardandoDecisao: true,
      }));

      return;
    }

    validarEEnviar();
  }

  const itensDoResumo: ErroResumo[] = [
    { id: "faixa-etaria", mensagem: formulario.erros.ageRange },
    { id: "busca-alergias", mensagem: formulario.erros.allergies },
  ].flatMap((item) =>
    item.mensagem === null ? [] : [{ id: item.id, mensagem: item.mensagem }],
  );

  return {
    respostas,
    responder,
    trocarCondicoes,
    catalogo,
    tentarCatalogoDeNovo,
    formulario,
    itensDoResumo,
    respostasDeSaude: contarRespostasDeSaude(respostas),
    resumoRef,
    decisaoRef,
    handleSubmit,
    enviar: () => void enviarRespostas(),
    voltarParaConsentimento,
    salvarProgresso,
  };
}
