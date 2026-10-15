-- ============================================================
-- ATUALIZAÇÃO 15/10/2026 — itens 1, 3, 4 e 5
-- Cole este script inteiro no SQL Editor do Supabase e clique em "Run".
-- Seguro para rodar de novo. Não apaga nada.
--
-- Se preferir, pode rodar o supabase-setup.sql completo: ele já está
-- atualizado com tudo isto. Este arquivo é só o atalho.
-- ============================================================

-- ------------------------------------------------------------
-- ITEM 1 — CPF do cliente também no atendimento
-- ------------------------------------------------------------
alter table atendimentos add column if not exists cpf text;


-- ------------------------------------------------------------
-- ITENS 3 e 4 — toda a equipe lê e trabalha em TODOS os leads
--
-- MUDANÇA DE REGRA: antes, o colaborador só enxergava os leads em que
-- era responsável — por isso o relatório dele saía incompleto e ele não
-- conseguia se incluir como segundo responsável num lead de outra pessoa.
-- Agora o banco libera leitura, inclusão e edição de todos os leads.
--
-- O que a conta mestre continua tendo só para ela:
--   • excluir leads, clientes e atendimentos
--   • cadastrar/remover pessoas da equipe
--   • trocar o responsável PRINCIPAL de um lead (travado na tela)
-- ------------------------------------------------------------
drop policy if exists "leads_select" on leads;
create policy "leads_select" on leads for select to authenticated
  using (true);

drop policy if exists "leads_insert" on leads;
create policy "leads_insert" on leads for insert to authenticated
  with check (true);

drop policy if exists "leads_update" on leads;
create policy "leads_update" on leads for update to authenticated
  using (true) with check (true);

-- exclusão continua restrita à mestre
drop policy if exists "leads_delete" on leads;
create policy "leads_delete" on leads for delete to authenticated
  using (e_mestre());


-- ------------------------------------------------------------
-- ITEM 5 — CPF único por cliente
-- Compara só os dígitos: 111.444.777-35 e 11144477735 são o mesmo CPF.
-- A tela já barra o CPF repetido; este índice é a garantia no banco.
-- ------------------------------------------------------------
do $$
begin
  create unique index if not exists clientes_documento_unico
    on clientes ((regexp_replace(documento, '\D', '', 'g')))
    where documento is not null and regexp_replace(documento, '\D', '', 'g') <> '';
  raise notice 'Indice de CPF unico OK.';
exception when others then
  raise notice 'Indice de CPF unico NAO criado (%). Ja existem clientes com CPF repetido: rode a consulta abaixo, corrija os cadastros e rode este script de novo.', sqlerrm;
end $$;

-- Se o aviso acima disser que o índice NÃO foi criado, rode esta consulta
-- para ver quais cadastros estão repetidos, junte-os e rode o script de novo:
--
--   select regexp_replace(documento, '\D', '', 'g') as cpf,
--          count(*) as quantidade,
--          string_agg(nome, ' | ') as clientes
--   from clientes
--   where documento is not null and regexp_replace(documento, '\D', '', 'g') <> ''
--   group by 1 having count(*) > 1
--   order by 2 desc;

-- Clientes antigos cadastrados sem CPF (preencha quando puder — o CPF só é
-- obrigatório para cadastros NOVOS, então os antigos continuam funcionando):
--
--   select id, nome, telefone from clientes
--   where documento is null or regexp_replace(documento, '\D', '', 'g') = ''
--   order by nome;
