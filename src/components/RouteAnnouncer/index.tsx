import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const ESPERA_DO_TITULO = 400;

function RouteAnnouncer() {
  const { pathname } = useLocation();
  const [anuncio, setAnuncio] = useState("");
  const paginaAnteriorRef = useRef(pathname);

  useEffect(() => {
    if (paginaAnteriorRef.current === pathname) {
      return;
    }

    paginaAnteriorRef.current = pathname;
    setAnuncio("");

    const espera = window.setTimeout(() => {
      setAnuncio(document.title);

      const conteudo = document.querySelector("main");
      const foco = document.activeElement;
      const focoForaDoConteudo =
        foco === null || foco === document.body || !conteudo?.contains(foco);
      const temAlvoNaUrl = window.location.hash !== "";

      if (!temAlvoNaUrl && conteudo instanceof HTMLElement && focoForaDoConteudo) {
        conteudo.focus({ preventScroll: true });
      }
    }, ESPERA_DO_TITULO);

    return () => window.clearTimeout(espera);
  }, [pathname]);

  return (
    <p className="texto-oculto" aria-live="polite">
      {anuncio}
    </p>
  );
}

export default RouteAnnouncer;
