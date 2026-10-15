// ============================================================================
// Cobranca automatica dos Processos Sensiveis / Prioritarios
//
// O que faz: todo dia de manha, procura os processos em acompanhamento que
// completaram 5 dias uteis sem cobranca e manda UM e-mail resumido para a(s)
// conta(s) mestre. Depois de avisar, marca "dataUltimoAviso" para nao repetir
// o mesmo processo todo dia — o proximo aviso daquele processo so sai depois
// de mais 5 dias uteis, ou quando a cobranca for registrada no CRM.
//
// Como publicar (uma vez so), no terminal, dentro da pasta do projeto:
//   supabase login
//   supabase link --project-ref SEU-PROJECT-REF
//   supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
//   supabase secrets set EMAIL_REMETENTE="CRM AASAA <crm@seudominio.com.br>"
//   supabase functions deploy cobranca-processos
//
// Depois agende no SQL Editor com o arquivo agendar-cobranca.sql.
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const DIAS_UTEIS_COBRANCA = 5;

// ---------------------------------------------------------------------------
// FERIADOS — esta lista tem que ser IGUAL à do App.jsx, senão o e-mail
// discorda do que a tela mostra. Se mudar lá, mude aqui também.
// ---------------------------------------------------------------------------
const FERIADOS_FIXOS = [
  { dia: 1,  mes: 1,  nome: 'Confraternização Universal' },
  { dia: 21, mes: 4,  nome: 'Tiradentes' },
  { dia: 1,  mes: 5,  nome: 'Dia do Trabalho' },
  { dia: 7,  mes: 9,  nome: 'Independência do Brasil' },
  { dia: 12, mes: 10, nome: 'Nossa Senhora Aparecida' },
  { dia: 2,  mes: 11, nome: 'Finados' },
  { dia: 15, mes: 11, nome: 'Proclamação da República' },
  { dia: 20, mes: 11, nome: 'Consciência Negra' },
  { dia: 25, mes: 12, nome: 'Natal' },
  { dia: 28, mes: 7,  nome: 'Adesão do Maranhão à Independência' },  // estadual
  { dia: 8,  mes: 9,  nome: 'Aniversário de São Luís' },             // municipal
];

const FERIADOS_MOVEIS = [
  { offset: -48, nome: 'Carnaval (segunda)', facultativo: true },
  { offset: -47, nome: 'Carnaval (terça)', facultativo: true },
  { offset: -2,  nome: 'Sexta-feira Santa', facultativo: false },
  { offset: 60,  nome: 'Corpus Christi', facultativo: true },
];

const CONTAR_PONTO_FACULTATIVO_COMO_FERIADO = true;

function domingoDePascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia);
}

function chaveDia(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

const cacheFeriados: Record<number, Record<string, string>> = {};
function feriadosDoAno(ano: number): Record<string, string> {
  if (cacheFeriados[ano]) return cacheFeriados[ano];
  const mapa: Record<string, string> = {};
  for (const f of FERIADOS_FIXOS) {
    mapa[chaveDia(new Date(ano, f.mes - 1, f.dia))] = f.nome;
  }
  const pascoa = domingoDePascoa(ano);
  for (const f of FERIADOS_MOVEIS) {
    if (f.facultativo && !CONTAR_PONTO_FACULTATIVO_COMO_FERIADO) continue;
    const d = new Date(pascoa.getFullYear(), pascoa.getMonth(), pascoa.getDate() + f.offset);
    mapa[chaveDia(d)] = f.nome;
  }
  cacheFeriados[ano] = mapa;
  return mapa;
}

function ehDiaUtil(data: Date): boolean {
  const semana = data.getDay();
  if (semana === 0 || semana === 6) return false;
  return !feriadosDoAno(data.getFullYear())[chaveDia(data)];
}

// A função roda em UTC no Supabase, mas a contagem tem que ser a mesma que
// a pessoa vê na tela, em Brasília. Então convertemos para o dia brasileiro
// antes de contar — senão, perto da meia-noite, a conta sai um dia errada.
function diaEmBrasilia(d: Date): Date {
  // "2026-10-05" no fuso de São Paulo, montado como data pura (sem hora).
  const [dia, mes, ano] = d
    .toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    .split('/');
  return new Date(Number(ano), Number(mes) - 1, Number(dia));
}

function paraDataLocal(valor: string | null): Date | null {
  if (!valor) return null;
  const texto = String(valor).trim();
  const soData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  if (soData) return new Date(Number(soData[1]), Number(soData[2]) - 1, Number(soData[3]));
  const d = new Date(texto);
  if (isNaN(d.getTime())) return null;
  return diaEmBrasilia(d);
}

// Mesma contagem usada na tela: pula fins de semana e feriados.
function diasUteisDesde(dataISO: string | null): number {
  const cursor = paraDataLocal(dataISO);
  if (!cursor) return 0;
  const alvo = diaEmBrasilia(new Date());
  let uteis = 0;
  while (cursor < alvo) {
    cursor.setDate(cursor.getDate() + 1);
    if (ehDiaUtil(cursor)) uteis += 1;
  }
  return uteis;
}

function formatarData(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

function escapar(texto: unknown): string {
  return String(texto ?? '—')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

Deno.serve(async (req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 1) processos ainda em acompanhamento
    const { data: processos, error: erroProc } = await supabase
      .from('processos_sensiveis')
      .select('*')
      .neq('status', 'finalizado');

    if (erroProc) {
      console.error('erro ao ler processos:', erroProc);
      return new Response(JSON.stringify({ erro: erroProc.message }), { status: 500 });
    }

    // 2) quais ja venceram E ainda nao foram avisados neste ciclo
    const vencidos = (processos ?? []).filter((p) => {
      const base = p.dataUltimaCobranca ?? p.dataCriacao;
      if (diasUteisDesde(base) < DIAS_UTEIS_COBRANCA) return false;
      if (!p.dataUltimoAviso) return true;
      return diasUteisDesde(p.dataUltimoAviso) >= DIAS_UTEIS_COBRANCA;
    });

    if (vencidos.length === 0) {
      return new Response(JSON.stringify({ ok: true, enviados: 0, motivo: 'nada vencido' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3) para quem mandar: todas as contas mestre cadastradas
    const { data: mestres, error: erroMestre } = await supabase
      .from('perfis')
      .select('email, nome')
      .eq('papel', 'mestre');

    if (erroMestre) {
      console.error('erro ao ler perfis:', erroMestre);
      return new Response(JSON.stringify({ erro: erroMestre.message }), { status: 500 });
    }

    const destinatarios = (mestres ?? []).map((m) => m.email).filter(Boolean);
    if (destinatarios.length === 0) {
      return new Response(
        JSON.stringify({ erro: 'Nenhuma conta mestre com e-mail cadastrado na tabela perfis.' }),
        { status: 400 },
      );
    }

    // 4) monta o e-mail
    const linhas = vencidos
      .map((p) => {
        const dias = diasUteisDesde(p.dataUltimaCobranca ?? p.dataCriacao);
        return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;">
            <strong>${escapar(p.nomeCliente)}</strong><br>
            <span style="font-family:monospace;font-size:12px;color:#555;">${escapar(p.numeroProcesso)}</span>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;color:#555;">
            ${escapar(p.tribunal)}<br>${escapar(p.vara)}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;color:#555;">
            ${escapar(p.advogadoResponsavel)}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;color:#8B2E3A;font-weight:600;white-space:nowrap;">
            ${dias} dias úteis<br>
            <span style="font-weight:400;color:#888;">desde ${formatarData(p.dataUltimaCobranca ?? p.dataCriacao)}</span>
          </td>
        </tr>`;
      })
      .join('');

    const html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:720px;margin:0 auto;">
        <div style="background:#7C2629;color:#fff;padding:18px 20px;">
          <h1 style="margin:0;font-size:18px;">CONTROLE DE LEADS E ATENDIMENTOS</h1>
          <p style="margin:4px 0 0;font-size:12px;opacity:.75;">Antonio Augusto Sousa Advogados Associados</p>
        </div>
        <div style="padding:20px;">
          <h2 style="font-size:16px;color:#7C2629;margin:0 0 6px;">
            Processos sensíveis aguardando cobrança
          </h2>
          <p style="font-size:14px;color:#444;margin:0 0 16px;">
            ${vencidos.length === 1
              ? 'Há <strong>1 processo</strong> com 5 dias úteis ou mais sem cobrança registrada.'
              : `Há <strong>${vencidos.length} processos</strong> com 5 dias úteis ou mais sem cobrança registrada.`}
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead>
              <tr style="background:#f6f6f6;text-align:left;">
                <th style="padding:8px 12px;font-size:11px;text-transform:uppercase;color:#888;">Cliente / Processo</th>
                <th style="padding:8px 12px;font-size:11px;text-transform:uppercase;color:#888;">Tribunal / Vara</th>
                <th style="padding:8px 12px;font-size:11px;text-transform:uppercase;color:#888;">Advogado</th>
                <th style="padding:8px 12px;font-size:11px;text-transform:uppercase;color:#888;">Sem cobrança</th>
              </tr>
            </thead>
            <tbody>${linhas}</tbody>
          </table>
          <p style="font-size:13px;color:#666;margin:18px 0 0;">
            Abra a aba <strong>Notificações</strong> no CRM e clique em "Registrar cobrança"
            para zerar a contagem de cada processo.
          </p>
        </div>
      </div>`;

    // 5) envia pelo Resend
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ erro: 'RESEND_API_KEY não configurada. Rode: supabase secrets set RESEND_API_KEY=...' }),
        { status: 500 },
      );
    }

    const resposta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: Deno.env.get('EMAIL_REMETENTE') ?? 'CRM AASAA <onboarding@resend.dev>',
        to: destinatarios,
        subject: `[AASAA] ${vencidos.length} processo(s) sensível(eis) aguardando cobrança`,
        html,
      }),
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      console.error('falha no envio:', detalhe);
      return new Response(JSON.stringify({ erro: 'Falha ao enviar o e-mail', detalhe }), { status: 502 });
    }

    // 6) marca que ja avisamos, para nao repetir amanha
    const agora = new Date().toISOString();
    const { error: erroUpdate } = await supabase
      .from('processos_sensiveis')
      .update({ dataUltimoAviso: agora })
      .in('id', vencidos.map((p) => p.id));

    if (erroUpdate) console.error('erro ao marcar aviso:', erroUpdate);

    return new Response(
      JSON.stringify({ ok: true, enviados: vencidos.length, destinatarios }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('erro inesperado:', err);
    return new Response(JSON.stringify({ erro: String(err) }), { status: 500 });
  }
});
