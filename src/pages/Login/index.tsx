import { useState } from "react";
import type { FormEvent, FocusEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import styles from "./styles.module.css";
import { validarEmail, validarSenhaPreenchida } from "../../utils/validacao";
import LayoutAutenticacao from "../../components/LayoutAutenticacao";

type EstadoEnvio =
  | { situacao: "parado" }
  | { situacao: "enviando" }
  | { situacao: "erro"; mensagem: string };

interface ErrosLogin {
  email: string | null;
  senha: string | null;
}

interface EstadoFormulario {
  envio: EstadoEnvio;
  erros: ErrosLogin;
}

const SEM_ERROS: ErrosLogin = { email: null, senha: null };

const DESTINO_PADRAO = "/dashboard";

function destinoDoLogin(state: unknown): string {
  if (typeof state === "object" && state !== null && "de" in state) {
    const de = state.de;

    if (typeof de === "string" && de.startsWith("/")) {
      return de;
    }
  }

  return DESTINO_PADRAO;
}

function Login() {
  const { entrar } = useAutenticacao();
  const [formulario, setFormulario] = useState<EstadoFormulario>({
    envio: { situacao: "parado" },
    erros: SEM_ERROS,
  });

  const navegar = useNavigate();
  const localizacao = useLocation();
  const destino = destinoDoLogin(localizacao.state);

  function handleBlurEmail(event: FocusEvent<HTMLInputElement>) {
    const mensagem = validarEmail(event.target.value);

    setFormulario((atual) => ({
      ...atual,
      erros: { ...atual.erros, email: mensagem },
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const dados = new FormData(event.currentTarget);
    const email = String(dados.get("email") ?? "");
    const senha = String(dados.get("senha") ?? "");
    const continuar = dados.get("continuar") === "on";

    const erros = {
      email: validarEmail(email),
      senha: validarSenhaPreenchida(senha),
    };

    if (erros.email !== null || erros.senha !== null) {
      setFormulario({ envio: { situacao: "parado" }, erros });
      return;
    }

    setFormulario({ envio: { situacao: "enviando" }, erros: SEM_ERROS });

    try {
      await entrar(email, senha, continuar);
      navegar(destino, { replace: true });
    } catch {
      setFormulario({
        envio: { situacao: "erro", mensagem: "E-mail ou senha inválidos." },
        erros: SEM_ERROS,
      });
    }
  }

  const desabilitado = formulario.envio.situacao === "enviando";

  return (
    <LayoutAutenticacao>
      <h1 className={styles.titulo}>Login</h1>

      <p className={styles.subtitulo}>
        Seu perfil, histórico e favoritos continuam exatamente onde você deixou.
      </p>

      <button
        type="button"
        className={styles.botaoSocial}
        aria-disabled="true"
        aria-describedby="aviso-google"
      >
        Continuar com Google
      </button>

      <p id="aviso-google" className={styles.aviso}>
        A entrada com Google entra quando a autenticação externa estiver
        disponível.
      </p>

      <p className={styles.divisor}>ou com e-mail</p>

      <form className={styles.formulario} onSubmit={handleSubmit}>
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

        <Input
          id="senha"
          name="senha"
          type="password"
          label="Senha"
          placeholder="Mínimo 8 caracteres"
          autoComplete="current-password"
          revealable
          required
          error={formulario.erros.senha ?? undefined}
        />

        <div className={styles.linha}>
          <label className={styles.lembrar} htmlFor="continuar">
            <input
              id="continuar"
              name="continuar"
              type="checkbox"
              className={styles.caixa}
            />
            Continuar conectado
          </label>

          <Link className={styles.link} to="/esqueci-senha">
            Esqueci minha senha
          </Link>
        </div>

        {formulario.envio.situacao === "erro" ? (
          <p className={styles.erro} role="alert">
            {formulario.envio.mensagem}
          </p>
        ) : null}

        <Button type="submit" disabled={desabilitado}>
          {desabilitado ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className={styles.rodape}>
        Ainda não tem conta?{" "}
        <Link className={styles.link} to="/criar-conta">
          Criar conta grátis
        </Link>
      </p>
    </LayoutAutenticacao>
  );
}

export default Login;
