const UM_DIA = 24 * 60 * 60 * 1000;

function inicioDoDia(data: Date): number {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate()).getTime();
}

export function tempoRelativo(iso: string, agora: Date = new Date()): string {
  const data = new Date(iso);

  if (Number.isNaN(data.getTime())) {
    return "";
  }

  const dias = Math.round((inicioDoDia(agora) - inicioDoDia(data)) / UM_DIA);

  if (dias <= 0) {
    return "hoje";
  }

  if (dias === 1) {
    return "ontem";
  }

  return `há ${dias} dias`;
}
