const UM_DIA = 24 * 60 * 60 * 1000;
const DIAS_DA_SEMANA = 7;

const FORMATO_MES = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

export interface GrupoPorData<T> {
  id: string;
  titulo: string;
  itens: T[];
}

function mesmoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function comMaiuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function grupoDaData(data: Date, agora: Date): { id: string; titulo: string } {
  if (Number.isNaN(data.getTime())) {
    return { id: "sem-data", titulo: "Sem data" };
  }

  if (mesmoDia(data, agora)) {
    return { id: "hoje", titulo: "Hoje" };
  }

  if (agora.getTime() - data.getTime() < DIAS_DA_SEMANA * UM_DIA) {
    return { id: "semana", titulo: "Esta semana" };
  }

  return {
    id: `${data.getFullYear()}-${data.getMonth()}`,
    titulo: comMaiuscula(FORMATO_MES.format(data)),
  };
}

export function agruparPorData<T>(
  itens: T[],
  dataDe: (item: T) => string,
  agora: Date = new Date(),
): GrupoPorData<T>[] {
  const grupos = new Map<string, GrupoPorData<T>>();

  itens.forEach((item) => {
    const { id, titulo } = grupoDaData(new Date(dataDe(item)), agora);
    const grupo = grupos.get(id);

    if (grupo === undefined) {
      grupos.set(id, { id, titulo, itens: [item] });
    } else {
      grupo.itens.push(item);
    }
  });

  return [...grupos.values()];
}
