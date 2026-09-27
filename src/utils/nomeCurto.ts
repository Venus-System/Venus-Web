export function nomeCurto(nomeCompleto: string): string {
  const partes = nomeCompleto.trim().split(/\s+/);

  if (partes.length < 2) {
    return nomeCompleto.trim();
  }

  return `${partes[0]} ${partes[partes.length - 1].charAt(0)}.`;
}
