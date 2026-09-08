import { createContext, ReactNode, useEffect, useState } from "react";
import type { Usuario } from "../types/usuario";
import {
  entrar as entrarNoServico,
  recuperarSessao,
  sair as sairDoServico,
} from "../services/autenticacao";

interface ValorAutenticacao {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (
    email: string,
    senha: string,
    continuarConectado: boolean,
  ) => Promise<void>;
  sair: () => void;
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

  useEffect(() => {
    recuperarSessao().then((usuario) => {
      setEstado({ usuario, carregando: false });
    });
  }, []);

  async function entrar(email: string, senha: string, continuarConectado: boolean) {
    const usuario = await entrarNoServico(email, senha, continuarConectado);
    setEstado({ usuario, carregando: false });
  }

  function sair() {
    sairDoServico();
    setEstado({ usuario: null, carregando: false });
  }

  return (
    <ContextoAutenticacao.Provider value={{ ...estado, entrar, sair }}>
      {children}
    </ContextoAutenticacao.Provider>
  );
}
