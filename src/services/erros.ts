export class ErroProdutoNaoEncontrado extends Error {
  constructor(slug: string) {
    super(`Nenhum produto corresponde a "${slug}".`);
    this.name = "ErroProdutoNaoEncontrado";
  }
}