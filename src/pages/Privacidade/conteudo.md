---
atualizado: 27 de outubro de 2026
---

## Quem somos

O Venus é um projeto acadêmico desenvolvido por estudantes do Instituto J&F
Germinare, sem finalidade comercial. Não vendemos nada, não veiculamos
publicidade e não comercializamos dados.

Responsável pelo tratamento dos dados: **Equipe do projeto Venus, estudantes do
Instituto J&F Germinare.**

Contato: **venussystem2026@gmail.com**

## O que coletamos

**Dados de conta**
Nome, endereço de e-mail e um identificador de conta. A senha é tratada pelo
Firebase Authentication e **nunca é guardada nos nossos servidores** — nem
cifrada. Nós não temos acesso a ela em nenhum momento.

**Dados de perfil de pele e cabelo**
Tipo de pele, fototipo, sensibilidade, tendência a acne, tipo de cabelo, tipo
de couro cabeludo, faixa etária e gênero.

**Dados sobre condições de saúde**
Gestação, amamentação, hiperpigmentação, melasma, rosácea, eczema e alergias
declaradas,
com o grau de severidade de cada uma.

> Estes são **dados pessoais sensíveis** na definição do artigo 5º, inciso II,
> da Lei Geral de Proteção de Dados. Eles recebem tratamento mais restrito que
> os demais, e o consentimento para coletá-los é pedido separadamente, no
> momento em que você preenche o questionário de perfil.

**Preferências**
Se você prefere produtos veganos, livres de crueldade, sem parabenos, sem
sulfatos, sem silicones, sem álcool, livres de óleo, naturais, orgânicos,
hipoalergênicos, não comedogênicos, testados por dermatologistas ou com
embalagem reciclável.

**Dados de uso**
Produtos que você analisou ou favoritou, e a data de cada ação. Avaliações que
você publicar, com nota, título e comentário, e os votos de "útil" que você
der. Produtos que você enviar pela foto da embalagem: as fotos e o texto lido
delas.

**Conversa com a Veninha**
As mensagens que você manda para a Veninha e as respostas dela. Além do
histórico de cada conversa, ela guarda um resumo do que você contou, como o seu
tipo de pele, para levar isso em conta nas conversas seguintes. Começar uma
conversa nova tira a anterior da tela, mas não apaga o resumo nem o histórico
guardado no servidor.

**Google Agenda, se você conectar**
Um código de acesso fornecido pela Google, guardado cifrado no nosso banco de
dados. Ele permite ver os horários em que você está livre ou ocupado e criar
eventos na sua agenda.

**Dados de uso do aplicativo**
O aplicativo móvel usa o Google Analytics para Firebase, que coleta
identificadores de instalação e eventos de uso, como telas abertas e tempo de
sessão. Esses dados são processados pela Google e usados apenas para entender
como o aplicativo é utilizado. **O site não usa o Google Analytics.**

## Para que usamos

Os dados de perfil e de saúde existem para uma coisa só: **cruzar a composição
de um cosmético com as suas características e avisar o que pode te fazer mal.**
É a razão de o serviço existir.

Os dados de conta servem para você entrar e recuperar o que salvou. Os de uso
servem para mostrar seu histórico e seus favoritos. Os técnicos servem para
sabermos quantas pessoas usam o sistema.

A conversa com a Veninha serve para responder às suas perguntas sobre produtos,
ingredientes e rotina de cuidados. O acesso à Google Agenda serve só para ela
achar um horário livre e criar os eventos da sua rotina, e **ela só cria um
evento depois que você confirma na conversa**.

**Não usamos seus dados para publicidade, não fazemos perfilamento comercial e
não vendemos nada a ninguém.**

## Com que base legal

O tratamento acontece com o **seu consentimento**, nos termos do artigo 7º,
inciso I, da LGPD. Para os dados de saúde, o consentimento é específico e
destacado, como exige o artigo 11, inciso I.

Você pode retirar o consentimento a qualquer momento: desligando a autorização
de saúde no seu perfil, desconectando a Google Agenda na conversa com a
Veninha ou pedindo a exclusão da sua conta. Retirar o consentimento não apaga o
histórico de análises já realizadas, mas elas deixam de ser cruzadas com o seu
perfil.

## Com quem compartilhamos

Não compartilhamos seus dados com outras pessoas ou empresas para fins
próprios delas. Mas usamos serviços de terceiros para operar a aplicação, e
eles processam dados em nosso nome:

| Serviço | Para quê | Onde ficam os dados |
|---|---|---|
| Google Firebase Authentication | Criar conta, entrar e redefinir senha, tanto no site quanto no aplicativo | Servidores da Google, fora do Brasil |
| Google Firebase | Persistência de dados e análise de uso do aplicativo | Servidores da Google, fora do Brasil |
| Cloudinary | Armazenamento de imagens de produtos e de perfil | Fora do Brasil |
| Render | Hospedagem das APIs e do banco de dados | Oregon, Estados Unidos |
| MongoDB | Histórico das conversas com a Veninha e envios de produtos por foto | Fora do Brasil |
| Groq, Mistral AI e Google Gemini | Gerar as respostas da Veninha a partir das suas mensagens | Fora do Brasil |
| Langfuse | Acompanhar o funcionamento da IA, quando ativado | Fora do Brasil |
| Google Agenda | Ver horários livres e criar eventos, só se você conectar | Servidores da Google, fora do Brasil |
| Vercel | Hospedagem da aplicação web | Fora do Brasil |
| Google Fonts | Baixar as fontes do site a cada visita. A Google recebe o endereço de IP e o navegador, como em qualquer download | Servidores da Google, fora do Brasil |
| GitHub | Mostrar as fotos dos integrantes na página Sobre, baixadas do GitHub ao abrir a página | Servidores do GitHub, fora do Brasil |
| Reconhecimento de voz do navegador (Google no Chrome, Microsoft no Edge) | Transformar em texto o que você ditar no chat, só se você apertar o microfone | Servidores da Google ou da Microsoft, fora do Brasil |
| VLibras, do Governo Federal | Traduzir para Libras o texto em que você clicar, só se você ativar o tradutor. O programa do tradutor é baixado dos servidores do governo a cada visita | Servidores do governo brasileiro |

### Conversa com a Veninha

As suas mensagens vão para a API de inteligência artificial do Venus, que usa
modelos de linguagem de terceiros (Groq, Mistral AI e Google Gemini) para
gerar as respostas. Esses serviços recebem o texto das mensagens para
responder. **Não escreva na conversa dados que você não quer compartilhar**,
como documentos, endereço ou informações de outras pessoas.

### Ditado por voz no chat

Se você apertar o microfone no campo da conversa, quem transforma a sua fala
em texto é o próprio navegador. No Chrome, o áudio vai para os servidores da
Google; no Edge, para os da Microsoft. O Venus não recebe nem guarda o áudio:
recebe só o texto, depois que você revisa e envia, como se tivesse digitado. Na
primeira vez, o navegador pede permissão para usar o microfone, e você pode
tirar essa permissão a qualquer momento nas configurações do site.

### Google Agenda

A conexão é opcional e começa pelo botão Conectar, na conversa com a Veninha.
A Google pede a sua autorização para duas coisas: ver os horários livres e
ocupados e criar eventos. Desconectar, também na conversa, apaga o código de
acesso do nosso banco e pede à Google que cancele a autorização. Você também
pode cancelar pela página de segurança da sua conta Google.

### Autenticação e entrada com Google

Quem cria conta ou entra no Venus é autenticado pelo Firebase Authentication,
da Google. Seu e-mail, seu nome e sua senha são tratados por esse serviço, e a
senha nunca chega aos nossos servidores — nós recebemos apenas um identificador
de conta, o nome e o e-mail.

Se você escolher **entrar com a sua conta Google**, a Google informa ao Venus o
seu nome, o seu e-mail e um identificador de conta. Não recebemos sua senha,
não temos acesso à sua conta Google e não pedimos permissão para nada além
disso. A Google, por sua vez, sabe que você usou a conta dela para entrar aqui.

Ao entrar com Google pela primeira vez, criamos um registro correspondente no
nosso banco de dados, com nome e e-mail, para ligar seu perfil de pele à sua
conta.

O uso do Firebase e da entrada com Google segue também a
[política de privacidade da Google](https://policies.google.com/privacy).

**Transferência internacional.** Todos os serviços acima mantêm servidores fora
do Brasil, e o nosso banco de dados fica em Oregon, nos Estados Unidos. Seus
dados são, portanto, transferidos para outro país. Isso acontece com o seu
consentimento, conforme o artigo 33, inciso VIII, da LGPD, e os serviços
citados oferecem cláusulas contratuais de proteção de dados.

## Por quanto tempo guardamos

Enquanto sua conta existir.

**Para apagar sua conta, escreva para venussystem2026@gmail.com** a partir do
e-mail da conta. Atendemos o pedido em até quinze dias, e depois disso não há
como recuperar nada. Removemos:

- nome, e-mail e a conta de acesso, tanto no nosso banco quanto no Firebase
- o perfil de pele e cabelo por completo
- as informações de saúde e as alergias declaradas
- as preferências, os favoritos e o histórico de análises
- as conversas com a Veninha e o resumo que ela guarda
- o acesso à Google Agenda, se você tiver conectado

**O que permanece, sem qualquer ligação com você:** avaliações que você tenha
publicado continuam visíveis, mas deixam de ser associadas à sua pessoa de
forma irreversível. Registros de acesso permanecem apenas como contagem, sem
nada que identifique quem acessou.

Essa desvinculação é definitiva: não guardamos nenhuma chave, código ou
referência que permita reconstruir o vínculo depois.

Por ser um projeto acadêmico, a base pode ser inteiramente apagada ao fim do
período letivo.

## Seus direitos

O artigo 18 da LGPD te dá o direito de:

- saber se tratamos dados seus, e quais
- acessar esses dados
- corrigir dados incompletos ou errados
- pedir a exclusão dos dados tratados com consentimento
- receber seus dados em formato legível
- saber com quem compartilhamos
- retirar o consentimento

Para exercer qualquer um deles, escreva para **venussystem2026@gmail.com**.
Respondemos em até quinze dias.

## Menores de idade

O Venus não é destinado a menores de 13 anos, e o cadastro não oferece essa
faixa etária. O artigo 14 da LGPD exige consentimento específico de pelo menos
um dos pais ou do responsável legal para tratar dados de crianças, e não temos
como verificar isso.

Se você é responsável por uma criança e acredita que ela criou uma conta aqui,
escreva para **venussystem2026@gmail.com** e apagamos os dados.

**Entre 13 e 17 anos**, o cadastro é permitido, e a LGPD trata esse caso de
forma própria: o tratamento deve observar o melhor interesse do adolescente, nos
termos do artigo 14, §5º, e as informações sobre coleta de dados devem ser dadas
de forma que ele consiga entender — é o que esta página tenta fazer.

O Venus coleta dado de saúde nessa faixa, como em qualquer outra: tipo de pele,
alergias, e as demais respostas do questionário de perfil, sempre com
consentimento específico antes de cada coleta. Recomendamos que o uso, nessa
faixa etária, aconteça com o conhecimento de um responsável. Se você é
responsável por um adolescente que usa o Venus e quer revisar ou apagar os
dados dele, o mesmo contato acima atende esse pedido.

## Segurança

Senhas são tratadas pelo Firebase Authentication e não passam pelos nossos
servidores. O acesso à aplicação usa conexão segura. O banco de dados não é
público.

As chaves de configuração do Firebase que aparecem no código do site são
públicas por desenho: elas identificam o projeto, não autorizam acesso. A
proteção vem das regras de segurança configuradas no Firebase.

Sendo honestos: este é um projeto de estudantes, não um serviço com equipe de
segurança dedicada. **Não use o Venus para guardar informação que você não
estaria disposto a perder ou a ver exposta.**

## Mudanças

Se esta política mudar, a data no topo será atualizada.
