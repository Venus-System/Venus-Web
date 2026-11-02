import { buscarPainel } from "../services/painel";
import { useAutenticacao } from "./useAutenticacao";
import { useRequisicao } from "./useRequisicao";

export function usePainel() {
  const { usuario } = useAutenticacao();
  const dono = usuario === null ? null : usuario.id;

  return useRequisicao(
    buscarPainel,
    "Não foi possível carregar o seu painel.",
    dono,
  );
}
