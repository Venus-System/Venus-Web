import type { Produto } from "../../types/produto";
import {
  hidratanteCeramidas,
  oleoCapilarReparador,
  produtosMock,
  serumCalmanteAveia,
} from "./produtos";

let slugsFavoritos: string[] = [
  serumCalmanteAveia.slug,
  hidratanteCeramidas.slug,
  oleoCapilarReparador.slug,
];

export function favoritosDoMock(): Produto[] {
  return slugsFavoritos.flatMap((slug) => {
    const produto = produtosMock.find((item) => item.slug === slug);

    return produto === undefined ? [] : [produto];
  });
}

export function favoritarNoMock(slug: string): void {
  if (!slugsFavoritos.includes(slug)) {
    slugsFavoritos = [slug, ...slugsFavoritos];
  }
}

export function desfavoritarNoMock(slug: string): void {
  slugsFavoritos = slugsFavoritos.filter((item) => item !== slug);
}
