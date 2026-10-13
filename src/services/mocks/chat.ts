import type { RespostaDoChat } from "../../types/chat";
import { ErroMuitasMensagens, ErroServicoIndisponivel } from "../erros";

const TEMPO_PARA_RESPONDER = 1200;
const CONVERSA_DE_EXEMPLO = "conversa-de-exemplo";
const ESPERA_DE_EXEMPLO = 20;

interface RespostaPorAssunto {
  palavras: string[];
  reply: string;
}

const RESPOSTAS: RespostaPorAssunto[] = [
  {
    palavras: ["nota", "score", "pontos"],
    reply:
      "A nota vai de 0 a 100. Até 35 pontos vêm da qualidade do produto e até 65 de quanto a fórmula combina com o seu perfil.",
  },
  {
    palavras: ["alergia", "alergias", "alérgica", "alérgico"],
    reply:
      "Eu cruzo a fórmula com as alergias do seu perfil. Quando um ingrediente bate com uma delas, ele aparece como alerta no topo da análise.",
  },
  {
    palavras: ["vegano", "vegana", "cruelty"],
    reply:
      "Só consigo dizer que um produto é vegano quando a marca declara isso. Sem a declaração, eu digo que não sei.",
  },
  {
    palavras: ["rotina", "agenda"],
    reply:
      "Posso montar uma rotina de cuidados com os produtos que você já analisou. Me diga se é para a manhã ou para a noite.",
  },
  {
    palavras: ["parecido", "sugira", "sugestão", "alternativa"],
    reply:
      "Para sugerir um produto parecido, eu olho a categoria e o que é alerta para o seu perfil. Me diga o que você procura nele.",
  },
];

const OFENSAS = ["burra", "idiota", "inútil"];

const RESPOSTA_PADRAO =
  "Posso explicar os ingredientes e a nota de um produto, ou ajudar a montar a sua rotina de cuidados. Sobre o que você quer falar?";

const RESPOSTA_MAGOADA =
  "Isso me deixou um pouco magoada. Se quiser, seguimos falando do produto.";

function esperar(): Promise<void> {
  return new Promise((resolver) => {
    setTimeout(resolver, TEMPO_PARA_RESPONDER);
  });
}

export async function respostaDoMock(
  mensagem: string,
  conversationId: string | null,
): Promise<RespostaDoChat> {
  await esperar();

  const texto = mensagem.toLowerCase();

  if (texto.includes("simular erro")) {
    throw new ErroServicoIndisponivel();
  }

  if (texto.includes("simular limite")) {
    throw new ErroMuitasMensagens(ESPERA_DE_EXEMPLO);
  }

  const base = {
    conversationId: conversationId ?? CONVERSA_DE_EXEMPLO,
  };

  if (OFENSAS.some((ofensa) => texto.includes(ofensa))) {
    return { ...base, reply: RESPOSTA_MAGOADA, expression: "magoada" };
  }

  const encontrada = RESPOSTAS.find(({ palavras }) =>
    palavras.some((palavra) => texto.includes(palavra)),
  );

  return {
    ...base,
    reply: encontrada === undefined ? RESPOSTA_PADRAO : encontrada.reply,
    expression: "neutra",
  };
}
