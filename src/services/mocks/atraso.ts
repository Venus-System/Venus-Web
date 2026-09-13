const MILISSEGUNDOS = 300;

export function simularLatencia(): Promise<void> {
  return new Promise((resolver) => {
    setTimeout(resolver, MILISSEGUNDOS);
  });
}
