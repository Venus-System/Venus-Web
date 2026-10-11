import type { NotasProduto } from "../types/produto";

export type CampoDeNota = keyof Pick<
  NotasProduto,
  "healthScore" | "environmentalScore" | "ethicalScore" | "performanceScore"
>;

export type NotasDeQualidade = Pick<NotasProduto, CampoDeNota>;

export interface NotaDeQualidade {
  campo: CampoDeNota;
  rotulo: string;
  resumo: string;
  peso: string;
  descricao: string;
}

export const NOTAS_DE_QUALIDADE: NotaDeQualidade[] = [
  {
    campo: "healthScore",
    rotulo: "Saúde",
    resumo: "irritação e poros",
    peso: "cerca de 41%",
    descricao:
      "O risco de irritação e de entupir os poros dos ingredientes. Quanto menor o risco, maior a nota.",
  },
  {
    campo: "environmentalScore",
    rotulo: "Ambiental",
    resumo: "ingredientes e embalagem",
    peso: "cerca de 18%",
    descricao:
      "Quanto os ingredientes se decompõem e o risco deles para o ambiente, mais a embalagem: se é reciclável, refilável, biodegradável e quanto tem de material reciclado.",
  },
  {
    campo: "ethicalScore",
    rotulo: "Ético",
    resumo: "vegano, sem teste em animais, selos",
    peso: "cerca de 18%",
    descricao:
      "O que a marca declara: se é vegana, se não testa em animais, e os selos éticos que foram verificados.",
  },
  {
    campo: "performanceScore",
    rotulo: "Desempenho",
    resumo: "benefícios declarados na fórmula",
    peso: "cerca de 24%",
    descricao:
      "Os benefícios declarados na fórmula: quantos efeitos benéficos conhecidos os ingredientes têm. Não é um resultado medido no uso.",
  },
];
