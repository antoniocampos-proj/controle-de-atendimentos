-- ============================================================
-- ATUALIZAÇÃO — itens 1, 3 e 5
-- Cole este script inteiro no SQL Editor do Supabase e clique em "Run".
-- Seguro para rodar de novo. Não apaga nada.
--
-- Se preferir, pode rodar o supabase-setup.sql completo: ele já está
-- atualizado com tudo isto. Este arquivo é só o atalho.
-- ============================================================

-- ------------------------------------------------------------
-- ITEM 1 — pessoa física ou jurídica no cadastro do cliente
-- ------------------------------------------------------------
alter table clientes add column if not exists "tipoPessoa" text default 'fisica';

-- Cadastros antigos: deduz o tipo pelo tamanho do documento
update clientes
   set "tipoPessoa" = case
         when length(regexp_replace(coalesce(documento, ''), '\D', '', 'g')) = 14 then 'juridica'
         else 'fisica'
       end
 where "tipoPessoa" is null;


-- ------------------------------------------------------------
-- ITEM 3 — atendimento aguardando análise de advogado
-- ------------------------------------------------------------
alter table atendimentos add column if not exists "aguardandoAnalise" boolean default false;


-- ------------------------------------------------------------
-- ITEM 5 — processos sensíveis / prioritários
-- Tela exclusiva da conta mestre. O colaborador recebe lista vazia.
-- ------------------------------------------------------------
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
  "dataUltimaCobranca" text,                 -- zerada a cada cobrança registrada
  "dataUltimoAviso" text,                    -- último e-mail disparado
  historico jsonb default '[]'::jsonb
);

create index if not exists processos_sensiveis_status_idx
  on processos_sensiveis (status);

alter table processos_sensiveis enable row level security;

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


-- ------------------------------------------------------------
-- CONFERÊNCIA
-- ------------------------------------------------------------
-- Quem é conta mestre (é para esses e-mails que a cobrança será enviada):
--
--   select email, nome, papel from perfis where papel = 'mestre';
--
-- Se não aparecer ninguém, o e-mail automático não tem para onde ir.
-- Nesse caso rode o vincular-contas.sql antes.
