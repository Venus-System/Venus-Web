import { Route, Routes } from "react-router-dom";
import Componentes from "./pages/Componentes";
import Inicio from "./pages/Inicio";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/componentes" element={<Componentes />} />
    </Routes>
  );
}

export default App;
