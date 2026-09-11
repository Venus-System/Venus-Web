import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import CampoCodigo from "../../components/CampoCodigo";
import LayoutAutenticacao from "../../components/LayoutAutenticacao";
import { conferirCodigo, solicitarCodigo } from "../../services/autenticacao";
import { validarCodigo } from "../../utils/validacao";
import styles from "./styles.module.css";

function emailDoEstado(state: unknown): string | null {
  if (typeof state === "object" && state !== null && "email" in state) {
    const email = state.email;

    if (typeof email === "string" && email !== "") {
      return email;
    }
  }

  return null;
}

type EstadoEnvio =
  | { situacao: "parado" }
  | { situacao: "enviando" }
  | { situacao: "reenviando" }
  | { situacao: "reenviado" }
  | { situacao: "erro"; mensagem: string };

interface EstadoFormulario {
  envio: EstadoEnvio;
  codigo: string;
  erroCodigo: string | null;
}

function CodigoRecuperacao() {
  const navegar = useNavigate();
  const localizacao = useLocation();
  const email = emailDoEstado(localizacao.state);

  const [formulario, setFormulario] = useState<EstadoFormulario>({
    envio: { situacao: "parado" },
    codigo: "",
    erroCodigo: null,
  });

  if (email === null) {
    return <Navigate to="/esqueci-senha" replace />;
  }

  const emailConfirmado: string = email;

  function handleChangeCodigo(codigo: string) {
    setFormulario((atual) => ({ ...atual, codigo, erroCodigo: null }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const codigo = formulario.codigo;
    const erroCodigo = validarCodigo(codigo);

    if (erroCodigo !== null) {
      setFormulario((atual) => ({ ...atual, envio: { situacao: "parado" }, erroCodigo }));
      return;
    }

    setFormulario((atual) => ({
      ...atual,
      envio: { situacao: "enviando" },
      erroCodigo: null,
    }));

    try {
      await conferirCodigo(emailConfirmado, codigo);
      navegar("/esqueci-senha/nova", {
        state: { email: emailConfirmado, codigo },
      });
    } catch {
      setFormulario((atual) => ({
        ...atual,
        envio: { situacao: "erro", mensagem: "Código inválido ou expirado." },
        erroCodigo: null,
      }));
    }
  }

  async function handleReenviar() {
    setFormulario((atual) => ({
      ...atual,
      envio: { situacao: "reenviando" },
      erroCodigo: null,
    }));

    try {
      await solicitarCodigo(emailConfirmado);
      setFormulario((atual) => ({
        ...atual,
        envio: { situacao: "reenviado" },
        erroCodigo: null,
      }));
    } catch {
      setFormulario((atual) => ({
        ...atual,
        envio: { situacao: "erro", mensagem: "Não foi possível reenviar." },
        erroCodigo: null,
      }));
    }
  }

  const enviando = formulario.envio.situacao === "enviando";
  const reenviando = formulario.envio.situacao === "reenviando";

  return (
    <LayoutAutenticacao>
      <h1 className={styles.titulo}>
        Confere a <span className={styles.destaque}>caixa de entrada</span>
      </h1>

      <p className={styles.subtitulo}>
        Enviamos um código de 6 dígitos para <strong>{email}</strong>. Ele vale
        por 10 minutos.
      </p>

      <form className={styles.formulario} onSubmit={handleSubmit}>
        <CampoCodigo
          id="codigo"
          label="Código de verificação"
          valor={formulario.codigo}
          onChange={handleChangeCodigo}
          error={formulario.erroCodigo ?? undefined}
        />

        <p className={styles.reenvio}>
          Não chegou? Olhe o spam ou{" "}
          <button
            type="button"
            className={styles.botaoTexto}
            onClick={handleReenviar}
            disabled={reenviando}
          >
            {reenviando ? "reenviando..." : "reenviar código"}
          </button>
        </p>

        <p className={styles.aviso} role="status">
          {formulario.envio.situacao === "reenviado"
            ? "Código reenviado. Confira sua caixa de entrada."
            : ""}
        </p>

        {formulario.envio.situacao === "erro" ? (
          <p className={styles.erro} role="alert">
            {formulario.envio.mensagem}
          </p>
        ) : null}

        <Button type="submit" disabled={enviando}>
          {enviando ? "Validando..." : "Validar código"}
        </Button>
      </form>
    </LayoutAutenticacao>
  );
}

export default CodigoRecuperacao;
