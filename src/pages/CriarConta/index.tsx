import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FocusEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Input from "../../components/Input";
import LayoutAutenticacao from "../../components/LayoutAutenticacao";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import type { FaixaSenha, ForcaSenha } from "../../utils/validacao";
import { useTituloDaPagina } from "../../hooks/useTituloDaPagina";
import { mensagemVisivel } from "../../utils/mensagemDeErro";
import styles from "./styles.module.css";
import {
  MAXIMO_DA_SENHA,
  MAXIMO_DO_EMAIL,
  MAXIMO_DO_NOME,
  forcaDaSenha,
  validarAceiteDosTermos,
  validarEmail,
  validarNome,
  validarSenha,
} from "../../utils/validacao";
import { FIREBASE_ATIVO } from "../../config/firebase";

type EstadoEnvio =
  | { situacao: "parado" }
  | { situacao: "enviando" }
  | { situacao: "erro"; mensagem: string };

interface ErrosConta {
  nome: string | null;
  email: string | null;
  senha: string | null;
  termos: string | null;
}

interface EstadoFormulario {
  envio: EstadoEnvio;
  erros: ErrosConta;
  forca: ForcaSenha;
}

const SEM_ERROS: ErrosConta = {
  nome: null,
  email: null,
  senha: null,
  termos: null,
};

const FORCA_INICIAL: ForcaSenha = { pontos: 0, faixa: "fraca" };

const ORDEM_DOS_CAMPOS: (keyof ErrosConta)[] = [
  "nome",
  "email",
  "senha",
  "termos",
];

const DESTINO_PADRAO = "/dashboard";

const DESTINO_DEPOIS_DO_CADASTRO = "/perguntas";

const SEGMENTOS = [1, 2, 3, 4];

const TEXTO_FORCA: Record<FaixaSenha, string> = {
  fraca:
    "Senha fraca. Use 8 ou mais caracteres, com letras, números e símbolos.",
  media: "Senha média. Acrescente números ou símbolos para reforçar.",
  forte: "Senha forte.",
};

function CriarConta() {
  useTituloDaPagina("Criar conta");
  const { usuario, criarConta, entrarComGoogle } = useAutenticacao();
  const navegar = useNavigate();
  const destinoRef = useRef(DESTINO_PADRAO);

  const [formulario, setFormulario] = useState<EstadoFormulario>({
    envio: { situacao: "parado" },
    erros: SEM_ERROS,
    forca: FORCA_INICIAL,
  });
  const [aceitouTermos, setAceitouTermos] = useState(false);

  useEffect(() => {
    if (usuario !== null) {
      navegar(destinoRef.current, { replace: true });
    }
  }, [usuario, navegar]);

  function handleChangeSenha(event: ChangeEvent<HTMLInputElement>) {
    const forca = forcaDaSenha(event.target.value);

    setFormulario((atual) => ({ ...atual, forca }));
  }

  function handleBlurNome(event: FocusEvent<HTMLInputElement>) {
    const mensagem = validarNome(event.target.value);

    setFormulario((atual) => ({
      ...atual,
      erros: { ...atual.erros, nome: mensagem },
    }));
  }

  function handleBlurEmail(event: FocusEvent<HTMLInputElement>) {
    const mensagem = validarEmail(event.target.value);

    setFormulario((atual) => ({
      ...atual,
      erros: { ...atual.erros, email: mensagem },
    }));
  }

  function handleBlurSenha(event: FocusEvent<HTMLInputElement>) {
    const mensagem = validarSenha(event.target.value);

    setFormulario((atual) => ({
      ...atual,
      erros: { ...atual.erros, senha: mensagem },
    }));
  }

  function handleChangeTermos(event: ChangeEvent<HTMLInputElement>) {
    const aceitou = event.target.checked;
    const mensagem = validarAceiteDosTermos(aceitou);

    setAceitouTermos(aceitou);
    setFormulario((atual) => ({
      ...atual,
      erros: { ...atual.erros, termos: mensagem },
    }));
  }

  function mostrarErros(erros: ErrosConta) {
    setFormulario((atual) => ({
      ...atual,
      envio: { situacao: "parado" },
      erros,
    }));

    const primeiro = ORDEM_DOS_CAMPOS.find((campo) => erros[campo] !== null);

    if (primeiro !== undefined) {
      document.getElementById(primeiro)?.focus();
    }
  }

  async function cadastrar(
    criar: () => Promise<void>,
    mensagemDeErro: string,
  ) {
    setFormulario((atual) => ({
      ...atual,
      envio: { situacao: "enviando" },
      erros: SEM_ERROS,
    }));

    destinoRef.current = DESTINO_DEPOIS_DO_CADASTRO;

    try {
      await criar();
      navegar(destinoRef.current, { replace: true });
    } catch {
      destinoRef.current = DESTINO_PADRAO;
      setFormulario((atual) => ({
        ...atual,
        envio: { situacao: "erro", mensagem: mensagemVisivel(mensagemDeErro) },
        erros: SEM_ERROS,
      }));
    }
  }

  async function handleGoogle() {
    const termos = validarAceiteDosTermos(aceitouTermos);

    if (termos !== null) {
      mostrarErros({ ...SEM_ERROS, termos });
      return;
    }

    await cadastrar(
      () => entrarComGoogle(false),
      "Não foi possível criar a conta com o Google.",
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const dados = new FormData(event.currentTarget);
    const nome = String(dados.get("nome") ?? "");
    const email = String(dados.get("email") ?? "");
    const senha = String(dados.get("senha") ?? "");

    const erros: ErrosConta = {
      nome: validarNome(nome),
      email: validarEmail(email),
      senha: validarSenha(senha),
      termos: validarAceiteDosTermos(aceitouTermos),
    };

    const temErro = Object.values(erros).some((mensagem) => mensagem !== null);

    if (temErro) {
      mostrarErros(erros);
      return;
    }

    await cadastrar(
      () => criarConta(nome, email, senha),
      "Não foi possível criar a conta.",
    );
  }

  const desabilitado = formulario.envio.situacao === "enviando";

  return (
    <LayoutAutenticacao>
      <h1 className={styles.titulo}>
        Crie sua conta<span className={styles.ponto}>.</span>
      </h1>

      <p className={styles.subtitulo}>
        Com uma conta, cada análise passa a ser sobre a sua pele, sua saúde e
        seus valores.
      </p>

      {FIREBASE_ATIVO ? (
        <Button
          variant="secondary"
          onClick={handleGoogle}
          busy={desabilitado}
        >
          Cadastrar com Google
        </Button>
      ) : (
        <button
          type="button"
          className={styles.botaoSocial}
          aria-disabled="true"
          aria-describedby="aviso-google"
        >
          Cadastrar com Google
        </button>
      )}

      {FIREBASE_ATIVO ? null : (
        <p id="aviso-google" className={styles.aviso}>
          O cadastro com Google fica disponível quando a configuração do
          Firebase existir.
        </p>
      )}

      <p className={styles.divisor}>ou com e-mail</p>

      <form className={styles.formulario} noValidate onSubmit={handleSubmit}>
        <Input
          id="nome"
          name="nome"
          maxLength={MAXIMO_DO_NOME}
          label="Nome"
          placeholder="Como podemos te chamar"
          autoComplete="name"
          required
          onBlur={handleBlurNome}
          error={formulario.erros.nome ?? undefined}
        />

        <Input
          id="email"
          name="email"
          maxLength={MAXIMO_DO_EMAIL}
          type="email"
          label="E-mail"
          placeholder="voce@email.com"
          autoComplete="email"
          required
          onBlur={handleBlurEmail}
          error={formulario.erros.email ?? undefined}
        />

        <div className={styles.blocoSenha}>
          <Input
            id="senha"
            name="senha"
            maxLength={MAXIMO_DA_SENHA}
            type="password"
            label="Senha"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            revealable
            required
            onChange={handleChangeSenha}
            onBlur={handleBlurSenha}
            error={formulario.erros.senha ?? undefined}
          />

          <ul className={styles.segmentos} aria-hidden="true">
            {SEGMENTOS.map((segmento) => (
              <li
                key={segmento}
                className={
                  segmento <= formulario.forca.pontos
                    ? styles[formulario.forca.faixa]
                    : styles.segmentoVazio
                }
              />
            ))}
          </ul>

          <p className={styles.dica} role="status">
            {TEXTO_FORCA[formulario.forca.faixa]}
          </p>
        </div>

        <div className={styles.blocoTermos}>
          <div className={styles.aceite}>
            <input
              id="termos"
              name="termos"
              type="checkbox"
              className={styles.caixa}
              checked={aceitouTermos}
              onChange={handleChangeTermos}
              aria-labelledby="rotulo-termos link-termos conector-termos link-privacidade"
              aria-describedby={
                formulario.erros.termos
                  ? "aviso-nova-aba erro-termos"
                  : "aviso-nova-aba"
              }
            />
            
            <label id="rotulo-termos" htmlFor="termos">
              Li e aceito os
            </label>

            <Link
              id="link-termos"
              className={styles.link}
              to="/termos"
              target="_blank"
              rel="noopener noreferrer"
            >
              Termos de Uso
            </Link>

            <span id="conector-termos">e a</span>

            <Link
              id="link-privacidade"
              className={styles.link}
              to="/privacidade"
              target="_blank"
              rel="noopener noreferrer"
            >
              Política de Privacidade
            </Link>
          </div>

          <p id="aviso-nova-aba" className={styles.aviso}>
            Os dois documentos abrem em uma nova aba.
          </p>

          {formulario.erros.termos ? (
            <p id="erro-termos" className={styles.erroCampo} role="alert">
              {formulario.erros.termos}
            </p>
          ) : null}
        </div>

        {formulario.envio.situacao === "erro" ? (
          <p className={styles.erro} role="alert">
            {formulario.envio.mensagem}
          </p>
        ) : null}

        <Button type="submit" busy={desabilitado}>
          {desabilitado ? "Criando..." : "Criar minha conta"}
        </Button>
      </form>

      <p className={styles.rodape}>
        Já tem conta?{" "}
        <Link className={styles.link} to="/login">
          Entrar
        </Link>
      </p>
    </LayoutAutenticacao>
  );
}

export default CriarConta;
