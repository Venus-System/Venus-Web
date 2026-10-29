# Venus

Aplicação que lê a lista de ingredientes de um cosmético e explica o que cada
ingrediente faz para a pele da pessoa, para o planeta e para quem produz.

**Aplicação publicada:** https://venus-web-application.vercel.app/

Projeto interdisciplinar do Instituto J&F Germinare. Este repositório é a
interface web, feita em React com TypeScript, Vite e React Router.

## O que dá para fazer

- **Pesquisar produtos** por nome, categoria e marca, e abrir a análise de cada
  um: nota geral, quatro notas de qualidade (saúde, meio ambiente, ética e
  desempenho) e o semáforo de cada ingrediente.
- **Responder o questionário de perfil** (pele, cabelo, faixa etária e, com
  autorização, dados de saúde e alergias) para ver a nota pessoal de cada
  produto. Ingrediente contraindicado ou alérgeno derruba a nota, mesmo que o
  produto seja bom no resto.
- **Comparar dois produtos** lado a lado.
- **Buscar pela foto** do rótulo: o texto é lido no próprio navegador e a
  Venus procura o produto no catálogo. Produtos novos são enviados pelo app
  Venus no celular e passam pela fila de aprovação; a web mostra os envios de
  cada pessoa.
- **Conversar com a Veninha**, a assistente de IA, que explica ingredientes e
  produtos e pode montar uma rotina na Google Agenda, se a pessoa conectar.
- **Avaliar produtos**, votar em avaliações úteis e denunciar avaliações.
- **Guardar favoritos** e consultar o histórico de análises e de envios.
- **Área administrativa**: fila de aprovação dos produtos enviados, com a foto
  do rótulo, o texto lido e a decisão sobre cada ingrediente novo.

Sem conta, a página de produto mostra só a avaliação geral, sem nenhum dado
pessoal.

## Como rodar

Precisa do Node 20 ou mais novo (a CI usa o 20).

```bash
npm install
cp .env.example .env
npm run dev
```

O Vite abre a aplicação em `http://localhost:5173`.

Com o `.env.example` copiado sem mudanças, a aplicação roda com **dados
falsos** (`VITE_USAR_MOCK=true`): não precisa de backend nem de Firebase. Para
entrar, use qualquer e-mail e uma senha de pelo menos 8 caracteres.

Outros comandos:

```bash
npm run build     # confere os tipos com tsc e gera o build de produção em dist/
npm run preview   # serve o dist/ localmente, para conferir o build
```

## Variáveis de ambiente

Os valores de exemplo, com a explicação de cada um, estão no `.env.example`. O
único lugar do código que lê variáveis de ambiente é `src/config/`.

| Variável | Para quê | Obrigatória |
|---|---|---|
| `VITE_USAR_MOCK` | `true` usa os dados falsos de `src/services/mocks/`; `false` chama as APIs reais | não (sem ela, vale `true`) |
| `VITE_API_URL` | endereço da API principal (Venus-CRUD) | sim, quando `VITE_USAR_MOCK=false` |
| `VITE_API_SCANS_URL` | endereço da API usado só nas rotas de scan (fila do admin e Enviados) | não (sem ela, usa o `VITE_API_URL`) |
| `VITE_CLASSIFICACAO_URL` | API de Classificação, que calcula a nota pessoal | não (sem ela, só aparece a avaliação geral) |
| `VITE_IA_API_URL` | API da IA, que responde o chat da Veninha | não (sem ela, o chat avisa que está indisponível) |
| `VITE_GOOGLE_CLIENT_ID` | cliente OAuth da Google Agenda | não (sem ela, o chat não oferece conectar a agenda) |
| `VITE_FIREBASE_*` (seis variáveis) | Firebase Authentication | sim, para entrar com conta real |

Os endereços vão sem barra no fim. Se `VITE_USAR_MOCK=false` e o
`VITE_API_URL` estiver vazio, a aplicação para ao abrir e diz qual variável
falta, em vez de mandar pedidos para um endereço errado.

Das seis variáveis do Firebase, só `API_KEY`, `AUTH_DOMAIN` e `PROJECT_ID` são
necessárias para autenticar. Sem elas, o login cai no modo falso e o botão de
entrar com Google aparece desabilitado, com a explicação. A `apiKey` do
Firebase não é segredo: ela identifica o projeto e vai no pacote publicado. O
que protege o projeto é a validação do token no servidor.

No console do Firebase, três configurações importam:

- ativar **E-mail/senha** e **Google** em Sign-in method;
- incluir o domínio publicado em Authorized domains;
- apontar o link do e-mail de redefinição de senha para `/esqueci-senha/nova`.
  Sem isso, o link abre a página do próprio Firebase e nunca chega à tela do
  projeto.

## Rotas

| Rota | Tela | Acesso |
|---|---|---|
| `/` | página inicial: como funciona, benefícios, sobre nós e perguntas frequentes | público |
| `/pesquisa` | busca de produtos | público |
| `/produto/:slug` | análise do produto | público (nota pessoal com conta) |
| `/comparar` | comparação de dois produtos | público |
| `/reacao` | "Tive uma reação": o que na fórmula merece atenção | público |
| `/sobre` | sobre o projeto e a equipe | público |
| `/metodologia` | como as notas são calculadas | público |
| `/fontes` | de onde vêm os dados | público |
| `/privacidade`, `/termos`, `/cookies` | documentos legais | público |
| `/acessibilidade` | declaração de acessibilidade e atalhos | público |
| `/login`, `/criar-conta` | entrar e criar conta | público |
| `/esqueci-senha`, `/esqueci-senha/nova`, `/esqueci-senha/pronto` | recuperação de senha | público |
| `/dashboard` | painel da pessoa | com conta |
| `/perfil` | perfil, foto, autorização de saúde e saída | com conta |
| `/perguntas` | questionário de perfil | com conta |
| `/escanear` | busca pela foto do rótulo | com conta |
| `/historico`, `/favoritos`, `/historico/enviados` | histórico, favoritos e envios | com conta |
| `/integracoes/google-agenda` | volta da conexão com a Google Agenda | com conta |
| `/admin/login` | entrada da área administrativa | público |
| `/admin/fila/:id?` | fila de aprovação | equipe administrativa |
| `*` | página não encontrada, com caminho de volta | público |

As rotas com conta redirecionam para o login e voltam para a página pedida
depois de entrar. Em desenvolvimento existe também `/componentes`, uma vitrine
de todos os componentes em todos os estados, usada para conferir contraste e
foco. Ela não entra no build publicado.

## Estrutura de `src/`

| Pasta | O que guarda |
|---|---|
| `assets/` | imagens e ícones versionados, como o logo e a Veninha |
| `components/` | peças reutilizáveis da interface, uma pasta por componente |
| `config/` | o único lugar que lê variáveis de ambiente |
| `contexts/` | estado global: autenticação, autenticação do admin e chat |
| `hooks/` | hooks próprios, reaproveitados entre telas |
| `pages/` | uma pasta por tela |
| `services/` | toda a comunicação com as APIs e com o Firebase |
| `types/` | interfaces do domínio, organizadas por assunto |
| `styles/` | tokens de design (cores, fontes, espaços) e estilos globais |
| `utils/` | funções auxiliares, como validação de formulários |

A regra que organiza tudo: **componente cuida da aparência, serviço cuida de
conversar com a API, tipo descreve o formato do dado.** Nenhum componente nem
página chama a API diretamente: eles usam um hook, e o hook chama o serviço.
Nenhum serviço decide como algo é exibido.

Todo componente e toda página ficam em `Nome/index.tsx`, na própria pasta, com
o CSS ao lado em `styles.module.css`. Cores, fontes e raios vêm sempre das
variáveis de `src/styles/tokens.css`.

Dentro de `services/`, a pasta `api/` conhece o formato de cada backend e
traduz as respostas para os tipos do domínio, e a pasta `mocks/` guarda dados
falsos já no formato do domínio. As funções de serviço têm a mesma assinatura
nos dois modos, então trocar `VITE_USAR_MOCK` não muda nenhuma tela.

## Acessibilidade

O site segue a WCAG 2.2 no nível AA e o eMAG. Tudo funciona só com o teclado,
há links de pular para o conteúdo (com teclas de atalho), anúncio da troca de
página para leitores de tela, botão de alto contraste, suporte ao modo de alto
contraste do Windows e tradução para Libras pelo VLibras. A lista completa, com
as limitações conhecidas, está na página
[/acessibilidade](https://venus-web-application.vercel.app/acessibilidade).

## Onde está cada requisito da disciplina

Requisitos de Desenvolvimento de Aplicações Dinâmicas (DAD), com o lugar do
código que serve de exemplo para cada um.

### Mínimo

| Requisito | Onde ver |
|---|---|
| 1. Vite com React e TypeScript, sem `.js` nem `.jsx` em `src/` | `package.json`, `tsconfig.json` (modo estrito) e a checagem da CI |
| 2. Componentes e páginas em pasta própria com `index.tsx` | `src/components/` (77 pastas) e `src/pages/` (30 pastas) |
| 3. Componentes com responsabilidade única | `Button`, `Chip`, `Selo`, `RiskBadge`, `ScoreBadge` e `StatCard`, em `src/components/`; nenhum componente importa serviço |
| 4. Props tipadas e tipos do domínio em `src/types/`, sem `any` | `ButtonProps` em `src/components/Button/index.tsx`; `src/types/produto.ts`; a checagem de `any` da CI |
| 5. Comunicação só em `src/services/`, com `Promise<Tipo>` e `try/catch` | `src/services/produtos.ts` (padrão dos serviços), `src/services/api/requisicao.ts` e `src/services/erros.ts`; variáveis só em `src/config/ambiente.ts` |
| 6. Estado agrupado em objeto, sem mutação direta | `busca` (filtros e página) em `src/pages/Pesquisa/index.tsx`; `envio` em `src/hooks/usePerfil.ts` |
| 7. `useEffect` com dependências corretas | `src/hooks/useRequisicao.ts`: tirar `tentativa` quebra o "Tentar de novo"; tirar `dono` mantém dados da conta anterior |
| 8. `key` com identificador do dado | listas de ingredientes (`item.id`) em `src/pages/Produto/index.tsx`; opções (`option.value`) em `src/components/ListaSuspensa/index.tsx` |
| 9. `useParams` com verificação | `src/pages/FilaAprovacao/index.tsx` (`id` ausente vira `null`); `src/pages/Produto/index.tsx` |
| 10. Rotas com React Router, `<Link>`/`useNavigate` e rota `*` | `src/App.tsx`; `src/pages/NaoEncontrado/index.tsx`; `src/components/BackButton/index.tsx` |
| 11. Acessibilidade mínima (WCAG AA) | `<label htmlFor>` e erro com `role="alert"` em `src/components/Input/index.tsx`; foco visível em `src/styles/global.css`; cores em `src/styles/tokens.css` |
| 12. Carregando, sucesso e erro no DOM | `src/hooks/useRequisicao.ts` e as telas que o usam, como `src/pages/Dashboard/index.tsx` |
| 13. Publicação com link no README | Vercel, link no topo deste arquivo |
| 14. Conventional Commits em pelo menos 4 semanas | `git log`: mais de 340 commits, de agosto a outubro de 2026 |

### Extras

| Extra | Onde ver |
|---|---|
| 1. Context API com Provider e hook de consumo | `src/contexts/autenticacao.tsx` com `src/hooks/useAutenticacao.ts`; `src/contexts/chat.tsx` com `src/hooks/useChat.ts` |
| 2. `useReducer` com estado e ação tipados | `src/contexts/chat.tsx`: a união `AcaoDoChat` e o reducer `reduzirChat` |
| 3. Hook próprio com loading, erro e `AbortController` | `src/hooks/useRequisicao.ts`, usado por cinco hooks, como `src/hooks/usePainel.ts` |
| 4. `React.lazy` e `Suspense` por página | `src/App.tsx` (`carregarPagina`): cada página baixa o próprio arquivo ao abrir |
| 5. `localStorage` com `_versao` | `src/utils/armazenamento.ts`: salva com `_versao` e descarta o que vier de outra versão |
| 6. `useMemo` e `useCallback` com motivo | `src/components/RevisaoIngrediente/index.tsx` e `src/components/DetalheCandidato/index.tsx`: a lista do catálogo, com cerca de 8 mil ingredientes, não é redesenhada a cada letra digitada |
| 7. Proteção contra XSS | nenhum `dangerouslySetInnerHTML`; respostas da IA renderizadas como texto em `src/components/ChatMessage/index.tsx`; Markdown com HTML bruto desligado em `src/utils/markdown.ts` |
| 8. Validação de formulários em `src/utils/` | `src/utils/validacao.ts`: uma função por campo e os tamanhos máximos |
| 9. Rotas privadas com Context | `src/components/RotaPrivada/index.tsx` e `src/components/RotaAdmin/index.tsx` |
| 10. Acessibilidade avançada | modais e menu como `<dialog>` com `showModal` em `src/components/Modal/index.tsx` e `src/components/NavigationDrawer/index.tsx`; `aria-expanded` em `src/components/TopBar/index.tsx`; anúncio da troca de página em `src/components/RouteAnnouncer/index.tsx`; regiões `header`, `nav`, `main` e `footer` em `src/components/MainLayout/index.tsx` (no celular, o `header` é a barra de `src/components/TopBar/index.tsx`) |

## Qualidade e publicação

A cada pull request para `develop` ou `main`, a CI do GitHub Actions
(`.github/workflows/ci.yml`) instala as dependências, roda o build (que inclui
a checagem de tipos) e confere as regras do projeto:

- nenhum `any` em `src/`;
- nenhum arquivo `.js` ou `.jsx` em `src/`;
- nenhum `fetch` em páginas ou componentes;
- nenhuma lista com `key={index}`;
- nenhum `window.location.href`;
- nenhum `console.log`.

A publicação é feita pela Vercel a partir do repositório. O `vercel.json`
manda todas as rotas para o `index.html`, para o React Router funcionar ao
abrir um endereço direto.

Os commits seguem o padrão Conventional Commits (`feat:`, `fix:`, `refactor:`,
`docs:`), com a mensagem em português.

## Equipe

Matheus Orestes, Rafael Lopes, Sophia Castro, Laura Gonçalves, Felipe Augusto,
Akira Komati, Bianca Bazoni, Bruno Vinicius, Miguel Oliveira, Sarah Delatorre
e Gustavo Herance.

## Licença

MIT. Veja o arquivo `LICENSE`.
