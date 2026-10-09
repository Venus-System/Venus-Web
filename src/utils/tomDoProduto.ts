export type TomDoProduto = "tomRoxo" | "tomVerde" | "tomRosa" | "tomAzul";

const TONS: TomDoProduto[] = ["tomRoxo", "tomVerde", "tomRosa", "tomAzul"];

export function tomDoProduto(slug: string): TomDoProduto {
  let soma = 0;

  for (const caractere of slug) {
    soma += caractere.charCodeAt(0);
  }

  return TONS[soma % TONS.length];
}
