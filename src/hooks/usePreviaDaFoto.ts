import { useEffect, useState } from "react";

export function usePreviaDaFoto(arquivo: Blob | null): string | null {
  const [endereco, setEndereco] = useState<string | null>(null);

  useEffect(() => {
    if (arquivo === null) {
      setEndereco(null);
      return;
    }

    const criado = URL.createObjectURL(arquivo);
    setEndereco(criado);

    return () => URL.revokeObjectURL(criado);
  }, [arquivo]);

  return endereco;
}
