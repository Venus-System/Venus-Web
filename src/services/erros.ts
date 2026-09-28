export class ErroServicoIndisponivel extends Error {
  constructor() {
    super(
      "Não conseguimos falar com o serviço da Venus agora. Tente de novo em instantes.",
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

export class ErroCredenciaisInvalidas extends Error {
  constructor() {
    super("E-mail ou senha inválidos.");
    this.name = "ErroCredenciaisInvalidas";
  }
}

export class ErroSessaoAdminExpirada extends Error {
  constructor() {
    super("Sua sessão de administrador terminou. Entre de novo para continuar.");
    this.name = "ErroSessaoAdminExpirada";
  }
}

export class ErroCandidatoNaoEncontrado extends Error {
  constructor() {
    super("Este produto não está mais na fila de aprovação.");
    this.name = "ErroCandidatoNaoEncontrado";
  }
}

export class ErroRevisaoInvalida extends Error {
  detalhes: string[];

  constructor(detalhes: string[]) {
    super("A API não aceitou a revisão. Confira os pontos abaixo.");
    this.name = "ErroRevisaoInvalida";
    this.detalhes = detalhes;
  }
}

export class ErroRevisaoEmConflito extends Error {
  constructor() {
    super(
      "Outra pessoa já decidiu sobre este produto. Recarregue a fila para ver a situação atual.",
    );
    this.name = "ErroRevisaoEmConflito";
  }
}

export class ErroSemPermissaoParaDecidir extends Error {
  constructor() {
    super("O seu papel não permite aprovar nem recusar produtos.");
    this.name = "ErroSemPermissaoParaDecidir";
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