import type { ReactNode } from 'react';
import { NavPublica } from '../NavPublica';
import { Rodape } from '../Rodape';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <a className="pular-para-conteudo" href="#conteudo-principal">
        Pular para o conteúdo
      </a>
      <NavPublica />
      <main id="conteudo-principal" className="conteudo">
        {children}
      </main>
      <Rodape />
    </>
  );
}
