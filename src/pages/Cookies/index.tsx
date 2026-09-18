import DocumentLayout from "../../components/DocumentLayout";
import conteudo from "./conteudo.md?raw";

function Cookies() {
  return <DocumentLayout title="Política de Cookies" content={conteudo} />;
}

export default Cookies;
