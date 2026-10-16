import { createContext, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useAutenticacao } from "../hooks/useAutenticacao";
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
  const { usuario, sair: sairDaConta } = useAutenticacao();
  const usuarioId = usuario === null ? null : usuario.id;
  const ultimoUsuarioRef = useRef(usuarioId);
  const [administrador, setAdministrador] = useState<Administrador | null>(
    () => sessaoAdminAtual()?.admin ?? null,
  );

  useEffect(() => {
    const anterior = ultimoUsuarioRef.current;

    ultimoUsuarioRef.current = usuarioId;

    if (usuarioId === null || usuarioId === anterior) {
      return;
    }

    sairComoAdmin()
      .then(() => setAdministrador(null))
      .catch(() => undefined);
  }, [usuarioId]);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      const sessao = await entrarComoAdmin(email, senha);

      await sairDaConta();
      setAdministrador(sessao.admin);
    },
    [sairDaConta],
  );

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
