import { Link } from "react-router-dom";
import MainLayout from "../../components/MainLayout";

function NaoEncontrado() {
  return (
    <MainLayout>
      <h1>Página não encontrada</h1>

      <p>O endereço que você abriu não existe na Venus.</p>

      <Link to="/">Ir para a página inicial</Link>
    </MainLayout>
  );
}

export default NaoEncontrado