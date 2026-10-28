import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  ChartNoAxesColumn,
  ChevronRight,
  Clock,
  Eye,
  Gauge,
  Leaf,
  Menu,
  MessageSquareText,
  Plus,
  ScanText,
  ShieldCheck,
  Smile,
  TextSearch,
  UserCheck,
  UserRound,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import logo from "../../assets/Logo.svg";
import celular from "../../assets/landing/celular.png";
import celularBeneficios from "../../assets/landing/celular-beneficios.png";
import ContrastToggle from "../../components/ContrastToggle";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import { useRolagemDaRota } from "../../hooks/useRolagemDaRota";
import { useTelaLarga } from "../../hooks/useTelaLarga";
import { useTituloDaPagina } from "../../hooks/useTituloDaPagina";
import styles from "./styles.module.css";

interface SecaoDoMenu {
  id: string;
  texto: string;
}

interface CartaoDaLanding {
  id: string;
  titulo: string;
  texto: string;
  Icone: LucideIcon;
}

interface PassoDoFluxo {
  id: string;
  nome: string;
  Icone: LucideIcon;
}

interface ItemDoSobre {
  id: string;
  numero: string;
  titulo: string;
  texto: string;
}

interface PerguntaFrequente {
  id: string;
  pergunta: string;
  resposta: string;
  link?: { to: string; texto: string };
}

interface LinkDoRodape {
  to: string;
  texto: string;
}

interface ColunaDoRodape {
  id: string;
  titulo: string;
  links: LinkDoRodape[];
}

const SECOES_DO_MENU: SecaoDoMenu[] = [
  { id: "inicio", texto: "Início" },
  { id: "como-funciona", texto: "Como funciona" },
  { id: "sobre-nos", texto: "Sobre nós" },
];

const ETAPAS: CartaoDaLanding[] = [
  {
    id: "escaneie",
    titulo: "Escaneie\nseu produto",
    texto:
      "Envie uma foto do rótulo pelo site ou use a câmera do app. A Venus lê o rótulo e encontra o produto.",
    Icone: Camera,
  },
  {
    id: "conheca",
    titulo: "Conheça\nsua pele",
    texto:
      "Responda perguntas sobre o seu tipo de pele, sensibilidades e alergias para uma análise feita para você.",
    Icone: Smile,
  },
  {
    id: "nota",
    titulo: "Receba\na sua nota",
    texto:
      "A Venus compara cada ingrediente com o seu perfil e dá uma nota de 0 a 100, explicando cada um.",
    Icone: Gauge,
  },
  {
    id: "escolhas",
    titulo: "Escolhas\nconscientes",
    texto:
      "Veja o que cada ingrediente faz pela sua pele, pelo planeta e por quem produz.",
    Icone: Leaf,
  },
];

const FLUXO: PassoDoFluxo[] = [
  { id: "perfil", nome: "Perfil", Icone: UserRound },
  { id: "ocr", nome: "OCR", Icone: ScanText },
  { id: "analise", nome: "Análise", Icone: ChartNoAxesColumn },
  { id: "nota", nome: "Nota", Icone: Gauge },
  { id: "chatbot", nome: "Chatbot", Icone: MessageSquareText },
];

const BENEFICIOS: CartaoDaLanding[] = [
  {
    id: "seguranca",
    titulo: "Mais segurança",
    texto: "Saiba exatamente o que você está aplicando na sua pele.",
    Icone: ShieldCheck,
  },
  {
    id: "ambiental",
    titulo: "Consciência ambiental",
    texto:
      "Entenda o impacto dos ingredientes no meio ambiente e faça escolhas mais sustentáveis.",
    Icone: Leaf,
  },
  {
    id: "perfil",
    titulo: "Nota para o seu perfil",
    texto:
      "Uma nota feita para o seu tipo de pele, suas alergias e seus objetivos.",
    Icone: UserCheck,
  },
  {
    id: "ingredientes",
    titulo: "Conhecimento dos ingredientes",
    texto: "Saiba o que cada ingrediente faz e o impacto que ele tem.",
    Icone: TextSearch,
  },
  {
    id: "transparencia",
    titulo: "Transparência",
    texto:
      "Ingrediente que a Venus não conhece aparece como não verificado, nunca como aprovado.",
    Icone: Eye,
  },
  {
    id: "praticidade",
    titulo: "Praticidade",
    texto: "Busque pelo nome ou envie uma foto e veja a análise em segundos.",
    Icone: Clock,
  },
  {
    id: "chatbot",
    titulo: "Chatbot inteligente",
    texto:
      "Tire dúvidas com a Veninha e entenda cada ingrediente com linguagem simples.",
    Icone: MessageSquareText,
  },
];

const SOBRE: ItemDoSobre[] = [
  {
    id: "problema",
    numero: "01",
    titulo: "O problema",
    texto: "Quase ninguém entende a lista de ingredientes dos cosméticos.",
  },
  {
    id: "ideia",
    numero: "02",
    titulo: "A ideia",
    texto: "Usar uma foto do rótulo e um banco de ingredientes para explicar cada um em segundos.",
  },
  {
    id: "missao",
    numero: "03",
    titulo: "A missão",
    texto: "Ajudar cada pessoa a escolher com segurança e consciência.",
  },
];

const PERGUNTAS: PerguntaFrequente[] = [
  {
    id: "conta",
    pergunta: "Preciso criar uma conta?",
    resposta:
      "Para pesquisar, não. Sem conta você busca qualquer produto do catálogo e vê a avaliação geral. Para escanear e receber a nota feita para a sua pele, crie uma conta e responda o seu perfil.",
  },
  {
    id: "marca",
    pergunta: "Funciona com qualquer marca?",
    resposta:
      "Funciona com qualquer marca que esteja no catálogo do Venus. Se o produto ainda não estiver lá, você pode adicioná-lo pelo app no celular. Ingrediente que a Venus não conhece aparece como não verificado, nunca como aprovado.",
  },
  {
    id: "dados",
    pergunta: "Meus dados ficam seguros?",
    resposta:
      "Seus dados são usados só para as análises e não são vendidos para ninguém. A política de privacidade, escrita com base na LGPD, explica o que coletamos, para quê e como pedir a exclusão.",
    link: { to: "/privacidade", texto: "Ler a política de privacidade" },
  },
  {
    id: "dermatologista",
    pergunta: "O Venus substitui o dermatologista?",
    resposta:
      "Não. O Venus ajuda você a entender seus produtos, mas não faz diagnóstico. Para qualquer problema de pele, procure um dermatologista.",
  },
];

const SECOES_DO_RODAPE: SecaoDoMenu[] = [
  { id: "como-funciona", texto: "Como funciona" },
  { id: "sobre-nos", texto: "Sobre nós" },
  { id: "perguntas-frequentes", texto: "Perguntas frequentes" },
];

const COLUNAS_DO_RODAPE: ColunaDoRodape[] = [
  {
    id: "venus",
    titulo: "O projeto",
    links: [
      { to: "/sobre", texto: "Quem faz o Venus" },
      { to: "/metodologia", texto: "Metodologia" },
      { to: "/fontes", texto: "Fontes" },
    ],
  },
  {
    id: "legal",
    titulo: "Legal",
    links: [
      { to: "/privacidade", texto: "Privacidade" },
      { to: "/termos", texto: "Termos" },
      { to: "/cookies", texto: "Cookies" },
      { to: "/acessibilidade", texto: "Acessibilidade" },
    ],
  },
];

const ID_DO_MENU = "menu-da-landing";

function Inicio() {
  const { usuario } = useAutenticacao();
  const telaLarga = useTelaLarga();
  const [menuAberto, setMenuAberto] = useState(false);
  const botaoDoMenuRef = useRef<HTMLButtonElement>(null);

  useTituloDaPagina("");
  useRolagemDaRota();

  useEffect(() => {
    setMenuAberto(false);
  }, [telaLarga]);

  function fecharComEsc(evento: KeyboardEvent<HTMLElement>) {
    if (evento.key === "Escape" && menuAberto) {
      setMenuAberto(false);
      botaoDoMenuRef.current?.focus();
    }
  }

  return (
    <div className={styles.pagina}>
      <a className={styles.skipLink} href="#conteudo" accessKey="1">
        Ir para o conteúdo [1]
      </a>

      <header className={styles.cabecalho} onKeyDown={fecharComEsc}>
        <a className={styles.marca} href="#inicio">
          <img className={styles.logo} src={logo} alt="" />
          <span className={styles.nomeDaMarca}>Venus</span>
        </a>

        <button
          ref={botaoDoMenuRef}
          type="button"
          className={styles.botaoMenu}
          aria-label="Menu"
          aria-expanded={menuAberto}
          aria-controls={ID_DO_MENU}
          onClick={() => setMenuAberto((aberto) => !aberto)}
        >
          {menuAberto ? (
            <X className={styles.iconeMenu} aria-hidden="true" />
          ) : (
            <Menu className={styles.iconeMenu} aria-hidden="true" />
          )}
        </button>

        <nav
          id={ID_DO_MENU}
          aria-label="Seções da página"
          className={menuAberto ? `${styles.nav} ${styles.navAberto}` : styles.nav}
        >
          <ul className={styles.menu}>
            {SECOES_DO_MENU.map((secao) => (
              <li key={secao.id}>
                <a
                  className={styles.menuLink}
                  href={`#${secao.id}`}
                  onClick={() => setMenuAberto(false)}
                >
                  {secao.texto}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.acoes}>
          <ContrastToggle className={styles.contraste} />

          {usuario === null ? (
            <Link className={styles.botaoClaro} to="/login">
              Login
            </Link>
          ) : (
            <Link className={styles.botaoClaro} to="/dashboard">
              Meu painel
            </Link>
          )}
        </div>
      </header>

      <main id="conteudo" tabIndex={-1}>
        <section className={styles.inicio} aria-labelledby="inicio">
          <div className={styles.inicioConteudo}>
            <div className={styles.textoDoInicio}>
              <h1 id="inicio" className={styles.titulo} tabIndex={-1}>
                Venus
              </h1>
              <p className={styles.subtitulo}>
                Escaneie. Analise.
                <br />
                Escolha com
                <br />
                confiança.
              </p>
            </div>

            <div className={styles.midia}>
              <img
                className={styles.celular}
                src={celular}
                alt="Celular com a tela de boas-vindas do aplicativo Venus"
                width={591}
                height={693}
              />
            </div>
          </div>
        </section>

        <section className={styles.comoFunciona} aria-labelledby="como-funciona">
          <div className={styles.container}>
            <h2 id="como-funciona" className={styles.tituloDaSecao} tabIndex={-1}>
              Como <span className={styles.destaque}>funciona</span>
            </h2>

            <ol className={styles.etapas}>
              {ETAPAS.map(({ id, titulo, texto, Icone }) => (
                <li key={id} className={styles.etapa}>
                  <span className={styles.etapaIcone}>
                    <Icone aria-hidden="true" />
                  </span>
                  <h3 className={styles.etapaTitulo}>{titulo}</h3>
                  <p className={styles.etapaTexto}>{texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.tecnologia} aria-labelledby="titulo-tecnologia">
          <div className={`${styles.container} ${styles.tecnologiaConteudo}`}>
            <div className={styles.tecnologiaTexto}>
              <h2 id="titulo-tecnologia" className={styles.tituloDaSecao}>
                Tecnologia que
                <br />
                trabalha por <span className={styles.destaque}>você</span>
              </h2>
              <p>
                Unimos um banco com milhares de ingredientes, regras de
                classificação e inteligência artificial para explicar cada
                rótulo de um jeito claro.
              </p>
            </div>

            <ol className={styles.fluxo} aria-label="Caminho de uma análise">
              {FLUXO.map(({ id, nome, Icone }) => (
                <li key={id} className={styles.passo}>
                  <span className={styles.passoIcone}>
                    <Icone aria-hidden="true" />
                  </span>
                  <span className={styles.passoNome}>{nome}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.beneficios} aria-labelledby="titulo-beneficios">
          <div className={styles.container}>
            <h2 id="titulo-beneficios" className={styles.tituloDaSecao}>
              Benefícios do <span className={styles.destaque}>Venus</span>
            </h2>

            <div className={styles.beneficiosGrade}>
              {BENEFICIOS.map(({ id, titulo, texto, Icone }) => (
                <div key={id} className={styles.beneficio}>
                  <span className={styles.beneficioIcone}>
                    <Icone aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className={styles.beneficioTitulo}>{titulo}</h3>
                    <p className={styles.beneficioTexto}>{texto}</p>
                  </div>
                </div>
              ))}

              <div className={styles.beneficiosCelular}>
                <img src={celularBeneficios} alt="" width={800} height={708} />
              </div>
            </div>

            <div className={styles.chamada}>
              <p className={styles.chamadaTexto}>
                Sua pele. Suas escolhas.
                <br />
                Sua <span className={styles.chamadaDestaque}>tecnologia.</span>
              </p>

              <Link className={styles.botaoClaro} to="/escanear">
                Começar análise
                <ChevronRight className={styles.seta} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.sobre} aria-labelledby="sobre-nos">
          <div className={`${styles.container} ${styles.sobreConteudo}`}>
            <div className={styles.sobreTexto}>
              <p className={styles.etiqueta}>Sobre nós</p>
              <h2 id="sobre-nos" className={styles.sobreTitulo} tabIndex={-1}>
                Criamos o Venus porque entender um rótulo não deveria exigir um{" "}
                <span className={styles.sobreDestaque}>diploma em química.</span>
              </h2>
              <p className={styles.sobreParagrafo}>
                Somos estudantes do ensino médio técnico. O Venus nasceu de um
                trabalho interdisciplinar e virou uma vontade real: deixar a
                informação sobre cosméticos clara para todo mundo.
              </p>
              <Link className={styles.botaoClaro} to="/sobre">
                Conhecer a equipe
                <ChevronRight className={styles.seta} aria-hidden="true" />
              </Link>
            </div>

            <ol className={styles.sobreLista}>
              {SOBRE.map(({ id, numero, titulo, texto }) => (
                <li key={id} className={styles.sobreItem}>
                  <span className={styles.sobreNumero} aria-hidden="true">
                    {numero}
                  </span>
                  <div>
                    <h3 className={styles.sobreItemTitulo}>{titulo}</h3>
                    <p className={styles.sobreItemTexto}>{texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.perguntas} aria-labelledby="perguntas-frequentes">
          <div className={styles.perguntasConteudo}>
            <h2
              id="perguntas-frequentes"
              className={`${styles.tituloDaSecao} ${styles.perguntasTitulo}`}
              tabIndex={-1}
            >
              Perguntas <span className={styles.destaque}>frequentes</span>
            </h2>

            {PERGUNTAS.map(({ id, pergunta, resposta, link }) => (
              <details key={id} className={styles.pergunta}>
                <summary className={styles.perguntaTitulo}>
                  {pergunta}
                  <Plus className={styles.perguntaIcone} aria-hidden="true" />
                </summary>
                <div className={styles.perguntaResposta}>
                  <p>{resposta}</p>
                  {link === undefined ? null : <Link to={link.to}>{link.texto}</Link>}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.rodape}>
        <div className={`${styles.container} ${styles.rodapeTopo}`}>
          <div className={styles.rodapeMarca}>
            <a className={styles.rodapeLogo} href="#inicio">
              <img className={styles.logo} src={logo} alt="" />
              Venus
            </a>
            <p>Cuide da sua pele com informação.</p>
          </div>

          <div className={styles.rodapeColuna}>
            <p id="rodape-navegacao" className={styles.rodapeTitulo}>
              Navegação
            </p>
            <ul className={styles.rodapeLista} aria-labelledby="rodape-navegacao">
              {SECOES_DO_RODAPE.map((secao) => (
                <li key={secao.id}>
                  <a className={styles.rodapeLink} href={`#${secao.id}`}>
                    {secao.texto}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {COLUNAS_DO_RODAPE.map((coluna) => (
            <div key={coluna.id} className={styles.rodapeColuna}>
              <p id={`rodape-${coluna.id}`} className={styles.rodapeTitulo}>
                {coluna.titulo}
              </p>
              <ul className={styles.rodapeLista} aria-labelledby={`rodape-${coluna.id}`}>
                {coluna.links.map((link) => (
                  <li key={link.to}>
                    <Link className={styles.rodapeLink} to={link.to}>
                      {link.texto}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`${styles.container} ${styles.rodapeFinal}`}>
          <p>© {new Date().getFullYear()} Venus · Trabalho interdisciplinar</p>
          <p>O Venus não substitui a orientação de um dermatologista.</p>
        </div>
      </footer>
    </div>
  );
}

export default Inicio;
