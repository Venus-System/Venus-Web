import { Route, Routes } from "react-router-dom";
import Componentes from "./pages/Componentes";
import Inicio from "./pages/Inicio";
import Produto from "./pages/Produto";
import NaoEncontrado from "./pages/NaoEncontrado";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="*" element={<NaoEncontrado />} />
      <Route path="/componentes" element={<Componentes />} />
      <Route path="/produto/:slug" element={<Produto />} />
    </Routes>
  );
}

export default App;
