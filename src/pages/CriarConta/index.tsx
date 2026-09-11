import { useState } from "react";
import type { ChangeEvent, FocusEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Input from "../../components/Input";
import LayoutAutenticacao from "../../components/LayoutAutenticacao";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import type { FaixaSenha, ForcaSenha } from "../../utils/validacao";
import styles from "./styles.module.css";
import {
  forcaDaSenha,
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

const DESTINO_PADRAO = "/dashboard";

const SEGMENTOS = [1, 2, 3, 4];

const TEXTO_FORCA: Record<FaixaSenha, string> = {
  fraca:
    "Senha fraca. Use 8 ou mais caracteres, com letras, números e símbolos.",
  media: "Senha média. Acrescente números ou símbolos para reforçar.",
  forte: "Senha forte.",
};

function CriarConta() {
  const { criarConta, entrarComGoogle } = useAutenticacao();
  const navegar = useNavigate();

  const [formulario, setFormulario] = useState<EstadoFormulario>({
    envio: { situacao: "parado" },
    erros: SEM_ERROS,
    forca: FORCA_INICIAL,
  });

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

  async function handleGoogle() {
    setFormulario((atual) => ({
      ...atual,
      envio: { situacao: "enviando" },
      erros: SEM_ERROS,
    }));

    try {
      await entrarComGoogle(false);
      navegar(DESTINO_PADRAO, { replace: true });
    } catch {
      setFormulario((atual) => ({
        ...atual,
        envio: {
          situacao: "erro",
          mensagem: "Não foi possível criar a conta com o Google.",
        },
        erros: SEM_ERROS,
      }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const dados = new FormData(event.currentTarget);
    const nome = String(dados.get("nome") ?? "");
    const email = String(dados.get("email") ?? "");
    const senha = String(dados.get("senha") ?? "");
    const aceitou = dados.get("termos") === "on";

    const erros: ErrosConta = {
      nome: validarNome(nome),
      email: validarEmail(email),
      senha: validarSenha(senha),
      termos: aceitou
        ? null
        : "É preciso aceitar os termos para criar a conta.",
    };

    const temErro = Object.values(erros).some((mensagem) => mensagem !== null);

    if (temErro) {
      setFormulario((atual) => ({
        ...atual,
        envio: { situacao: "parado" },
        erros,
      }));
      return;
    }

    setFormulario((atual) => ({
      ...atual,
      envio: { situacao: "enviando" },
      erros: SEM_ERROS,
    }));

    try {
      await criarConta(nome, email, senha);
      navegar(DESTINO_PADRAO, { replace: true });
    } catch {
      setFormulario((atual) => ({
        ...atual,
        envio: {
          situacao: "erro",
          mensagem: "Não foi possível criar a conta.",
        },
        erros: SEM_ERROS,
      }));
    }
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
          disabled={desabilitado}
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

      <form className={styles.formulario} onSubmit={handleSubmit}>
        <Input
          id="nome"
          name="nome"
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
              aria-labelledby="rotulo-termos link-termos"
              aria-describedby={
                formulario.erros.termos ? "erro-termos" : undefined
              }
            />

            <label id="rotulo-termos" htmlFor="termos">
              Li e aceito os
            </label>

            <Link id="link-termos" className={styles.link} to="/termos">
              Termos e a Privacidade
            </Link>
          </div>

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

        <Button type="submit" disabled={desabilitado}>
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
