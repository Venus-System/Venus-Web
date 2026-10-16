import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { ResultadoDaRedefinicao, Usuario } from "../types/usuario";
import {
  entrar as entrarNoServico,
  entrarComGoogle as entrarComGoogleNoServico,
  observarSessao,
  sair as sairDoServico,
  criarConta as criarContaNoServico,
  atualizarNome as atualizarNomeNoServico,
  solicitarRedefinicao,
  confirmarRedefinicao as confirmarRedefinicaoNoServico,
} from "../services/autenticacao";
import { buscarFotoDePerfil } from "../services/avatar";
import { ErroLinkDeSenhaVencido, repassarErro } from "../services/erros";

interface ValorAutenticacao {
  usuario: Usuario | null;
  carregando: boolean;
  fotoUrl: string | null;
  definirFoto: (url: string | null) => void;
  entrar: (
    email: string,
    senha: string,
    continuarConectado: boolean,
  ) => Promise<void>;
  sair: () => Promise<void>;
  atualizarNome: (nome: string) => Promise<void>;
  entrarComGoogle: (continuarConectado: boolean) => Promise<void>;
  criarConta: (nome: string, email: string, senha: string) => Promise<void>;
  solicitarRedefinicao: (email: string) => Promise<void>;
  confirmarRedefinicao: (
    codigo: string,
    senha: string,
  ) => Promise<ResultadoDaRedefinicao>;
}

interface EstadoAutenticacao {
  usuario: Usuario | null;
  carregando: boolean;
}

interface ProvedorAutenticacaoProps {
  children: ReactNode;
}

export const ContextoAutenticacao = createContext<ValorAutenticacao | null>(
  null,
);

export function ProvedorAutenticacao({ children }: ProvedorAutenticacaoProps) {
  const [estado, setEstado] = useState<EstadoAutenticacao>({
    usuario: null,
    carregando: true,
  });

  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const idUsuario = estado.usuario === null ? null : estado.usuario.id;

  useEffect(() => {
    const cancelar = observarSessao((usuario) => {
      setEstado({ usuario, carregando: false });
    });

    return cancelar;
  }, []);

  useEffect(() => {
    setFotoUrl(null);

    if (idUsuario === null) {
      return;
    }

    const controle = new AbortController();
    let ativo = true;

    buscarFotoDePerfil(controle.signal)
      .then((url) => {
        if (ativo) {
          setFotoUrl(url);
        }
      })
      .catch(() => undefined);

    return () => {
      ativo = false;
      controle.abort();
    };
  }, [idUsuario]);

  async function entrar(
    email: string,
    senha: string,
    continuarConectado: boolean,
  ) {
    try {
      const usuario = await entrarNoServico(email, senha, continuarConectado);
      setEstado({ usuario, carregando: false });
    } catch (erro) {
      repassarErro(erro, "Não foi possível entrar.");
    }
  }

  async function entrarComGoogle(continuarConectado: boolean) {
    try {
      const usuario = await entrarComGoogleNoServico(continuarConectado);
      setEstado({ usuario, carregando: false });
    } catch (erro) {
      repassarErro(erro, "Não foi possível entrar com o Google.");
    }
  }

  async function sair() {
    try {
      await sairDoServico();
      setEstado({ usuario: null, carregando: false });
    } catch (erro) {
      repassarErro(erro, "Não foi possível sair da conta.");
    }
  }

  async function atualizarNome(nome: string) {
    try {
      const usuario = await atualizarNomeNoServico(nome);
      setEstado({ usuario, carregando: false });
    } catch (erro) {
      repassarErro(erro, "Não foi possível salvar o nome.");
    }
  }

  async function criarConta(nome: string, email: string, senha: string) {
    try {
      const usuario = await criarContaNoServico(nome, email, senha);
      setEstado({ usuario, carregando: false });
    } catch (erro) {
      repassarErro(erro, "Não foi possível criar a conta.");
    }
  }

  async function confirmarRedefinicao(
    codigo: string,
    senha: string,
  ): Promise<ResultadoDaRedefinicao> {
    try {
      await confirmarRedefinicaoNoServico(codigo, senha);

      return "trocada";
    } catch (erro) {
      if (erro instanceof ErroLinkDeSenhaVencido) {
        return "linkVencido";
      }

      repassarErro(erro, "Não foi possível trocar a senha.");
    }
  }

  return (
    <ContextoAutenticacao.Provider
      value={{
        ...estado,
        fotoUrl,
        definirFoto: setFotoUrl,
        entrar,
        entrarComGoogle,
        criarConta,
        sair,
        atualizarNome,
        solicitarRedefinicao,
        confirmarRedefinicao,
      }}
    >
      {children}
    </ContextoAutenticacao.Provider>
  );
}
