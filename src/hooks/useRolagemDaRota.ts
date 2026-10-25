import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function idDoHash(hash: string): string | null {
  if (hash === "") {
    return null;
  }

  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return null;
  }
}

export function useRolagemDaRota() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const id = idDoHash(hash);
    const alvo = id === null ? null : document.getElementById(id);

    if (alvo === null) {
      window.scrollTo(0, 0);
      return;
    }

    alvo.scrollIntoView();
    alvo.focus({ preventScroll: true });
  }, [pathname, hash]);
}
