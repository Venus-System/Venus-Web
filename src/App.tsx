import { Route, Routes } from "react-router-dom";
import Componentes from "./pages/Componentes";
import Fontes from "./pages/Fontes";
import Inicio from "./pages/Inicio";
import Metodologia from "./pages/Metodologia";
import Pesquisa from "./pages/Pesquisa";
import Produto from "./pages/Produto";
import Sobre from "./pages/Sobre";
import NaoEncontrado from "./pages/NaoEncontrado";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/componentes" element={<Componentes />} />
      <Route path="/pesquisa" element={<Pesquisa />} />
      <Route path="/produto/:slug" element={<Produto />} />
      <Route path="/sobre" element={<Sobre />} />
      <Route path="/metodologia" element={<Metodologia />} />
      <Route path="/fontes" element={<Fontes />} />
      <Route path="*" element={<NaoEncontrado />} />
    </Routes>
  );
}

export default App;
