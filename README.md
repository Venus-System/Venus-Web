# Venus Web

Aplicação web do Venus, que lê a lista de ingredientes de um cosmético e explica
o que cada um faz para a sua pele, para o planeta e para quem produz.

Projeto da disciplina Desenvolvimento de Aplicações Dinâmicas.

## Como rodar

Requisitos: Node 18 ou superior.

```bash
npm install
cp .env.example .env
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

### Outros comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe o servidor de desenvolvimento |
| `npm run build` | Gera a versão de produção na pasta `dist` |
| `npm run preview` | Serve localmente a versão de produção |
| `npm run checar-tipos` | Roda o TypeScript sem gerar arquivos |

## Variáveis de ambiente

Ficam no arquivo `.env`, que **não é versionado**. Use o `.env.example` como modelo.

| Variável | Para que serve |
| --- | --- |
| `VITE_API_URL` | Endereço base da API do projeto |
| `VITE_USAR_MOCK` | Quando `true`, os serviços devolvem dados falsos |

Enquanto a API não estiver pronta, deixe `VITE_USAR_MOCK=true`. As telas
funcionam normalmente com dados de exemplo, e quando o backend ficar disponível
basta trocar a variável, sem alterar nenhuma tela.

## Organização das pastas

```
src/
  components/     peças reutilizáveis de interface
  pages/          uma pasta por tela do site
  services/       toda comunicação com a API
  types/          interfaces do domínio, organizadas por assunto
  styles/        variáveis de design e styles globais
```

A regra que organiza tudo: **componente cuida de aparência, serviço cuida de
conversar com a API, tipo descreve o formato do dado.** Nenhum componente chama
a API diretamente, e nenhum serviço decide como algo é exibido.

## Rotas

| Caminho | Tela |
| --- | --- |
| `/` | Página inicial pública |
| `/busca` | Busca de produtos |
| `/produto/:slug` | Detalhe e análise de um produto |
| `*` | Página de erro, para endereços inexistentes |

## Decisões que valem explicar

**Por que os dados falsos.** A camada de serviços foi escrita com a assinatura
final desde o começo, devolvendo dados de exemplo. Isso permite desenvolver as
telas sem depender do backend, e a troca depois mexe só no miolo da função.

**Por que o cancelamento de requisição.** Cada efeito que busca dados cria um
controlador de aborto e o cancela na limpeza. Sem isso, trocar de página no meio
de uma requisição faria o componente tentar atualizar estado depois de sair da tela.

**Por que a chave da lista vem do identificador.** Usar o índice do array quebra
quando a lista é filtrada ou reordenada, porque o React passa a associar o
elemento errado ao dado errado.

**Por que a página de produto tem dois estados.** Sem perfil, a resposta traz só
a avaliação geral da fórmula. Com perfil, vem a análise cruzada com as condições
e alergias da pessoa. Nenhum dado pessoal aparece na versão pública, que é a que
pode ser encontrada por busca.

## Acessibilidade

O projeto segue o nível AA das diretrizes de acessibilidade.

- Toda ação usa `button`, e nenhum `div` recebe clique
- Todo campo tem `label` associado por `htmlFor`
- Erros são anunciados com `role="alert"`
- Carregamentos são anunciados com `aria-live`
- O foco é sempre visível, e existe atalho para pular a navegação
- A cor nunca é a única pista: todo selo colorido tem texto equivalente
- A navegação funciona inteira pelo teclado

## Publicação

<!-- Substituir pelo endereço real após publicar. -->
Link da aplicação publicada: _a definir_
