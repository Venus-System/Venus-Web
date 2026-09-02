import { Route, Routes } from "react-router-dom";
import Componentes from "./pages/Componentes";
import Inicio from "./pages/Inicio";
import Produto from "./pages/Produto";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/componentes" element={<Componentes />} />
      <Route path="/produto/:slug" element={<Produto />} />
    </Routes>
  );
}

export default App;
