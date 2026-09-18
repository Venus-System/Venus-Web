import DocumentLayout from "../../components/DocumentLayout";
import conteudo from "./conteudo.md?raw";

function Termos() {
  return <DocumentLayout title="Termos de Uso" content={conteudo} />;
}

export default Termos;
