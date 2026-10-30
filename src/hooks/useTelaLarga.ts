import { useEffect, useState } from "react";

const CONSULTA = "(min-width: 64rem)";

function larguraAtual(): boolean {
  return window.matchMedia(CONSULTA).matches;
}

export function useTelaLarga(): boolean {
  const [larga, setLarga] = useState(larguraAtual);

  useEffect(() => {
    const consulta = window.matchMedia(CONSULTA);

    function atualizar() {
      setLarga(consulta.matches);
    }

    consulta.addEventListener("change", atualizar);

    return () => {
      consulta.removeEventListener("change", atualizar);
    };
  }, []);

  return larga;
}
