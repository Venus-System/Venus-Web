import DocumentLayout from "../../components/DocumentLayout";
import conteudo from "./conteudo.md?raw";

function Privacidade() {
  return <DocumentLayout title="Política de Privacidade" content={conteudo} />;
}

export default Privacidade;
