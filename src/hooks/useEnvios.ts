import { buscarEnvios } from "../services/envios";
import { useAutenticacao } from "./useAutenticacao";
import { useRequisicao } from "./useRequisicao";

export function useEnvios() {
  const { usuario } = useAutenticacao();
  const dono = usuario === null ? null : usuario.id;

  return useRequisicao(
    buscarEnvios,
    "Não foi possível carregar os seus envios.",
    dono,
  );
}
