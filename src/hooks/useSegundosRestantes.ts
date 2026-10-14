import { useEffect, useState } from "react";

const UM_SEGUNDO = 1000;

export function useSegundosRestantes(ate: number | null): number {
  const [, setTique] = useState(0);
  const segundos =
    ate === null ? 0 : Math.max(0, Math.ceil((ate - Date.now()) / UM_SEGUNDO));
  const contando = segundos > 0;

  useEffect(() => {
    if (!contando) {
      return;
    }

    const relogio = window.setInterval(() => {
      setTique((atual) => atual + 1);
    }, UM_SEGUNDO);

    return () => window.clearInterval(relogio);
  }, [contando]);

  return segundos;
}
