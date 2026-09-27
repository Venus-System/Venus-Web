import { useEffect, useState } from "react";
import type { FocusEvent, FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import LayoutAutenticacao from "../../components/LayoutAutenticacao";
import { useAutenticacaoAdmin } from "../../hooks/useAutenticacaoAdmin";
import { validarEmail, validarSenhaPreenchida } from "../../utils/validacao";
import styles from "./styles.module.css";

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
const DESTINO_PADRAO = "/admin/fila";
const ID_ERRO = "erro-login-admin";

function destinoDoLogin(state: unknown): string {
  if (typeof state === "object" && state !== null && "de" in state) {
    const de = state.de;

    if (
      typeof de === "string" &&
      de.startsWith("/admin/") &&
      !de.startsWith("/admin/login")
    ) {
      return de;
    }
  }

  return DESTINO_PADRAO;
}

function AdminLogin() {
  const { administrador, entrar } = useAutenticacaoAdmin();
  const [formulario, setFormulario] = useState<EstadoFormulario>({
    envio: { situacao: "parado" },
    erros: SEM_ERROS,
  });

  const navegar = useNavigate();
  const localizacao = useLocation();
  const destino = destinoDoLogin(localizacao.state);

  useEffect(() => {
    if (administrador !== null) {
      navegar(destino, { replace: true });
    }
  }, [administrador, destino, navegar]);

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
      await entrar(email, senha);
    } catch (erro) {
      setFormulario({
        envio: {
          situacao: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível entrar agora.",
        },
        erros: SEM_ERROS,
      });
    }
  }

  const enviando = formulario.envio.situacao === "enviando";
  const temErroGeral = formulario.envio.situacao === "erro";
  const descricaoDoErro = temErroGeral ? ID_ERRO : undefined;

  return (
    <LayoutAutenticacao
      painel={
        <>
          <h2 className={styles.painelTitulo}>Área administrativa</h2>
          <p className={styles.painelTexto}>
            Curadoria do catálogo: cada produto enviado passa por aqui antes de
            valer para todo mundo.
          </p>
        </>
      }
    >
      <p className={styles.etiqueta}>Área administrativa</p>

      <h1 className={styles.titulo}>Login</h1>

      <p className={styles.subtitulo}>
        Acesso da equipe que revisa e aprova os produtos enviados para o
        catálogo.
      </p>

      <form className={styles.formulario} noValidate onSubmit={handleSubmit}>
        <Input
          id="email"
          name="email"
          type="email"
          label="E-mail"
          placeholder="voce@email.com"
          autoComplete="username"
          required
          onBlur={handleBlurEmail}
          aria-describedby={descricaoDoErro}
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
          aria-describedby={descricaoDoErro}
          error={formulario.erros.senha ?? undefined}
        />

        {formulario.envio.situacao === "erro" ? (
          <p id={ID_ERRO} className={styles.erro} role="alert">
            {formulario.envio.mensagem}
          </p>
        ) : null}

        <Button type="submit" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
          {enviando ? null : (
            <ArrowRight className={styles.icone} aria-hidden="true" />
          )}
        </Button>
      </form>
    </LayoutAutenticacao>
  );
}

export default AdminLogin;
