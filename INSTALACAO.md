# Guia de Instalação — Controle de Atendimentos (site próprio)

Este guia explica, passo a passo, como colocar o **Controle de Atendimentos** no ar
como um site independente, fora do Claude.ai, com endereço próprio e banco de
dados compartilhado entre todos os usuários do escritório.

## Como o sistema funciona nesta versão

A versão que rodava dentro do Claude.ai usava um armazenamento exclusivo daquele
ambiente. Fora do Claude.ai esse armazenamento não existe, então o projeto foi
adaptado para usar o **Supabase** — um serviço de banco de dados na nuvem com
plano gratuito, que faz o papel de "memória compartilhada" entre todos que
acessarem o site.

Resumindo a arquitetura:

- **Frontend** (a tela que os usuários veem): o site em si, feito em React. Você
  vai hospedá-lo gratuitamente na **Vercel** (ou Netlify, se preferir).
- **Backend** (onde os dados ficam salvos): um banco de dados gratuito no
  **Supabase**, com três tabelas: `leads`, `responsaveis` e `atendimentos`.

Nenhuma das duas contas exige cartão de crédito nos planos gratuitos usados
aqui.

## O que você vai precisar

- Um computador com Windows, Mac ou Linux
- Conexão com a internet
- Um endereço de e-mail (para criar as contas gratuitas)
- Cerca de 30 a 45 minutos na primeira vez

---

## Passo 1 — Instalar o Node.js

O Node.js é o programa que permite rodar e "empacotar" o projeto no seu
computador.

1. Acesse **https://nodejs.org**
2. Baixe a versão **LTS** (a recomendada, mais estável)
3. Execute o instalador e siga os passos padrão (Avançar, Avançar, Concluir)
4. Para confirmar que funcionou, abra o **Terminal** (Mac/Linux) ou
   **Prompt de Comando/PowerShell** (Windows) e digite:

   ```
   node -v
   npm -v
   ```

   Se aparecer um número de versão em cada linha (ex: `v20.11.0` e `10.2.4`),
   a instalação deu certo.

---

## Passo 2 — Extrair os arquivos do projeto

1. Localize o arquivo `controle-de-atendimentos.zip` que você baixou
2. Clique com o botão direito nele e escolha **Extrair tudo** (Windows) ou
   dê dois cliques (Mac)
3. Guarde a pasta extraída em um lugar de fácil acesso, por exemplo
   `Documentos/controle-de-atendimentos`

---

## Passo 3 — Criar o projeto no Supabase (o banco de dados)

1. Acesse **https://supabase.com** e clique em **Start your project**
2. Crie uma conta (pode ser com o e-mail do escritório ou login do Google/GitHub)
3. Clique em **New Project**
4. Preencha:
   - **Name**: `controle-de-atendimentos` (ou o nome que preferir)
   - **Database Password**: crie uma senha forte e **guarde em local seguro**
     (você não vai usar essa senha no dia a dia, mas pode precisar dela depois)
   - **Region**: escolha a opção mais próxima do Brasil (ex: `South America (São Paulo)`)
5. Clique em **Create new project**
6. Aguarde de 1 a 2 minutos enquanto o Supabase prepara o banco de dados

---

## Passo 4 — Criar as tabelas do sistema

1. No painel do Supabase, no menu à esquerda, clique no ícone **SQL Editor**
2. Clique em **New query**
3. Abra o arquivo `supabase-setup.sql` (incluído na pasta do projeto) em
   qualquer editor de texto, copie todo o conteúdo e cole na tela do SQL Editor
4. Clique no botão verde **Run** (ou `Ctrl+Enter` / `Cmd+Enter`)
5. Deve aparecer uma mensagem de sucesso ("Success. No rows returned")

Isso cria automaticamente as quatro tabelas (`leads`, `responsaveis`,
`atendimentos`, `clientes`) com todos os campos usados pelo sistema, já com
permissão de leitura e escrita liberada para o próprio escritório.

Para conferir: no menu à esquerda, clique em **Table Editor** — você deve ver
as quatro tabelas listadas.

> **Já tinha instalado antes?** O script é seguro para rodar de novo: ele usa
> `if not exists`, então não apaga nada que já existe. Rodá-lo novamente
> adiciona a tabela `clientes` e a coluna de vínculo `clienteId` em `leads` e
> `atendimentos`, sem afetar os dados já cadastrados.

---

## Passo 4.1 — Criar as contas de acesso (login da equipe)

O sistema agora exige login. Faça isto **depois** de rodar o `supabase-setup.sql`.

### a) Desligar o cadastro público (atenção: são dois botões diferentes)
No Supabase, vá em **Authentication → Providers → Email**. Lá dentro:

| Opção | Como deve ficar | Por quê |
|---|---|---|
| **Email** (o provedor, no topo) | **LIGADO** ✅ | É o que permite entrar com e-mail e senha. Se desligar, **ninguém consegue logar** e a tela mostra `Email logins are disabled`. |
| **Allow new users to sign up** (em algumas versões: "Enable sign ups") | **DESLIGADO** ❌ | Impede que qualquer pessoa com o link crie conta sozinha. |

Resumindo: **não desligue o provedor Email** — desligue só a opção de
autocadastro que fica dentro dele. As contas da equipe você cria na mão no
passo (b).

### b) Criar os usuários
Em **Authentication → Users → Add user**, crie um usuário por pessoa
(e-mail + senha). Marque "Auto Confirm User" para não depender de e-mail de
confirmação. Faça isso inclusive para você.

### c) Definir quem é a conta mestre
No **SQL Editor**, rode (trocando pelo seu e-mail):

```sql
insert into perfis (id, email, nome, papel, "responsavelNome")
select id, email, 'Antonio Augusto', 'mestre', 'Antonio Augusto'
from auth.users where email = 'SEU-EMAIL@exemplo.com'
on conflict (id) do update set papel = 'mestre';
```

### d) Cadastrar cada colaborador

```sql
insert into perfis (id, email, nome, papel, "responsavelNome")
select id, email, 'Nome da Pessoa', 'colaborador', 'Nome da Pessoa'
from auth.users where email = 'colaborador@exemplo.com'
on conflict (id) do update set papel = 'colaborador';
```

> ⚠️ **Atenção ao `responsavelNome`**: ele precisa ser **idêntico** ao nome
> cadastrado na tela **Equipe** do sistema (mesma grafia, acentos e espaços).
> É por esse nome que o banco decide quais leads a pessoa enxerga. Se estiver
> diferente, ela entra no sistema mas não vê nenhum lead.

### O que cada perfil pode fazer

| Ação | Mestre | Colaborador |
|---|---|---|
| Ver todos os leads | sim | só os seus |
| Criar/editar leads | todos | só os seus |
| Excluir leads, clientes, atendimentos | sim | não |
| Trocar o responsável de um lead | sim | não |
| Cadastrar/remover responsáveis (Equipe) | sim | não |
| Dashboard e área de Atendimentos | completo | completo |
| Relatórios em PDF | todos os leads | só os seus |

Essas regras valem **no banco de dados**, não só na tela: mesmo que alguém
tente contornar a interface, o Supabase recusa a operação.

---

## Passo 5 — Copiar as credenciais de acesso

1. No painel do Supabase (dentro do seu projeto), clique no botão **Connect**
   (geralmente perto do topo da tela do projeto)
2. Nessa janela você vai ver dois valores importantes — **não troque um pelo
   outro**, são coisas diferentes:
   - **Project URL**: um endereço de site, no formato
     `https://xxxxxxxxxxxx.supabase.co`
   - **Publishable key** (também chamada de `anon` / `anon public` em
     projetos mais antigos): uma sequência longa de texto, que hoje em dia
     costuma começar com `sb_publishable_...`
3. Se não encontrar o botão **Connect**, o mesmo par de valores também fica em
   **Project Settings → API Keys** (URL em "Project URL", chave em
   "Publishable key" ou "anon public")
4. Deixe essa página aberta — você vai usar os dois valores no próximo passo

> ⚠️ **Erro comum**: a URL e a chave são coisas diferentes e vão em campos
> diferentes no Passo 6. Se você colar a `Publishable key`
> (`sb_publishable_...`) no lugar da `VITE_SUPABASE_URL`, o sistema mostra o
> erro `ERR_NAME_NOT_RESOLVED` ao tentar cadastrar qualquer coisa, porque o
> navegador tenta acessar um "site" com o nome da chave, que não existe.
> A `VITE_SUPABASE_URL` deve sempre começar com `https://` e terminar em
> `.supabase.co`.

---

## Passo 6 — Configurar o projeto com suas credenciais

1. Dentro da pasta do projeto, encontre o arquivo `.env.example`
2. Faça uma cópia dele e renomeie a cópia para `.env`
   (atenção: o nome deve ser exatamente `.env`, sem mais nada depois)
3. Abra o arquivo `.env` em um editor de texto e preencha assim:

   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=cole-aqui-a-chave-anon-copiada
   ```

4. Salve o arquivo

> Se o seu sistema não mostra a extensão dos arquivos e fica difícil criar um
> arquivo chamado apenas `.env`, abra o Terminal/Prompt de Comando **dentro da
> pasta do projeto** e digite:
>
> - Mac/Linux: `cp .env.example .env`
> - Windows (PowerShell): `copy .env.example .env`
>
> Depois edite o `.env` criado com os valores do Passo 5.

---

## Passo 7 — Instalar as dependências do projeto

1. Abra o Terminal/Prompt de Comando
2. Navegue até a pasta do projeto. Exemplo:

   ```
   cd Documentos/controle-de-atendimentos
   ```

3. Digite:

   ```
   npm install
   ```

4. Aguarde — na primeira vez isso pode levar de 1 a 3 minutos. Ao final, você
   verá algo como `added 178 packages`.

---

## Passo 8 — Testar no seu computador antes de publicar

1. Ainda no Terminal, dentro da pasta do projeto, digite:

   ```
   npm run dev
   ```

2. Vai aparecer uma mensagem com um endereço, algo como:

   ```
   Local:   http://localhost:5173/
   ```

3. Copie esse endereço e cole no navegador
4. O Controle de Atendimentos deve abrir normalmente. Cadastre um lead de
   teste para confirmar que ele fica salvo (recarregue a página — o lead deve
   continuar aparecendo, confirmando que o Supabase está funcionando)
5. Para parar o teste, volte ao Terminal e pressione `Ctrl+C`

Se algo não funcionar aqui, veja a seção **Solução de problemas** no final
deste guia antes de seguir para a publicação.

---

## Passo 9 — Publicar o site (deploy)

Com tudo testado, é hora de colocar o site no ar com um endereço público.
A forma mais simples é usar a **Vercel** (gratuita para este tipo de uso).

### Opção recomendada: Vercel

1. Acesse **https://vercel.com** e crie uma conta gratuita (dá para usar login
   do GitHub, GitLab ou e-mail)
2. Na tela inicial, clique em **Add New... → Project**
3. A forma mais tranquila é enviar o projeto para o **GitHub** primeiro e
   depois conectar a Vercel a ele. Veja o passo a passo completo e detalhado
   no arquivo **`GITHUB-DESKTOP.md`**, incluído junto com este guia — ele
   mostra como enviar a pasta do projeto usando apenas cliques, sem linha de
   comando
4. De volta na Vercel, clique em **Import** ao lado do repositório que você
   acabou de criar
5. Na tela de configuração do projeto, abra **Environment Variables** e
   adicione as duas variáveis do Passo 5, **antes de clicar em Deploy**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   > ⚠️ Essas variáveis só são "assadas" dentro do site no momento em que
   > ele é publicado. Se precisar adicioná-las ou corrigi-las depois de já
   > ter clicado em Deploy uma vez, salvar não é suficiente — é necessário
   > ir em **Deployments**, abrir os três pontinhos do último deploy e
   > clicar em **Redeploy** para que o site seja gerado de novo com os
   > valores corretos.
6. Clique em **Deploy**
7. Aguarde 1 a 2 minutos — a Vercel vai instalar tudo e publicar o site
8. Ao final, você recebe um endereço gratuito, do tipo
   `controle-de-atendimentos.vercel.app` — esse já é o site funcionando,
   acessível de qualquer lugar

### Usando um domínio próprio (opcional)

Se o escritório já tem um domínio (ex: `escritorio.com.br`), você tem duas
opções: usar o domínio principal (`escritorio.com.br`) ou, o mais comum
para um sistema interno, um subdomínio dedicado
(`atendimentos.escritorio.com.br` ou `crm.escritorio.com.br`) — assim o
domínio principal continua livre para o site do escritório.

1. No painel do projeto na Vercel, vá em **Domains** (mesma tela que lista
   o endereço `.vercel.app` atual) e clique em **Add Existing**
2. Digite o domínio ou subdomínio desejado e confirme
3. A Vercel vai mostrar exatamente qual registro de DNS criar. Isso muda
   conforme o tipo de endereço escolhido:
   - **Domínio principal** (`escritorio.com.br`): registro tipo **A**,
     apontando para um endereço IP
   - **Subdomínio** (`atendimentos.escritorio.com.br`): registro tipo
     **CNAME**, apontando para um endereço como `cname.vercel-dns.com`
     (às vezes um valor exclusivo do seu projeto, terminado em ponto)

   > ⚠️ Use sempre o valor exato que a própria Vercel mostrar na tela do
   > seu projeto — o IP/endereço pode ser diferente do exemplo genérico
   > de qualquer tutorial, incluindo este. A Vercel exibe o valor correto
   > para o seu caso específico depois que você adiciona o domínio.

4. Acesse o painel de DNS de onde o domínio está registrado (para `.com.br`,
   geralmente é o **Registro.br**; pode ser também Hostgator, GoDaddy,
   Cloudflare, ou a empresa que administra o domínio do escritório) e crie
   o registro:
   - Tipo: `A` (domínio principal) ou `CNAME` (subdomínio)
   - Nome/Host: `@` para o domínio principal, ou só a parte do subdomínio
     (ex: `atendimentos`) para um subdomínio
   - Valor: exatamente o que a Vercel mostrou no passo 3
5. Se já existir algum registro antigo com o mesmo nome (por exemplo, de um
   site anterior), remova-o antes de salvar — registros conflitantes
   impedem a validação
6. Salve e aguarde a propagação — geralmente minutos, podendo levar
   algumas horas em casos raros
7. Volte à tela **Domains** na Vercel: o status muda de "Invalid
   Configuration" para **"Valid Configuration"** (com o mesmo selo azul que
   já aparece hoje no endereço `.vercel.app`) assim que o DNS for
   reconhecido. O certificado HTTPS é gerado automaticamente nesse momento,
   sem nenhuma ação extra.

**Problemas comuns:**
- **Continua "Invalid Configuration" depois de várias horas**: confira se
  o valor colado no DNS é idêntico ao mostrado pela Vercel (sem espaços
  extras), e se não sobrou nenhum registro antigo conflitante com o mesmo
  nome.
- **Domínio principal não aceita registro CNAME**: isso é esperado — o
  domínio raiz (`@`) só aceita registro tipo `A`. CNAME só funciona em
  subdomínios.
- **Existe um registro AAAA antigo**: se o domínio já teve outro site,
  pode haver um registro `AAAA` (IPv6) apontando para outro lugar — remova-o
  também, ele pode atrapalhar a validação mesmo com o `A` correto.

### Alternativa: Netlify

O processo é equivalente ao da Vercel:

1. Crie uma conta em **https://netlify.com**
2. **Add new site → Import an existing project**, conecte ao GitHub
3. Em **Build settings**, confirme:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Em **Environment variables**, adicione `VITE_SUPABASE_URL` e
   `VITE_SUPABASE_ANON_KEY`
5. Clique em **Deploy site**

---

## Passo 10 — Compartilhar com a equipe

Depois de publicado, basta enviar o endereço do site (o `.vercel.app` ou o
domínio próprio) para os demais responsáveis do escritório. Como todos
acessam o mesmo banco de dados no Supabase, qualquer lead, atendimento ou
responsável cadastrado por uma pessoa aparece automaticamente para as
demais — inclusive, para ver dados adicionados por um colega, basta
atualizar a página.

---

## Como atualizar o site depois de publicado

Sempre que quiser alterar algo no código (cores, textos, campos), edite os
arquivos localmente, teste com `npm run dev` e depois:

- Se estiver usando GitHub + Vercel/Netlify: basta enviar a alteração pelo
  GitHub Desktop (Passo 7 do arquivo `GITHUB-DESKTOP.md`: Commit to main →
  Push origin) — a publicação do novo site acontece automaticamente em 1 a
  2 minutos.

---

## Segurança — pontos de atenção

- A chave `anon` do Supabase é destinada a ficar no código do site (é assim
  que o Supabase foi projetado), mas ela dá acesso de leitura e escrita às
  três tabelas. Não publique o link do repositório do GitHub como público se
  preferir manter o `.env` fora de vista — o arquivo `.gitignore` incluído já
  impede que o `.env` seja enviado ao GitHub por engano.
- Por padrão, este projeto libera leitura/escrita para qualquer pessoa que
  tenha a URL e a chave — adequado para uso interno do escritório. Se no
  futuro for necessário controlar quem pode ver ou editar (por exemplo, login
  individual por usuário), o Supabase oferece autenticação própria
  (Supabase Auth) para evoluir o sistema nesse sentido.

---

## Solução de problemas

**Erro `ERR_NAME_NOT_RESOLVED` no console ao cadastrar qualquer coisa**
→ A `VITE_SUPABASE_URL` está com o valor errado — provavelmente a
`Publishable key` (`sb_publishable_...`) foi colada no lugar da URL. Abra o
`.env`, confirme que `VITE_SUPABASE_URL` começa com `https://` e termina em
`.supabase.co`, e que `VITE_SUPABASE_ANON_KEY` é a chave longa. Depois de
corrigir, pare o servidor (`Ctrl+C`) e rode `npm run dev` novamente.

**`node` ou `npm` não é reconhecido como comando**
→ O Node.js não foi instalado corretamente, ou o Terminal precisa ser
reaberto após a instalação.

**Funciona no computador (`npm run dev`) mas o link publicado abre tela
branca, com erro `Invalid supabaseUrl` no console**
→ As variáveis de ambiente não chegaram até o site publicado. Isso quase
sempre acontece por um destes dois motivos:
1. As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` não foram
   cadastradas nas configurações da Vercel/Netlify (Settings →
   Environment Variables)
2. Elas foram cadastradas, mas **depois** de o site já ter sido publicado
   uma vez — salvar uma variável de ambiente não atualiza sozinho um site
   já publicado. É preciso mandar publicar de novo:
   - Na Vercel: aba **Deployments** → nos três pontinhos do último
     deploy → **Redeploy**
   - Na Netlify: aba **Deploys** → **Trigger deploy** → **Clear cache and
     deploy site**

Confira também se os nomes das variáveis foram digitados exatamente como
`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (com o prefixo `VITE_`, sem
o qual o Vite não expõe a variável para o site), e se o valor colado não
incluiu aspas ou espaços extras.

> A versão mais recente do projeto já vem com uma proteção para esse caso:
> em vez de tela branca, aparece um aviso na tela explicando exatamente o
> que configurar.

**Como corrigir uma variável já cadastrada errada na Vercel**
1. Acesse **vercel.com**, abra o projeto
2. No menu do projeto, clique em **Settings → Environment Variables**
3. Localize `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` na lista
4. Clique na linha de cada uma (ou no ícone de edição/reticências **⋯** ao
   lado) para abrir a edição, apague o valor errado e cole o valor correto
5. Confirme que a caixa **Production** está marcada (ou "All Environments")
   — sem isso, o site publicado não recebe o valor
6. Salve
7. Vá em **Deployments**, abra o **⋯** do deploy mais recente e clique em
   **Redeploy** — só editar a variável não republica o site sozinho
8. Teste o link novamente numa aba anônima, para não pegar cache antigo

**Mensagem "Erro ao carregar leads" ao abrir o sistema**
→ Confirme que o script `supabase-setup.sql` foi executado com sucesso no
Passo 4, e que os valores em `.env` (Passo 6) foram copiados exatamente como
aparecem no Supabase, sem espaços extras.

**Os dados cadastrados por um colega não aparecem para mim**
→ Atualize a página (F5). Este sistema não atualiza a tela sozinho quando
outra pessoa cadastra algo — é necessário recarregar.

**Quero apagar tudo e recomeçar o banco de dados**
→ No Supabase, vá em **Table Editor**, abra cada tabela e apague as linhas
desejadas, ou execute novamente trechos do `supabase-setup.sql` (o comando
`drop table nome_da_tabela;` remove uma tabela por completo, caso deseje
recriá-la do zero).

---

## Passo 9 — Processos Sensíveis / Prioritários (só a conta mestre)

Esta tela e a aba **Notificações** aparecem **somente** para quem tem papel
`mestre` na tabela `perfis`. O colaborador não vê as abas e, mesmo que force
a URL, o banco devolve lista vazia — a restrição está na regra do Supabase,
não só na tela.

### a) Criar a tabela
Rode o `atualizacao-processos-sensiveis.sql` no **SQL Editor** do Supabase
(ou o `supabase-setup.sql` completo, que já inclui tudo).

### b) Como a cobrança de 5 dias úteis funciona
A contagem começa no cadastro do processo e **reinicia toda vez** que você
clica em **Registrar cobrança** na aba Notificações. Ela pula sábados,
domingos **e feriados** — nacionais, do Maranhão e de São Luís.

Processos movidos para **Acompanhamentos Finalizados** param de ser cobrados.

#### Feriados considerados

| Data | Feriado | Esfera |
|---|---|---|
| 1º de janeiro | Confraternização Universal | nacional |
| Segunda e terça de Carnaval | Carnaval | ponto facultativo |
| Sexta-feira Santa | Paixão de Cristo | nacional |
| 21 de abril | Tiradentes | nacional |
| 1º de maio | Dia do Trabalho | nacional |
| Corpus Christi | Corpus Christi | ponto facultativo |
| **28 de julho** | **Adesão do Maranhão à Independência** | **estadual** |
| 7 de setembro | Independência do Brasil | nacional |
| **8 de setembro** | **Aniversário de São Luís** | **municipal** |
| 12 de outubro | Nossa Senhora Aparecida | nacional |
| 2 de novembro | Finados | nacional |
| 15 de novembro | Proclamação da República | nacional |
| 20 de novembro | Consciência Negra | nacional |
| 25 de dezembro | Natal | nacional |

Carnaval, Sexta-feira Santa e Corpus Christi **mudam de data todo ano** e são
calculados sozinhos a partir da Páscoa — não é preciso atualizar nada
anualmente. A quarta-feira de Cinzas continua contando como dia útil.

**Carnaval e Corpus Christi são ponto facultativo, não feriado por lei.**
Estão na lista porque na prática o escritório e o fórum não funcionam. Para
contá-los como dia útil, mude no código:

```js
const CONTAR_PONTO_FACULTATIVO_COMO_FERIADO = false;
```

#### Para incluir ou retirar um feriado

Abra o `src/App.jsx`, procure por `FERIADOS_FIXOS` e acrescente uma linha:

```js
{ dia: 19, mes: 3, nome: 'São José', esfera: 'municipal' },
```

**Importante:** a mesma lista existe no arquivo
`supabase/functions/cobranca-processos/index.ts`, usada pelo e-mail
automático. Se mudar em um, mude no outro — senão o e-mail passa a discordar
da tela.

> **O que ficou de fora e por quê:** encontrei fontes que citam também
> 29/06, 28/08, 20/10 (Dia do Comerciário) e 08/12 como feriados em São Luís
> ou no Maranhão, mas **cada uma aparecia em um único site e as fontes se
> contradiziam entre si**. Incluí apenas 28/07 e 08/09, que três fontes
> independentes confirmam. Se o escritório observa alguma das outras datas,
> me avise ou acrescente a linha você mesmo — a lista é uma só e está no
> topo do arquivo.

### c) Aviso dentro do CRM — já funciona, sem configurar nada
A aba **Notificações** e o sino no cabeçalho mostram o número de processos
vencidos assim que você abre o sistema. Isso não depende de e-mail.

### d) Aviso por e-mail — precisa de configuração (opcional)

> **Por que não é automático:** o CRM roda no navegador, e navegador não
> envia e-mail. O envio precisa de um serviço rodando fora dele. Se você
> não fizer esta parte, **o sistema continua funcionando normalmente** —
> apenas o e-mail não sai, e a cobrança fica só dentro do CRM.

São três etapas, feitas uma única vez:

**1. Criar a conta de envio (Resend)**
Crie uma conta gratuita em `resend.com`, verifique seu domínio
(`sousaugusto.com.br`) e gere uma **API Key**. O plano gratuito cobre com
folga o volume desta cobrança.

**2. Publicar a função**
Instale a CLI do Supabase e, dentro da pasta do projeto, rode:

```
supabase login
supabase link --project-ref SEU-PROJECT-REF
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
supabase secrets set EMAIL_REMETENTE="CRM AASAA <crm@sousaugusto.com.br>"
supabase functions deploy cobranca-processos
```

**3. Agendar**
Abra o `agendar-cobranca.sql`, troque `SEU-PROJECT-REF` e
`SUA-SERVICE-ROLE-KEY` pelos valores do seu projeto e rode no SQL Editor.
Ele agenda a verificação de segunda a sexta às 8h de Brasília.

> **Atenção com a service_role key:** ela dá acesso total ao banco. Use-a
> apenas dentro do SQL Editor do seu próprio projeto. Nunca a coloque no
> arquivo `.env` do site, no GitHub ou em qualquer lugar público.

**Para onde o e-mail vai:** para todos os e-mails com papel `mestre` na
tabela `perfis`. Confira com:

```sql
select email, nome, papel from perfis where papel = 'mestre';
```

**O e-mail não repete todo dia:** depois de avisar sobre um processo, o
sistema só volta a avisar sobre aquele mesmo processo depois de mais 5 dias
úteis — ou assim que você registrar a cobrança no CRM.

**Testar sem esperar o horário:**
```
curl -X POST 'https://SEU-PROJECT-REF.supabase.co/functions/v1/cobranca-processos' \
     -H 'Authorization: Bearer SUA-SERVICE-ROLE-KEY'
```

**Desligar o envio automático** (a aba Notificações continua funcionando):
```sql
select cron.unschedule('cobranca-processos-sensiveis');
```
