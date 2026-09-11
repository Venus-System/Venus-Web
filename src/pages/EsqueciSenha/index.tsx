import { useState } from "react";
import type { FocusEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Input from "../../components/Input";
import LayoutAutenticacao from "../../components/LayoutAutenticacao";
import { solicitarCodigo } from "../../services/autenticacao";
import { validarEmail } from "../../utils/validacao";
import styles from "./styles.module.css";

type EstadoEnvio =
  | { situacao: "parado" }
  | { situacao: "enviando" }
  | { situacao: "erro"; mensagem: string };

interface EstadoFormulario {
  envio: EstadoEnvio;
  erroEmail: string | null;
}

function EsqueciSenha() {
  const navegar = useNavigate();
  const [formulario, setFormulario] = useState<EstadoFormulario>({
    envio: { situacao: "parado" },
    erroEmail: null,
  });

  function handleBlurEmail(event: FocusEvent<HTMLInputElement>) {
    setFormulario((atual) => ({
      ...atual,
      erroEmail: validarEmail(event.target.value),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    const erroEmail = validarEmail(email);

    if (erroEmail !== null) {
      setFormulario({ envio: { situacao: "parado" }, erroEmail });
      return;
    }

    setFormulario({ envio: { situacao: "enviando" }, erroEmail: null });

    try {
      await solicitarCodigo(email);
      navegar("/esqueci-senha/codigo", { state: { email } });
    } catch {
      setFormulario({
        envio: {
          situacao: "erro",
          mensagem: "Não foi possível enviar o código.",
        },
        erroEmail: null,
      });
    }
  }

  const desabilitado = formulario.envio.situacao === "enviando";

  return (
    <LayoutAutenticacao>
      <h1 className={styles.titulo}>Esqueceu a senha?</h1>

      <p className={styles.subtitulo}>
        Digite o e-mail da sua conta. Enviaremos um código de 6 dígitos para
        você criar uma senha nova.
      </p>

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
          error={formulario.erroEmail ?? undefined}
        />
        {formulario.envio.situacao === "erro" ? (
          <p className={styles.erro} role="alert">
            {formulario.envio.mensagem}
          </p>
        ) : null}

        <Button type="submit" disabled={desabilitado}>
          {desabilitado ? "Enviando..." : "Enviar código"}
        </Button>
      </form>

      <p className={styles.rodape}>
        Lembrou a senha?{" "}
        <Link className={styles.link} to="/login">
          Entrar
        </Link>
      </p>
    </LayoutAutenticacao>
  );
}

export default EsqueciSenha;
