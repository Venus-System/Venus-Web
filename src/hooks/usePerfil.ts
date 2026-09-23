import { useEffect, useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";
import type { ErroResumo } from "../components/ResumoErros";
import { buscarCatalogoAlergias } from "../services/alergias";
import { enviarFotoDePerfil } from "../services/avatar";
import { buscarPerfil, paraRespostas, salvarPerfil } from "../services/perfil";
import type { AlergiaCatalogo } from "../types/perfil";
import type { RespostasQuestionario } from "../types/questionario";
import type { CondicaoPele, StatusConta } from "../types/usuario";
import {
  validarFaixaEtaria,
  validarGravidadeDasAlergias,
} from "../utils/validacao";


export type EstadoCarregamento =
  | { status: "carregando" }
  | { status: "vazio" }
  | {
      status: "pronto";
      respostas: RespostasQuestionario;
      accountStatus: StatusConta | null;
    }
  | { status: "erro"; mensagem: string };

export type EstadoCatalogo =
  | { status: "carregando" }
  | { status: "pronto"; alergias: AlergiaCatalogo[] }
  | { status: "erro" };

type SituacaoEnvio = "ocioso" | "enviando" | "sucesso" | "erro";

export interface EstadoDaFoto {
  url: string | null;
  situacao: "ocioso" | "enviando" | "erro";
  mensagem: string;
}

const SEM_FOTO: EstadoDaFoto = { url: null, situacao: "ocioso", mensagem: "" };

interface ErrosPerfil {
  ageRange: string | null;
  allergies: string | null;
  healthDataConsent: string | null;
}

export interface EstadoEnvio {
  erros: ErrosPerfil;
  situacao: SituacaoEnvio;
  mensagem: string;
}

export interface Perfil {
  carregamento: EstadoCarregamento;
  catalogo: EstadoCatalogo;
  respostas: RespostasQuestionario | null;
  statusDaConta: StatusConta | null;
  responder: <Campo extends keyof RespostasQuestionario>(
    campo: Campo,
    valor: RespostasQuestionario[Campo],
  ) => void;
  trocarCondicoes: (marcadas: CondicaoPele[]) => void;
  revogarConsentimento: () => void;
  envio: EstadoEnvio;
  itensDoResumo: ErroResumo[];
  respostasPreenchidas: number;
  totalDeRespostas: number;
  foto: EstadoDaFoto;
  enviarFoto: (arquivo: File) => Promise<boolean>;
  resumoRef: RefObject<HTMLDivElement>;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const SEM_ERROS: ErrosPerfil = {
  ageRange: null,
  allergies: null,
  healthDataConsent: null,
};

function temRespostasDeSaude(respostas: RespostasQuestionario): boolean {
  return (
    respostas.skinType !== "" ||
    respostas.skinPhototype !== "" ||
    respostas.skinSensitivity !== "" ||
    respostas.scalpType !== "" ||
    respostas.currentSituation !== "" ||
    respostas.skinConditions.length > 0 ||
    respostas.allergies.length > 0
  );
}

const CAMPOS_BASICOS = 3;
const CAMPOS_DE_SAUDE = 6;

function contarPreenchidas(respostas: RespostasQuestionario): number {
  const basicos = [
    respostas.gender,
    respostas.hairCurvature,
    respostas.ageRange,
  ];

  const preenchidos = basicos.filter((valor) => valor !== "").length;

  if (!respostas.healthDataConsent) {
    return preenchidos;
  }

  const saude = [
    respostas.skinType,
    respostas.skinPhototype,
    respostas.skinSensitivity,
    respostas.scalpType,
    respostas.currentSituation,
  ];

  const condicoes = respostas.skinConditions.length > 0 ? 1 : 0;

  return (
    preenchidos + saude.filter((valor) => valor !== "").length + condicoes
  );
}

function totalDeRespostas(respostas: RespostasQuestionario): number {
  return respostas.healthDataConsent
    ? CAMPOS_BASICOS + CAMPOS_DE_SAUDE
    : CAMPOS_BASICOS;
}

export function usePerfil(): Perfil {
  const [carregamento, setCarregamento] = useState<EstadoCarregamento>({
    status: "carregando",
  });
  const [catalogo, setCatalogo] = useState<EstadoCatalogo>({
    status: "carregando",
  });
  const [envio, setEnvio] = useState<EstadoEnvio>({
    erros: SEM_ERROS,
    situacao: "ocioso",
    mensagem: "",
  });
  const [foto, setFoto] = useState<EstadoDaFoto>(SEM_FOTO);
  const resumoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ativo = true;

    buscarPerfil()
      .then((carregado) => {
        if (!ativo) {
          return;
        }

        if (carregado !== null) {
          setFoto((atual) => ({ ...atual, url: carregado.avatarUrl }));
        }

        setCarregamento(
          carregado === null
            ? { status: "vazio" }
            : {
                status: "pronto",
                respostas: paraRespostas(carregado.perfil),
                accountStatus: carregado.accountStatus,
              },
        );
      })
      .catch((erro: unknown) => {
        if (ativo) {
          setCarregamento({
            status: "erro",
            mensagem:
              erro instanceof Error
                ? erro.message
                : "Não foi possível carregar o seu perfil.",
          });
        }
      });

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    const controle = new AbortController();
    let ativo = true;

    buscarCatalogoAlergias(controle.signal)
      .then((alergias) => {
        if (ativo) {
          setCatalogo({ status: "pronto", alergias });
        }
      })
      .catch(() => {
        if (ativo) {
          setCatalogo({ status: "erro" });
        }
      });

    return () => {
      ativo = false;
      controle.abort();
    };
  }, []);

  useEffect(() => {
    const temErro = Object.values(envio.erros).some(
      (mensagem) => mensagem !== null,
    );

    if (temErro) {
      resumoRef.current?.focus();
    }
  }, [envio.erros]);

  const respostas =
    carregamento.status === "pronto" ? carregamento.respostas : null;

  function atualizar(
    mudanca: (atuais: RespostasQuestionario) => RespostasQuestionario,
  ) {
    setCarregamento((atual) =>
      atual.status === "pronto"
        ? { ...atual, respostas: mudanca(atual.respostas) }
        : atual,
    );
  }

  function responder<Campo extends keyof RespostasQuestionario>(
    campo: Campo,
    valor: RespostasQuestionario[Campo],
  ) {
    atualizar((atuais) => ({ ...atuais, [campo]: valor }));
  }

  function trocarCondicoes(marcadas: CondicaoPele[]) {
    const ultima = marcadas[marcadas.length - 1];
    const semNenhuma = marcadas.filter((condicao) => condicao !== "none");

    atualizar((atuais) => ({
      ...atuais,
      skinConditions: ultima === "none" ? ["none"] : semNenhuma,
    }));
  }

  async function enviarRespostas(dados: RespostasQuestionario) {
    setEnvio((atual) => ({ ...atual, situacao: "enviando" }));

    try {
      await salvarPerfil(dados);

      setEnvio({ erros: SEM_ERROS, situacao: "sucesso", mensagem: "" });
    } catch (erro) {
      setEnvio((atual) => ({
        ...atual,
        situacao: "erro",
        mensagem:
          erro instanceof Error ? erro.message : "Não foi possível salvar.",
      }));
    }
  }

  function revogarConsentimento() {
    if (respostas === null) {
      return;
    }

    const limpas: RespostasQuestionario = {
      ...respostas,
      healthDataConsent: false,
      skinType: "",
      skinPhototype: "",
      skinSensitivity: "",
      scalpType: "",
      currentSituation: "",
      skinConditions: [],
      allergies: [],
    };

    atualizar(() => limpas);
    void enviarRespostas(limpas);
  }

  async function subirFoto(arquivo: File): Promise<boolean> {
    setFoto((atual) => ({ ...atual, situacao: "enviando", mensagem: "" }));

    try {
      const url = await enviarFotoDePerfil(arquivo);

      setFoto({ url, situacao: "ocioso", mensagem: "" });

      return true;
    } catch (erro) {
      setFoto((atual) => ({
        ...atual,
        situacao: "erro",
        mensagem:
          erro instanceof Error
            ? erro.message
            : "Não foi possível salvar a sua foto de perfil.",
      }));

      return false;
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (respostas === null) {
      return;
    }

    const saudeSemConsentimento =
      !respostas.healthDataConsent && temRespostasDeSaude(respostas);

    const erros: ErrosPerfil = {
      ageRange: validarFaixaEtaria(respostas.ageRange),
      allergies: validarGravidadeDasAlergias(
        respostas.healthDataConsent ? respostas.allergies : [],
      ),
      healthDataConsent: saudeSemConsentimento
        ? "Autorize o uso das respostas de saúde para salvá-las, ou limpe essas respostas antes de salvar."
        : null,
    };

    const temErro = Object.values(erros).some((mensagem) => mensagem !== null);

    setEnvio({ erros, situacao: "ocioso", mensagem: "" });

    if (temErro) {
      return;
    }

    void enviarRespostas(respostas);
  }

  const itensDoResumo: ErroResumo[] = [
    { id: "consentimento-saude", mensagem: envio.erros.healthDataConsent },
    { id: "faixa-etaria", mensagem: envio.erros.ageRange },
    { id: "busca-alergias", mensagem: envio.erros.allergies },
  ].flatMap((item) =>
    item.mensagem === null ? [] : [{ id: item.id, mensagem: item.mensagem }],
  );

  return {
    carregamento,
    catalogo,
    respostas,
    statusDaConta:
      carregamento.status === "pronto" ? carregamento.accountStatus : null,
    responder,
    trocarCondicoes,
    revogarConsentimento,
    envio,
    itensDoResumo,
    respostasPreenchidas: respostas === null ? 0 : contarPreenchidas(respostas),
    totalDeRespostas:
      respostas === null ? CAMPOS_BASICOS : totalDeRespostas(respostas),
    foto,
    enviarFoto: subirFoto,
    resumoRef,
    handleSubmit,
  };
}
