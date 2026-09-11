import { useState } from "react";
import type { ChangeEvent, FocusEvent, FormEvent } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { confirmarRedefinicao } from "../../services/autenticacao";
import Button from "../../components/Button";
import Input from "../../components/Input";
import LayoutAutenticacao from "../../components/LayoutAutenticacao";
import {
  forcaDaSenha,
  validarConfirmacaoSenha,
  validarSenha,
} from "../../utils/validacao";
import type { FaixaSenha, ForcaSenha } from "../../utils/validacao";
import styles from "./styles.module.css";

const SEGMENTOS = [1, 2, 3, 4];

const FORCA_INICIAL: ForcaSenha = { pontos: 0, faixa: "fraca" };

const TEXTO_FORCA: Record<FaixaSenha, string> = {
  fraca:
    "Senha fraca. Use 8 ou mais caracteres, com letras, números e símbolos.",
  media: "Senha média. Acrescente números ou símbolos para reforçar.",
  forte: "Senha forte.",
};

type EstadoEnvio =
  | { situacao: "parado" }
  | { situacao: "enviando" }
  | { situacao: "erro"; mensagem: string };

interface ErrosSenha {
  senha: string | null;
  confirmacao: string | null;
}

interface EstadoFormulario {
  envio: EstadoEnvio;
  erros: ErrosSenha;
  forca: ForcaSenha;
}

const SEM_ERROS: ErrosSenha = { senha: null, confirmacao: null };

function NovaSenha() {
  const navegar = useNavigate();
  const [parametros] = useSearchParams();
  const codigo = parametros.get("oobCode");

  const [formulario, setFormulario] = useState<EstadoFormulario>({
    envio: { situacao: "parado" },
    erros: SEM_ERROS,
    forca: FORCA_INICIAL,
  });

  if (codigo === null || codigo === "") {
    return <Navigate to="/esqueci-senha" replace />;
  }

  const codigoConfirmado: string = codigo;

  function handleChangeSenha(event: ChangeEvent<HTMLInputElement>) {
    const forca = forcaDaSenha(event.target.value);

    setFormulario((atual) => ({ ...atual, forca }));
  }

  function handleBlurSenha(event: FocusEvent<HTMLInputElement>) {
    const mensagem = validarSenha(event.target.value);

    setFormulario((atual) => ({
      ...atual,
      erros: { ...atual.erros, senha: mensagem },
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const dados = new FormData(event.currentTarget);
    const senha = String(dados.get("senha") ?? "");
    const confirmacao = String(dados.get("confirmacao") ?? "");

    const erros: ErrosSenha = {
      senha: validarSenha(senha),
      confirmacao: validarConfirmacaoSenha(senha, confirmacao),
    };

    if (erros.senha !== null || erros.confirmacao !== null) {
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
      await confirmarRedefinicao(codigoConfirmado, senha);
      navegar("/esqueci-senha/pronto", { replace: true });
    } catch {
      setFormulario((atual) => ({
        ...atual,
        envio: {
          situacao: "erro",
          mensagem: "Não foi possível redefinir a senha. Tente novamente.",
        },
        erros: SEM_ERROS,
      }));
    }
  }

  const desabilitado = formulario.envio.situacao === "enviando";

  return (
    <LayoutAutenticacao>
      <h1 className={styles.titulo}>
        Crie uma <span className={styles.destaque}>senha nova</span>
      </h1>

      <form className={styles.formulario} onSubmit={handleSubmit}>
        <div className={styles.blocoSenha}>
          <Input
            id="senha"
            name="senha"
            type="password"
            label="Nova senha"
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

        <Input
          id="confirmacao"
          name="confirmacao"
          type="password"
          label="Confirme a senha"
          placeholder="Repita a senha"
          autoComplete="new-password"
          revealable
          required
          error={formulario.erros.confirmacao ?? undefined}
        />

        {formulario.envio.situacao === "erro" ? (
          <p className={styles.erro} role="alert">
            {formulario.envio.mensagem}
          </p>
        ) : null}

        <Button type="submit" disabled={desabilitado}>
          {desabilitado ? "Salvando..." : "Salvar nova senha"}
        </Button>
      </form>
    </LayoutAutenticacao>
  );
}

export default NovaSenha;
