export class ErroServicoIndisponivel extends Error {
  constructor() {
    super(
      "O serviço da Venus está fora do ar no momento. Tente de novo mais tarde.",
    );
    this.name = "ErroServicoIndisponivel";
  }
}

export class ErroDeOrientacao extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroDeOrientacao";
  }
}

export class ErroUsuarioInexistente extends Error {
  constructor(id: number) {
    super(`A API não tem nenhum usuário com o id ${id}.`);
    this.name = "ErroUsuarioInexistente";
  }
}

export class ErroProdutoNaoEncontrado extends Error {
  constructor(slug: string) {
    super(`Nenhum produto corresponde a "${slug}".`);
    this.name = "ErroProdutoNaoEncontrado";
  }
}