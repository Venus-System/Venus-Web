import MainLayout from "../../components/MainLayout";
import DocumentLayout from "../../components/DocumentLayout";
import conteudo from "./conteudo.md?raw";

function Privacidade() {
  return (
    <MainLayout>
      <DocumentLayout title="Política de Privacidade" content={conteudo} />
    </MainLayout>
  );
}

export default Privacidade;
