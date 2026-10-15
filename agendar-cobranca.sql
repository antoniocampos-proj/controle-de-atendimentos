-- ============================================================
-- AGENDAMENTO DO E-MAIL DE COBRANÇA DOS PROCESSOS SENSÍVEIS
--
-- Rode este script DEPOIS de publicar a função cobranca-processos
-- (veja as instruções no topo do arquivo
--  supabase/functions/cobranca-processos/index.ts).
--
-- O que ele faz: todo dia útil às 8h (horário de Brasília) o Supabase
-- chama a função. A própria função decide se há algo a cobrar — ela só
-- manda e-mail quando algum processo completa 5 dias úteis sem cobrança,
-- e não repete o mesmo processo antes de passarem outros 5 dias úteis.
-- ============================================================

-- 1) Liga as extensões necessárias (já vêm no Supabase, só precisam ser ativadas)
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- 2) PREENCHA ESTES DOIS VALORES ANTES DE RODAR
--
--    SEU-PROJECT-REF  → está na URL do painel:
--                       https://supabase.com/dashboard/project/SEU-PROJECT-REF
--
--    SUA-SERVICE-ROLE-KEY → Project Settings → API → service_role (secret)
--                       ATENÇÃO: essa chave dá acesso total ao banco.
--                       Não a coloque no site nem no GitHub — ela só vive
--                       aqui dentro, no agendamento do seu próprio projeto.

-- 3) Remove um agendamento anterior, se existir (deixa o script repetível)
select cron.unschedule('cobranca-processos-sensiveis')
 where exists (select 1 from cron.job where jobname = 'cobranca-processos-sensiveis');

-- 4) Agenda de segunda a sexta, às 8h de Brasília (11h UTC)
select cron.schedule(
  'cobranca-processos-sensiveis',
  '0 11 * * 1-5',
  $$
  select net.http_post(
    url     := 'https://SEU-PROJECT-REF.supabase.co/functions/v1/cobranca-processos',
    headers := jsonb_build_object(
                 'Content-Type',  'application/json',
                 'Authorization', 'Bearer SUA-SERVICE-ROLE-KEY'
               ),
    body    := '{}'::jsonb
  );
  $$
);

-- ============================================================
-- CONFERÊNCIA
-- ============================================================

-- Ver o agendamento criado:
--   select jobid, jobname, schedule, active from cron.job;

-- Ver as últimas execuções (e os erros, se houver):
--   select runid, job_pid, status, return_message, start_time
--     from cron.job_run_details
--    where jobid = (select jobid from cron.job where jobname = 'cobranca-processos-sensiveis')
--    order by start_time desc limit 10;

-- Testar o envio agora, sem esperar o horário (no terminal):
--   curl -X POST 'https://SEU-PROJECT-REF.supabase.co/functions/v1/cobranca-processos' \
--        -H 'Authorization: Bearer SUA-SERVICE-ROLE-KEY'

-- Desligar o envio automático (a aba Notificações continua funcionando):
--   select cron.unschedule('cobranca-processos-sensiveis');
