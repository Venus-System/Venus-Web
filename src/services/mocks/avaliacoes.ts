import type {
  Avaliacao,
  NovaAvaliacao,
  VotoDeAvaliacao,
} from "../../types/avaliacao";
import { ErroAvaliacaoDuplicada } from "../erros";
import { horasAtras } from "./painel";
import { hidratanteCeramidas, serumCalmanteAveia } from "./produtos";

interface AvaliacaoDoMock extends Avaliacao {
  myVote: VotoDeAvaliacao | null;
}

let avaliacoesPorSlug: Record<string, AvaliacaoDoMock[]> = {
  [serumCalmanteAveia.slug]: [
    {
      id: "avaliacao-sophia",
      authorName: "Sophia L.",
      isMine: false,
      rating: 5,
      title: "Absorve rápido e não pesa",
      comment:
        "Uso de manhã antes do protetor e não deixa a pele oleosa. A textura é bem leve e não formou bolinha embaixo da maquiagem.",
      verifiedUse: true,
      createdAt: horasAtras(72),
      usefulCount: 12,
      myVote: null,
    },
    {
      id: "avaliacao-matheus",
      authorName: "Matheus O.",
      isMine: false,
      rating: 4,
      title: "Bom, mas a textura demora a secar",
      comment:
        "O resultado na pele é ótimo depois de umas três semanas. Só acho que demora um pouco para secar antes da maquiagem.",
      verifiedUse: true,
      createdAt: horasAtras(24 * 20),
      usefulCount: 8,
      myVote: null,
    },
    {
      id: "avaliacao-laura",
      authorName: "Laura G.",
      isMine: false,
      rating: 2.5,
      title: "Não funcionou na minha pele",
      comment:
        "Minha pele é mista e senti que obstruiu os poros na zona T. Pode ser questão de perfil, mas comigo não deu certo.",
      verifiedUse: false,
      createdAt: horasAtras(24 * 35),
      usefulCount: 3,
      myVote: null,
    },
    {
      id: "avaliacao-rafael",
      authorName: "Rafael L.",
      isMine: false,
      rating: 5,
      title: "Acalmou a vermelhidão",
      comment:
        "Tenho rosácea e foi o primeiro sérum que não ardeu. Uso há dois meses, de manhã e à noite.",
      verifiedUse: true,
      createdAt: horasAtras(24 * 48),
      usefulCount: 5,
      myVote: null,
    },
    {
      id: "avaliacao-sem-nome",
      authorName: null,
      isMine: false,
      rating: 3,
      title: "Esperava mais",
      comment: "Não vi muita diferença depois de um mês de uso.",
      verifiedUse: false,
      createdAt: horasAtras(24 * 60),
      usefulCount: 0,
      myVote: null,
    },
  ],
  [hidratanteCeramidas.slug]: [
    {
      id: "avaliacao-bruna",
      authorName: "Bruna T.",
      isMine: false,
      rating: 4,
      title: "Ótimo para pele seca",
      comment: "Segura a hidratação o dia todo, só o cheiro que é forte.",
      verifiedUse: true,
      createdAt: horasAtras(24 * 5),
      usefulCount: 2,
      myVote: null,
    },
  ],
};

function semMeuVoto({
  myVote: _voto,
  ...avaliacao
}: AvaliacaoDoMock): Avaliacao {
  return avaliacao;
}

function atualizar(
  id: string,
  mudar: (avaliacao: AvaliacaoDoMock) => AvaliacaoDoMock,
): void {
  avaliacoesPorSlug = Object.fromEntries(
    Object.entries(avaliacoesPorSlug).map(([slug, lista]) => [
      slug,
      lista.map((item) => (item.id === id ? mudar(item) : item)),
    ]),
  );
}

function encontrar(id: string): AvaliacaoDoMock | undefined {
  return Object.values(avaliacoesPorSlug)
    .flat()
    .find((item) => item.id === id);
}

export function avaliacoesDoMock(slug: string): Avaliacao[] {
  return (avaliacoesPorSlug[slug] ?? []).map(semMeuVoto);
}

export function meuVotoDoMock(id: string): VotoDeAvaliacao | null {
  return encontrar(id)?.myVote ?? null;
}

export function votarNoMock(id: string, voto: VotoDeAvaliacao | null): void {
  atualizar(id, (avaliacao) => {
    const tirou = avaliacao.myVote === "useful" ? 1 : 0;
    const somou = voto === "useful" ? 1 : 0;

    return {
      ...avaliacao,
      myVote: voto,
      usefulCount: avaliacao.usefulCount - tirou + somou,
    };
  });
}

export function publicarNoMock(slug: string, nova: NovaAvaliacao): Avaliacao {
  const lista = avaliacoesPorSlug[slug] ?? [];

  if (lista.some((item) => item.isMine)) {
    throw new ErroAvaliacaoDuplicada();
  }

  const criada: AvaliacaoDoMock = {
    id: `avaliacao-${Date.now()}`,
    authorName: null,
    isMine: true,
    ...nova,
    createdAt: new Date().toISOString(),
    usefulCount: 0,
    myVote: null,
  };

  avaliacoesPorSlug = { ...avaliacoesPorSlug, [slug]: [criada, ...lista] };

  return semMeuVoto(criada);
}
