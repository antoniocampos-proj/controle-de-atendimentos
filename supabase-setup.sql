-- ============================================================
-- Controle de Atendimentos — script de criação das tabelas
-- Cole este script inteiro no SQL Editor do Supabase e clique em "Run"
-- Seguro para rodar de novo em um banco já existente (não apaga dados).
-- ============================================================

-- Tabela de leads (funil de captação)
create table if not exists leads (
  id text primary key,
  nome text,
  telefone text,
  email text,
  "tipoAcao" text,
  "tipoAcaoOutraDescricao" text,
  responsavel text,
  origem text,
  "valorEstimado" numeric,
  observacoes text,
  etapa text,
  "dataCriacao" text
);

-- Tabela de responsáveis (equipe)
create table if not exists responsaveis (
  id text primary key,
  nome text
);

-- Tabela de atendimentos consultivos
create table if not exists atendimentos (
  id text primary key,
  "nomeCliente" text,
  "dataAtendimento" text,
  "motivoAtendimento" text,
  "tipoAcao" text,
  "tipoAcaoOutraDescricao" text,
  responsavel text,
  status text,
  "valorCobrado" numeric,
  devolutiva text,
  "dataCriacao" text
);

-- Tabela de clientes (cadastro próprio, vinculável a leads e atendimentos)
create table if not exists clientes (
  id text primary key,
  nome text,
  telefone text,
  email text,
  documento text,
  observacoes text,
  "dataCriacao" text
);

-- Adiciona a coluna de vínculo com cliente em leads e atendimentos,
-- caso essas tabelas já existam de uma instalação anterior.
alter table leads add column if not exists "clienteId" text;
alter table atendimentos add column if not exists "clienteId" text;
alter table atendimentos add column if not exists "dataEntradaStatus" text;

-- Datação do lead e timesheet simplificado (lançamentos de horas)
alter table leads add column if not exists "dataCaptacao" text;
alter table leads add column if not exists timesheet jsonb default '[]'::jsonb;
alter table atendimentos add column if not exists timesheet jsonb default '[]'::jsonb;

-- Contagem automatica de tempo por etapa/status (movimentacoes das tarefas)
alter table leads add column if not exists "dataEntradaEtapa" text;
alter table leads add column if not exists "tempoAcumulado" jsonb default '{}'::jsonb;
alter table leads add column if not exists historico jsonb default '[]'::jsonb;
alter table atendimentos add column if not exists "tempoAcumulado" jsonb default '{}'::jsonb;
alter table atendimentos add column if not exists historico jsonb default '[]'::jsonb;

-- Campos novos: CPF, senha gov.br, origem detalhada e agendamento de atendimento
alter table leads add column if not exists cpf text;
alter table leads add column if not exists "senhaGovBr" text;
alter table leads add column if not exists "origemDetalhe" text;
alter table leads add column if not exists "atendimentoAgendado" boolean default false;
alter table leads add column if not exists "dataAgendamento" text;
alter table leads add column if not exists "horaAgendamento" text;
alter table clientes add column if not exists "senhaGovBr" text;

-- Multiplos responsaveis e pendencias do lead
alter table leads add column if not exists "responsaveisAdicionais" text[] default '{}';
alter table atendimentos add column if not exists "responsaveisAdicionais" text[] default '{}';
alter table leads add column if not exists pendencias text;

-- CPF do cliente tambem no atendimento (aparece no card e no relatorio)
alter table atendimentos add column if not exists cpf text;

-- Atendimento aguardando analise de advogado
alter table atendimentos add column if not exists "aguardandoAnalise" boolean default false;

-- Pessoa fisica ou juridica no cadastro do cliente
alter table clientes add column if not exists "tipoPessoa" text default 'fisica';

-- Preenche o tipo de pessoa dos cadastros antigos pelo tamanho do documento
update clientes
   set "tipoPessoa" = case
         when length(regexp_replace(coalesce(documento, ''), '\D', '', 'g')) = 14 then 'juridica'
         else 'fisica'
       end
 where "tipoPessoa" is null;

-- ============================================================
-- PROCESSOS SENSIVEIS / PRIORITARIOS (tela exclusiva da conta mestre)
-- ============================================================
create table if not exists processos_sensiveis (
  id text primary key,
  "clienteId" text,
  "nomeCliente" text,
  "numeroProcesso" text,
  tribunal text,
  vara text,
  "advogadoResponsavel" text,
  descricao text,
  status text default 'acompanhamento',      -- acompanhamento | finalizado
  "dataCriacao" text,
  "dataUltimaCobranca" text,                 -- zerada a cada cobranca feita
  "dataUltimoAviso" text,                    -- ultimo e-mail disparado
  historico jsonb default '[]'::jsonb
);

create index if not exists processos_sensiveis_status_idx
  on processos_sensiveis (status);

-- ============================================================
-- CONTROLE DE ACESSO
-- Conta mestre (acesso total) e contas colaboradoras (restritas).
-- As regras abaixo valem NO BANCO: mesmo que alguém contorne a tela,
-- o Supabase recusa o que o perfil não pode fazer.
-- ============================================================

-- Perfis: um registro por usuario do Supabase Auth.
create table if not exists perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nome text,
  papel text not null default 'colaborador',
  "responsavelNome" text,
  "dataCriacao" timestamptz default now()
);

-- Funcoes auxiliares usadas pelas politicas.
-- security definer: leem a tabela perfis sem cair na propria RLS.
create or replace function public.e_mestre()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select papel = 'mestre' from public.perfis where id = auth.uid()), false)
$$;

create or replace function public.meu_responsavel()
returns text language sql stable security definer set search_path = public as $$
  select "responsavelNome" from public.perfis where id = auth.uid()
$$;

alter table leads enable row level security;
alter table responsaveis enable row level security;
alter table atendimentos enable row level security;
alter table clientes enable row level security;
alter table perfis enable row level security;
alter table processos_sensiveis enable row level security;

-- Remove as politicas abertas da versao anterior (sem login).
drop policy if exists "Permitir tudo (uso interno)" on leads;
drop policy if exists "Permitir tudo (uso interno)" on responsaveis;
drop policy if exists "Permitir tudo (uso interno)" on atendimentos;
drop policy if exists "Permitir tudo (uso interno)" on clientes;

-- ---------- PERFIS ----------
drop policy if exists "perfis_select" on perfis;
create policy "perfis_select" on perfis for select to authenticated
  using (id = auth.uid() or e_mestre());

drop policy if exists "perfis_insert" on perfis;
create policy "perfis_insert" on perfis for insert to authenticated
  with check (e_mestre());

drop policy if exists "perfis_update" on perfis;
create policy "perfis_update" on perfis for update to authenticated
  using (e_mestre()) with check (e_mestre());

drop policy if exists "perfis_delete" on perfis;
create policy "perfis_delete" on perfis for delete to authenticated
  using (e_mestre());

-- ---------- LEADS ----------
-- Funcao auxiliar: o usuario atual responde por este lead?
-- Vale tanto para o responsavel principal quanto para os adicionais.
-- (Mantida: ainda e usada pela tela para destacar "meus leads".)
create or replace function public.responde_por(
  principal text, adicionais text[]
) returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    principal = public.meu_responsavel()
    or public.meu_responsavel() = any(coalesce(adicionais, '{}'::text[])),
    false)
$$;

-- ATENCAO — MUDANCA DE REGRA (pedido de 15/10/2026, itens 3 e 4):
-- Antes, o colaborador so via os leads em que era responsavel. Agora TODA a
-- equipe le e trabalha em TODOS os leads, para que qualquer um gere relatorio
-- geral e inclua um segundo responsavel em qualquer lead.
-- Continua valendo: somente a conta mestre EXCLUI leads, cadastra pessoas na
-- equipe e troca o responsavel principal.
drop policy if exists "leads_select" on leads;
create policy "leads_select" on leads for select to authenticated
  using (true);

drop policy if exists "leads_insert" on leads;
create policy "leads_insert" on leads for insert to authenticated
  with check (true);

drop policy if exists "leads_update" on leads;
create policy "leads_update" on leads for update to authenticated
  using (true) with check (true);

-- Somente a conta mestre exclui leads.
drop policy if exists "leads_delete" on leads;
create policy "leads_delete" on leads for delete to authenticated
  using (e_mestre());

-- ---------- ATENDIMENTOS ----------
-- Visualizacao e trabalho total para toda a equipe; exclusao so da mestre.
drop policy if exists "atendimentos_select" on atendimentos;
create policy "atendimentos_select" on atendimentos for select to authenticated using (true);

drop policy if exists "atendimentos_insert" on atendimentos;
create policy "atendimentos_insert" on atendimentos for insert to authenticated with check (true);

drop policy if exists "atendimentos_update" on atendimentos;
create policy "atendimentos_update" on atendimentos for update to authenticated
  using (true) with check (true);

drop policy if exists "atendimentos_delete" on atendimentos;
create policy "atendimentos_delete" on atendimentos for delete to authenticated
  using (e_mestre());

-- ---------- CLIENTES ----------
drop policy if exists "clientes_select" on clientes;
create policy "clientes_select" on clientes for select to authenticated using (true);

drop policy if exists "clientes_insert" on clientes;
create policy "clientes_insert" on clientes for insert to authenticated with check (true);

drop policy if exists "clientes_update" on clientes;
create policy "clientes_update" on clientes for update to authenticated
  using (true) with check (true);

drop policy if exists "clientes_delete" on clientes;
create policy "clientes_delete" on clientes for delete to authenticated
  using (e_mestre());

-- ---------- RESPONSAVEIS (equipe) ----------
-- Todos leem (para preencher as listas); so a mestre cadastra/remove.
drop policy if exists "responsaveis_select" on responsaveis;
create policy "responsaveis_select" on responsaveis for select to authenticated using (true);

drop policy if exists "responsaveis_insert" on responsaveis;
create policy "responsaveis_insert" on responsaveis for insert to authenticated with check (e_mestre());

drop policy if exists "responsaveis_update" on responsaveis;
create policy "responsaveis_update" on responsaveis for update to authenticated
  using (e_mestre()) with check (e_mestre());

drop policy if exists "responsaveis_delete" on responsaveis;
create policy "responsaveis_delete" on responsaveis for delete to authenticated
  using (e_mestre());

-- ---------- PROCESSOS SENSIVEIS ----------
-- Tela restrita: SO a conta mestre le, cadastra, edita e exclui.
-- O colaborador recebe lista vazia (nao e erro, e a regra do banco).
drop policy if exists "processos_select" on processos_sensiveis;
create policy "processos_select" on processos_sensiveis for select to authenticated
  using (e_mestre());

drop policy if exists "processos_insert" on processos_sensiveis;
create policy "processos_insert" on processos_sensiveis for insert to authenticated
  with check (e_mestre());

drop policy if exists "processos_update" on processos_sensiveis;
create policy "processos_update" on processos_sensiveis for update to authenticated
  using (e_mestre()) with check (e_mestre());

drop policy if exists "processos_delete" on processos_sensiveis;
create policy "processos_delete" on processos_sensiveis for delete to authenticated
  using (e_mestre());

-- ============================================================
-- CPF UNICO POR CLIENTE (item 5)
-- Compara so os digitos: 111.444.777-35 e 11144477735 sao o mesmo CPF.
-- A tela ja barra o CPF repetido; este indice e a garantia no banco.
-- Clientes antigos sem CPF nao travam a criacao do indice.
-- ============================================================
do $$
begin
  create unique index if not exists clientes_documento_unico
    on clientes ((regexp_replace(documento, '\D', '', 'g')))
    where documento is not null and regexp_replace(documento, '\D', '', 'g') <> '';
  raise notice 'Indice de CPF unico OK.';
exception when others then
  raise notice 'Indice de CPF unico NAO criado (%). Ja existem clientes com CPF repetido: rode a consulta abaixo, corrija os cadastros e rode este script de novo.', sqlerrm;
end $$;

-- Consulta para achar CPFs repetidos (rode se o aviso acima aparecer):
--
--   select regexp_replace(documento, '\D', '', 'g') as cpf,
--          count(*) as quantidade,
--          string_agg(nome, ' | ') as clientes
--   from clientes
--   where documento is not null and regexp_replace(documento, '\D', '', 'g') <> ''
--   group by 1 having count(*) > 1
--   order by 2 desc;

-- ============================================================
-- PASSO MANUAL OBRIGATORIO (uma unica vez)
--
-- 1. No Supabase: Authentication > Users > Add user, crie o SEU usuario
--    com e-mail e senha. Repita para cada pessoa da equipe.
-- 2. Em Authentication > Providers > Email:
--    - o provedor "Email" tem que ficar LIGADO (se desligar, ninguem entra:
--      a tela de login acusa "Email logins are disabled");
--    - DESLIGUE apenas a opcao de dentro dele "Allow new users to sign up"
--      (em algumas versoes aparece como "Enable sign ups"), para que ninguem
--      crie conta sozinho pelo site.
-- 3. Rode o comando abaixo trocando o e-mail pelo SEU, para virar mestre:
--
--    insert into perfis (id, email, nome, papel, "responsavelNome")
--    select id, email, 'Antonio Augusto', 'mestre', 'Antonio Augusto'
--    from auth.users where email = 'SEU-EMAIL@exemplo.com'
--    on conflict (id) do update set papel = 'mestre';
--
-- 4. Para cada colaborador (o "responsavelNome" precisa ser IDENTICO ao
--    nome cadastrado na tela Equipe, senao ele nao vera os leads dele):
--
--    insert into perfis (id, email, nome, papel, "responsavelNome")
--    select id, email, 'Nome da Pessoa', 'colaborador', 'Nome da Pessoa'
--    from auth.users where email = 'colaborador@exemplo.com'
--    on conflict (id) do update set papel = 'colaborador';
-- ============================================================
