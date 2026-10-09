import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Usuario } from "../types/usuario";
import {
  entrar as entrarNoServico,
  entrarComGoogle as entrarComGoogleNoServico,
  observarSessao,
  sair as sairDoServico,
  criarConta as criarContaNoServico,
  atualizarNome as atualizarNomeNoServico,
} from "../services/autenticacao";
import { buscarFotoDePerfil } from "../services/avatar";

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
    if (idUsuario === null) {
      setFotoUrl(null);
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
    const usuario = await entrarNoServico(email, senha, continuarConectado);
    setEstado({ usuario, carregando: false });
  }

  async function entrarComGoogle(continuarConectado: boolean) {
    const usuario = await entrarComGoogleNoServico(continuarConectado);
    setEstado({ usuario, carregando: false });
  }

  async function sair() {
    await sairDoServico();
    setEstado({ usuario: null, carregando: false });
  }

  async function atualizarNome(nome: string) {
    const usuario = await atualizarNomeNoServico(nome);
    setEstado({ usuario, carregando: false });
  }

  async function criarConta(nome: string, email: string, senha: string) {
    const usuario = await criarContaNoServico(nome, email, senha);
    setEstado({ usuario, carregando: false });
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
      }}
    >
      {children}
    </ContextoAutenticacao.Provider>
  );
}
