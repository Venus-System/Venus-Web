import MainLayout from "../../components/MainLayout";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import styles from "./styles.module.css";

function Dashboard() {
  const { usuario } = useAutenticacao();

  if (!usuario) {
    return null;
  }

  return (
    <MainLayout>
      <div className={styles.page}>
        <h1>Olá, {usuario.name}.</h1>
        <p className={styles.texto}>
          O painel com histórico, favoritos e análises personalizadas entra na
          semana 7. Por enquanto, esta tela existe para provar que a rota
          privada funciona: sem sessão, você teria sido levado ao login.
        </p>
      </div>
    </MainLayout>
  );
}

export default Dashboard;
