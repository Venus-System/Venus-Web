import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useRolagemDaRota() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const alvo =
      hash === "" ? null : document.getElementById(decodeURIComponent(hash.slice(1)));

    if (alvo === null) {
      window.scrollTo(0, 0);
      return;
    }

    alvo.scrollIntoView();
    alvo.focus({ preventScroll: true });
  }, [pathname, hash]);
}
