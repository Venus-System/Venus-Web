import { useEffect } from "react";

export function useTravaDeRolagem(ativa: boolean) {
  useEffect(() => {
    if (!ativa) {
      return;
    }

    const raiz = document.documentElement;
    const corpo = document.body;

    if (corpo.style.overflow === "hidden") {
      return;
    }

    const larguraDaBarra = window.innerWidth - raiz.clientWidth;
    const anterior = {
      overflow: corpo.style.overflow,
      paddingRight: corpo.style.paddingRight,
      reserva: raiz.style.getPropertyValue("scrollbar-gutter"),
    };

    raiz.style.setProperty("scrollbar-gutter", "auto");
    corpo.style.overflow = "hidden";
    corpo.style.paddingRight = `${larguraDaBarra}px`;

    return () => {
      raiz.style.setProperty("scrollbar-gutter", anterior.reserva);
      corpo.style.overflow = anterior.overflow;
      corpo.style.paddingRight = anterior.paddingRight;
    };
  }, [ativa]);
}
