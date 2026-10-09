const UM_DIA = 24 * 60 * 60 * 1000;
const DIAS_RELATIVOS = 7;

const FORMATO_DATA = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function dataDaAvaliacao(
  data: string,
  agora: Date = new Date(),
): string | null {
  const lida = new Date(data);

  if (Number.isNaN(lida.getTime())) {
    return null;
  }

  const dias = Math.floor((agora.getTime() - lida.getTime()) / UM_DIA);

  if (dias < 1) {
    return "hoje";
  }

  if (dias === 1) {
    return "ontem";
  }

  if (dias < DIAS_RELATIVOS) {
    return `há ${dias} dias`;
  }

  return FORMATO_DATA.format(lida);
}
