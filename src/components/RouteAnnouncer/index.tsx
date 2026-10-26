import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const ESPERA_DO_TITULO = 400;

function RouteAnnouncer() {
  const { pathname, hash } = useLocation();
  const [anuncio, setAnuncio] = useState("");
  const enderecoAnteriorRef = useRef(pathname + hash);

  useEffect(() => {
    const endereco = pathname + hash;

    if (enderecoAnteriorRef.current === endereco) {
      return;
    }

    enderecoAnteriorRef.current = endereco;
    setAnuncio("");

    const espera = window.setTimeout(() => {
      setAnuncio(document.title);

      const conteudo = document.querySelector("main");
      const foco = document.activeElement;
      const focoForaDoConteudo =
        foco === null || foco === document.body || !conteudo?.contains(foco);

      if (hash === "" && conteudo instanceof HTMLElement && focoForaDoConteudo) {
        conteudo.focus({ preventScroll: true });
      }
    }, ESPERA_DO_TITULO);

    return () => window.clearTimeout(espera);
  }, [pathname, hash]);

  return (
    <p className="texto-oculto" aria-live="polite">
      {anuncio}
    </p>
  );
}

export default RouteAnnouncer;
