import MainLayout from "../../components/MainLayout";
import DocumentLayout from "../../components/DocumentLayout";
import conteudo from "./conteudo.md?raw";

function Termos() {
  return (
    <MainLayout>
      <DocumentLayout title="Termos de Uso" content={conteudo} />
    </MainLayout>
  );
}

export default Termos;
