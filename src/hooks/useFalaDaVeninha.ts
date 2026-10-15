import { useEffect, useRef, useState } from "react";
import type { MensagemDoChat } from "../types/chat";
import { tocarPop } from "../utils/somDaVeninha";

const INTERVALO = 90;
const DURACAO_MAXIMA = 3000;
const LETRAS_POR_SILABA = 3;
const PASSOS_MAXIMOS = Math.floor(DURACAO_MAXIMA / INTERVALO / 2) * 2;

interface Fala {
  silabas: string;
  passo: number;
  total: number;
}

const CALADA: Fala = { silabas: "", passo: 0, total: 0 };

function iniciais(texto: string): string {
  const letras = texto.replace(/[^\p{L}]/gu, "");
  let silabas = "";

  for (let i = 0; i < letras.length; i += LETRAS_POR_SILABA) {
    silabas += letras.charAt(i);
  }

  return silabas;
}

function falaDe(texto: string): Fala {
  const silabas = iniciais(texto);

  return {
    silabas,
    passo: 0,
    total: Math.min(silabas.length * 2, PASSOS_MAXIMOS),
  };
}

export function useFalaDaVeninha(
  ultima: MensagemDoChat | undefined,
  ativa: boolean,
  comSom: boolean,
): boolean {
  const vistaRef = useRef<string | null>(
    ultima === undefined ? null : ultima.id,
  );
  const [fala, setFala] = useState<Fala>(CALADA);

  useEffect(() => {
    if (ultima === undefined || ultima.id === vistaRef.current) {
      return;
    }

    vistaRef.current = ultima.id;

    if (ativa && ultima.author === "veninha") {
      setFala(falaDe(ultima.text));
    }
  }, [ultima, ativa]);

  useEffect(() => {
    if (!ativa) {
      setFala(CALADA);
    }
  }, [ativa]);

  useEffect(() => {
    if (fala.passo >= fala.total) {
      return;
    }

    if (comSom && fala.passo % 2 === 0) {
      tocarPop(fala.silabas.charAt(fala.passo / 2));
    }

    const espera = window.setTimeout(() => {
      setFala((atual) => ({ ...atual, passo: atual.passo + 1 }));
    }, INTERVALO);

    return () => {
      window.clearTimeout(espera);
    };
  }, [fala.passo, fala.total, fala.silabas, comSom]);

  return fala.passo < fala.total && fala.passo % 2 === 0;
}
