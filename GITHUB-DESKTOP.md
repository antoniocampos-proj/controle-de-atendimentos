# Como Enviar o Projeto para o GitHub usando o GitHub Desktop

Este guia mostra como colocar a pasta `controle-de-atendimentos` no GitHub
usando apenas cliques — sem digitar nenhum comando. Esse passo é necessário
para depois conectar o projeto à Vercel ou Netlify (Passo 9 do guia
`INSTALACAO.md`) e publicar o site automaticamente.

---

## Pré-requisitos

- A pasta do projeto já configurada no seu computador (Passos 1 a 8 do
  `INSTALACAO.md`)
- Um e-mail para criar conta no GitHub, caso ainda não tenha

---

## Passo 1 — Criar uma conta no GitHub (pule se já tiver uma)

1. Acesse **https://github.com**
2. Clique em **Sign up**
3. Preencha e-mail, senha e um nome de usuário
4. Confirme seu e-mail quando o GitHub enviar a mensagem de verificação

---

## Passo 2 — Instalar o GitHub Desktop

1. Acesse **https://desktop.github.com**
2. Clique em **Download for [Windows/macOS]** (o site detecta seu sistema
   automaticamente)
3. Abra o instalador baixado e siga os passos padrão
4. Ao abrir o GitHub Desktop pela primeira vez, clique em
   **Sign in to GitHub.com**
5. Isso abre o navegador pedindo autorização — clique em **Authorize
   desktop** (ou similar) e depois volte para o aplicativo GitHub Desktop,
   que já deve estar logado

---

## Passo 3 — Adicionar a pasta do projeto ao GitHub Desktop

1. No GitHub Desktop, vá ao menu **File → Add Local Repository**
   (em português, o menu pode aparecer como **Arquivo → Adicionar
   repositório local**, dependendo do idioma configurado)
2. Clique em **Choose** e selecione a pasta `controle-de-atendimentos`
   (a pasta inteira, não um arquivo dentro dela)
3. Como essa pasta ainda não é um repositório Git, o GitHub Desktop vai
   mostrar um aviso com um link escrito algo como **"create a repository"**
   — clique nesse link
4. Na tela seguinte ("Create a repository"), deixe as opções como estão e
   clique no botão azul **Create Repository**

Neste ponto, o projeto já virou um repositório Git local (mas ainda só
existe no seu computador).

---

## Passo 4 — Fazer o primeiro commit (registrar os arquivos)

1. No painel à esquerda, você verá a aba **Changes**, listando todos os
   arquivos do projeto como novidades a serem salvas
2. Na parte de baixo desse painel, há um campo de texto chamado
   **Summary (required)** — escreva algo como `Versão inicial do sistema`
3. Opcionalmente, use o campo **Description** para detalhes extras
4. Clique no botão azul **Commit to main**

Um "commit" é como um "salvar" no histórico do projeto — ele ainda não
enviou nada para a internet, só registrou localmente.

---

## Passo 5 — Publicar o repositório no GitHub

1. No topo da janela, clique no botão **Publish repository**
2. Vai abrir uma janela com:
   - **Name**: nome do repositório (já vem preenchido com
     `controle-de-atendimentos`; pode manter ou alterar)
   - **Description**: opcional
   - **Keep this code private**: **deixe marcado** — é a opção recomendada
     para um sistema interno do escritório, para que apenas contas
     autorizadas por você tenham acesso ao código
   - **Organization**: deixe em **None** (publica na sua conta pessoal),
     a menos que o escritório já tenha uma organização própria no GitHub
3. Clique em **Publish Repository**
4. Aguarde alguns segundos enquanto o envio é concluído

---

## Passo 6 — Conferir se deu certo

1. Ainda no GitHub Desktop, vá em **Repository → View on GitHub** no menu
   superior (isso abre o navegador direto na página do repositório)
2. Confirme que os arquivos do projeto (como `package.json`, `src`,
   `INSTALACAO.md`) aparecem listados ali
3. **Confirme também que o arquivo `.env` NÃO aparece na lista** — ele deve
   ficar de fora graças ao `.gitignore` incluído no projeto. Isso é
   importante: o `.env` contém suas credenciais do Supabase e não deve ir
   para o GitHub, ainda mais se o repositório for público.

---

## Passo 7 — Enviar atualizações depois (sempre que editar o projeto)

Sempre que você (ou eu, em uma próxima conversa) alterar algum arquivo do
projeto, o caminho para atualizar o GitHub é sempre este:

1. Abra o GitHub Desktop — ele detecta sozinho quais arquivos mudaram, na
   aba **Changes**
2. Escreva um resumo curto do que mudou no campo **Summary**
   (ex: `Ajuste de cores do dashboard`)
3. Clique em **Commit to main**
4. Clique no botão **Push origin** que aparece no topo (mostra um número
   indicando quantos commits ainda não foram enviados)

Pronto — a nova versão está no GitHub. Se o repositório já estiver
conectado à Vercel ou Netlify, uma nova publicação do site começa
automaticamente, em 1 a 2 minutos.

---

## Solução de problemas

**"A repository with this name already exists on your account"**
→ Já existe um repositório com esse nome na sua conta GitHub. Ou escolha
outro nome no campo **Name** da tela de publicação, ou apague o repositório
antigo em github.com (dentro dele: **Settings → General → Danger Zone →
Delete this repository**), caso seja um teste anterior sem importância.

**GitHub Desktop pede login toda vez / não reconhece minha conta**
→ Vá em **File → Options → Accounts** (Windows) ou
**GitHub Desktop → Settings → Accounts** (Mac), clique em **Sign out** e
depois **Sign in** novamente.

**O arquivo `.env` apareceu na lista de mudanças**
→ Confirme que o arquivo `.gitignore` está na pasta raiz do projeto (o
mesmo nível de `package.json`) e que o arquivo se chama exatamente `.env`
(sem `.txt` ou outra extensão no final). Se ele já tiver sido enviado por
engano, troque as chaves do Supabase depois (Project Settings → API Keys)
por segurança, já que ficariam visíveis no histórico do repositório.

**Não sei se deu certo o "Publish"**
→ No topo do GitHub Desktop, quando o repositório já está publicado e sem
alterações pendentes, o botão muda de "Publish repository" para
"Fetch origin". Se ainda aparecer "Publish repository", repita o Passo 5.
