import MainLayout from "../../components/MainLayout";
import DocumentLayout from "../../components/DocumentLayout";
import conteudo from "./conteudo.md?raw";

function Cookies() {
  return (
    <MainLayout>
      <DocumentLayout title="Política de Cookies" content={conteudo} />
    </MainLayout>
  );
}

export default Cookies;
