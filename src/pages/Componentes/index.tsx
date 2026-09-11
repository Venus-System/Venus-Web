import { Search } from "lucide-react";
import { useState } from "react";
import logo from "../../assets/Logo.svg";
import Button from "../../components/Button";
import Chip from "../../components/Chip";
import Input from "../../components/Input";
import MainLayout from "../../components/MainLayout";
import ProductCard from "../../components/ProductCard";
import ProductRow from "../../components/ProductRow";
import RiskBadge from "../../components/RiskBadge";
import ScoreBadge from "../../components/ScoreBadge";
import ScoreBars from "../../components/ScoreBars";
import { produtosMock } from "../../services/mocks/produtos";
import type { RiskLevel } from "../../types/ingrediente";
import styles from "./styles.module.css";

const LEVELS: RiskLevel[] = ["safe", "warning", "avoid", "no-data"];

const CHIPS_INICIAIS = ["Lanolina", "Óleo de amêndoas", "Vegano"];

function Componentes() {
  const [alergias, setAlergias] = useState<string[]>(CHIPS_INICIAIS);

  const aprovado = produtosMock[0];
  const semDados = produtosMock[4];
  const comImagem = { ...aprovado, imageUrl: logo };

  function removerAlergia(nome: string) {
    setAlergias((atuais) => atuais.filter((item) => item !== nome));
  }

  return (
    <MainLayout>
      <h1>Componentes</h1>

      <p>
        Vitrine de desenvolvimento. Cada componente aparece aqui em todos os
        estados que sabe assumir, sem depender de nenhuma tela.
      </p>

      <section className={styles.section}>
        <h2>Button</h2>

        <div className={styles.row}>
          <Button variant="primary">Escanear rótulo</Button>
          <Button variant="secondary">Continuar com e-mail</Button>
          <Button variant="text">Fazer depois</Button>
          <Button variant="primary" disabled>
            Indisponível
          </Button>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Input</h2>

        <div className={styles.grid}>
          <Input
            id="demo-email"
            label="E-mail"
            type="email"
            placeholder="voce@email.com"
          />

          <Input
            id="demo-senha"
            label="Senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            revealable
          />

          <Input
            id="demo-senha-erro"
            label="Senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            revealable
            error="A senha precisa de pelo menos 8 caracteres."
          />

          <Input
            id="demo-busca"
            label="Buscar produto"
            type="search"
            placeholder="Buscar produto..."
            icon={<Search />}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2>Chip</h2>

        <div className={styles.row}>
          <Chip label="Cruelty-free" level="safe" />
          <Chip label="Vegano" level="safe" />
          <Chip label="Contém fragrância" level="warning" />
          <Chip label="Fórmula não verificada" level="no-data" />
        </div>

        <div className={styles.row}>
          {alergias.map((nome) => (
            <Chip
              key={nome}
              label={nome}
              onRemove={() => removerAlergia(nome)}
            />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>RiskBadge</h2>

        <div className={styles.row}>
          {LEVELS.map((nivel) => (
            <RiskBadge key={nivel} level={nivel} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>ScoreBadge</h2>

        <div className={styles.row}>
          <ScoreBadge score={87} level="safe" />
          <ScoreBadge score={62} level="warning" />
          <ScoreBadge score={31} level="avoid" />
          <ScoreBadge score={null} level="no-data" />
        </div>
      </section>

      <section className={styles.section}>
        <h2>ScoreBars</h2>

        <div className={styles.grid}>
          <ScoreBars notas={aprovado.scores} />
          <ScoreBars notas={semDados.scores} />
        </div>
      </section>

      <section className={styles.section}>
        <h2>ProductCard</h2>

        <div className={styles.grid}>
          <ProductCard produto={comImagem} />
          <ProductCard produto={produtosMock[3]} />
        </div>
      </section>

      <section className={styles.section}>
        <h2>ProductRow</h2>

        <div className={styles.rows}>
          <ProductRow produto={comImagem} realizadaEm="2026-08-26T14:32:00Z" />
          <ProductRow
            produto={produtosMock[2]}
            realizadaEm="2026-08-25T09:05:00Z"
          />
          <ProductRow produto={semDados} realizadaEm="2026-07-05T18:40:00Z" />
        </div>
      </section>
    </MainLayout>
  );
}

export default Componentes;
