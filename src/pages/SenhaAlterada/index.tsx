import { useEffect, useRef } from "react";
import { CircleCheck } from "lucide-react";
import Button from "../../components/Button";
import LayoutAutenticacao from "../../components/LayoutAutenticacao";
import styles from "./styles.module.css";

function SenhaAlterada() {
  const tituloRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    tituloRef.current?.focus();
  }, []);

  return (
    <LayoutAutenticacao>
      <CircleCheck className={styles.icone} aria-hidden="true" />

      <h1 className={styles.titulo} ref={tituloRef} tabIndex={-1}>
        Senha trocada.{" "}
        <span className={styles.destaque}>Bem-vindo de volta</span>
      </h1>

      <p className={styles.texto}>
        Sua conta está segura. Entre com a senha nova e continue de onde parou.
      </p>

      <Button to="/login">Ir para o login</Button>
    </LayoutAutenticacao>
  );
}

export default SenhaAlterada;
