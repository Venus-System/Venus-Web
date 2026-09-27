import { createContext, useCallback, useState } from "react";
import type { ReactNode } from "react";
import type { Administrador } from "../types/admin";
import {
  entrarComoAdmin,
  sairComoAdmin,
  sessaoAdminAtual,
} from "../services/admin";

interface ValorAutenticacaoAdmin {
  administrador: Administrador | null;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
}

interface ProvedorAutenticacaoAdminProps {
  children: ReactNode;
}

export const ContextoAutenticacaoAdmin =
  createContext<ValorAutenticacaoAdmin | null>(null);

export function ProvedorAutenticacaoAdmin({
  children,
}: ProvedorAutenticacaoAdminProps) {
  const [administrador, setAdministrador] = useState<Administrador | null>(
    () => sessaoAdminAtual()?.admin ?? null,
  );

  const entrar = useCallback(async (email: string, senha: string) => {
    const sessao = await entrarComoAdmin(email, senha);
    setAdministrador(sessao.admin);
  }, []);

  const sair = useCallback(async () => {
    await sairComoAdmin();
    setAdministrador(null);
  }, []);

  return (
    <ContextoAutenticacaoAdmin.Provider value={{ administrador, entrar, sair }}>
      {children}
    </ContextoAutenticacaoAdmin.Provider>
  );
}
