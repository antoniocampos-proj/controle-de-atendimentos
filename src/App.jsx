import React, { useState, useEffect, useMemo, useContext, createContext } from 'react';
import { createPortal } from 'react-dom';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import logoAasaa from './assets/logo-aasaa.png';
import {
  LayoutDashboard, LayoutGrid, Users, UserPlus, Plus, Search, X, Trash2, Pencil,
  Phone, Mail, CheckCircle2, DollarSign, CalendarCheck, Clock, FileText,
  Loader2, AlertCircle, GripVertical, Inbox, Filter, Eye, EyeOff, CalendarDays, ChevronLeft, ChevronRight,
  Sun, Moon, Scale, Bell, Landmark,
  LogOut, ShieldCheck, Lock
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// ---------------------------------------------------------------------------
// Design tokens (custom "notarial ledger" palette on top of Tailwind's base)
// ---------------------------------------------------------------------------

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,900&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

      :root {
        --ink: #7C2629;
        --ink-surface: #7C2629;
        --ink-light: #963038;
        --brass: #7C2629;
        --brass-dark: #632021;
        --brass-tint: rgba(124,38,41,0.14);
        --lacre: #8B2E3A;
        --lacre-dark: #6E232C;
        --lacre-tint: rgba(139,46,58,0.10);
        --verde: #551B2C;
        --verde-dark: #431521;
        --verde-tint: rgba(85,27,44,0.10);
        --azul: #C17C93;
        --azul-dark: #A3647A;
        --azul-tint: rgba(193,124,147,0.10);
        --previdenciaria: #6E3550;
        --previdenciaria-tint: rgba(110,53,80,0.12);
        --civel: #95677A;
        --civel-tint: rgba(149,103,122,0.12);
        --trabalhista: #A14E3F;
        --trabalhista-tint: rgba(161,78,63,0.12);
        --rubi: #8C3A32;
        --rubi-tint: rgba(140,58,50,0.12);
        --ameixa: #6B3557;
        --ameixa-tint: rgba(107,53,87,0.12);
        --grafite: #8A7B70;
        --grafite-tint: rgba(138,123,112,0.14);
        --carvao: #5C5049;
        --carvao-tint: rgba(92,80,73,0.14);
        --indigo: #4A5A8C;
        --indigo-tint: rgba(74,90,140,0.12);
        --oliva: #6B7A4A;
        --oliva-tint: rgba(107,122,74,0.12);
        --cobre: #8C5A3C;
        --cobre-tint: rgba(140,90,60,0.12);
        font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      .font-display { font-family: 'Fraunces', Georgia, 'Times New Roman', serif; }
      .font-body { font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      .font-ledger { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; font-variant-numeric: tabular-nums; }

      .btn-brass { background-color: var(--brass); color: #ffffff; }
      .btn-brass:hover { background-color: var(--brass-dark); }

      .btn-ink-outline { border: 1px solid rgba(255,255,255,0.25); color: rgba(255,255,255,0.9); background-color: transparent; }
      .btn-ink-outline:hover { background-color: rgba(255,255,255,0.08); }

      .btn-white { background-color: #ffffff; color: var(--ink); border: 1.5px solid var(--ink); }
      .btn-white:hover { background-color: #ececec; }

      .tab-folder { position: relative; top: 1px; border-radius: 8px 8px 0 0; transition: background-color .15s ease, color .15s ease; background-color: transparent; color: rgba(255,255,255,0.55); }
      .tab-folder.active { background-color: #F1F5F9; color: var(--ink); }
      .tab-folder:not(.active):hover { color: rgba(255,255,255,0.88); }

      .kanban-scroll {
        height: calc(100vh - 20rem);
        min-height: 24rem;
        scrollbar-width: auto;
      }
      /* Tabelas largas: a area rola dentro de uma altura presa a tela, entao a
         barra horizontal fica sempre visivel, sem precisar descer a pagina. */
      .tabela-scroll {
        max-height: calc(100vh - 19rem);
        min-height: 18rem;
        overflow: auto;
        scrollbar-width: auto;
      }
      .tabela-scroll thead th {
        position: sticky;
        top: 0;
        z-index: 2;
      }
      .tabela-scroll::-webkit-scrollbar { height: 12px; width: 12px; }
      .tabela-scroll::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 6px; }
      .tabela-scroll::-webkit-scrollbar-thumb { background: var(--brass); border-radius: 6px; }
      .tabela-scroll::-webkit-scrollbar-thumb:hover { background: var(--brass-dark); }

      .kanban-scroll::-webkit-scrollbar { height: 12px; }
      .kanban-scroll::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 6px; }
      .kanban-scroll::-webkit-scrollbar-thumb { background: var(--brass); border-radius: 6px; }
      .kanban-scroll::-webkit-scrollbar-thumb:hover { background: var(--brass-dark); }

      .focus-brass:focus { outline: none; box-shadow: 0 0 0 3px var(--brass-tint), 0 0 0 1px var(--brass); }

      /* =====================================================================
         MODO ESCURO
         Marcado em <html data-tema="escuro">. Em vez de reescrever as classes
         do Tailwind em todo o app, o tema redefine aqui as cores de cada
         classe usada. Assim nenhum componente precisa saber do tema.
         ===================================================================== */
      html[data-tema="escuro"] {
        --ink: #E8959C;
        --ink-light: #F0AAB0;
        --ink-surface: #3A1F21;
        --brass: #A33A3E;
        --brass-dark: #8C2F33;
        --brass-tint: rgba(232,149,156,0.18);
        --lacre: #D98494;
        --lacre-tint: rgba(217,132,148,0.18);
        --verde: #C98098;
        --verde-tint: rgba(201,128,152,0.18);
        --azul: #D9A2B4;
        --azul-tint: rgba(217,162,180,0.18);
        --previdenciaria: #B98AA6;
        --previdenciaria-tint: rgba(185,138,166,0.20);
        --civel: #C5A0AF;
        --civel-tint: rgba(197,160,175,0.20);
        --trabalhista: #D08C7C;
        --trabalhista-tint: rgba(208,140,124,0.20);
        --rubi: #D4817A;
        --rubi-tint: rgba(212,129,122,0.20);
        --ameixa: #B084A0;
        --ameixa-tint: rgba(176,132,160,0.20);
        --grafite: #BBAEA5;
        --grafite-tint: rgba(187,174,165,0.20);
        --carvao: #AEA29A;
        --carvao-tint: rgba(174,162,154,0.20);
        --indigo: #93A3D4;
        --indigo-tint: rgba(147,163,212,0.20);
        --oliva: #A7B882;
        --oliva-tint: rgba(167,184,130,0.20);
        --cobre: #C99670;
        --cobre-tint: rgba(201,150,112,0.20);

        --superficie: #1F1A19;
        --superficie-2: #262020;
        --fundo: #15110F;
        --borda: #332C2B;
        --texto-forte: #F2ECEA;
        --texto: #D8CFCC;
        --texto-fraco: #A79B98;
        color-scheme: dark;
      }

      /* fundos */
      html[data-tema="escuro"] .bg-white { background-color: var(--superficie); }
      html[data-tema="escuro"] .bg-slate-50 { background-color: var(--superficie-2); }
      html[data-tema="escuro"] .bg-slate-100 { background-color: var(--fundo); }
      html[data-tema="escuro"] .bg-slate-200 { background-color: #2E2726; }
      html[data-tema="escuro"] .hover\\:bg-slate-50:hover { background-color: var(--superficie-2); }
      html[data-tema="escuro"] .hover\\:bg-white:hover { background-color: var(--superficie-2); }

      /* textos */
      html[data-tema="escuro"] .text-slate-900,
      html[data-tema="escuro"] .text-slate-800 { color: var(--texto-forte); }
      html[data-tema="escuro"] .text-slate-700 { color: var(--texto); }
      html[data-tema="escuro"] .text-slate-600 { color: #C4B9B6; }
      html[data-tema="escuro"] .text-slate-500 { color: var(--texto-fraco); }
      html[data-tema="escuro"] .text-slate-400 { color: #8E817E; }
      html[data-tema="escuro"] .text-slate-300 { color: #6E6260; }
      html[data-tema="escuro"] .hover\\:text-slate-600:hover,
      html[data-tema="escuro"] .hover\\:text-slate-700:hover { color: var(--texto-forte); }

      /* bordas */
      html[data-tema="escuro"] .border-slate-100 { border-color: #2A2423; }
      html[data-tema="escuro"] .border-slate-200 { border-color: var(--borda); }
      html[data-tema="escuro"] .border-slate-300 { border-color: #413938; }
      html[data-tema="escuro"] .border-slate-400 { border-color: #4E4544; }
      html[data-tema="escuro"] .divide-slate-100 > * + * { border-color: #2A2423; }

      /* campos de formulario */
      html[data-tema="escuro"] input:not(:disabled),
      html[data-tema="escuro"] select:not(:disabled),
      html[data-tema="escuro"] textarea:not(:disabled) {
        background-color: #120E0E;
        color: var(--texto-forte);
        border-color: #453C3B;
      }
      html[data-tema="escuro"] input:disabled,
      html[data-tema="escuro"] select:disabled,
      html[data-tema="escuro"] textarea:disabled {
        background-color: #1A1514;
        color: var(--texto-fraco);
        border-color: #332C2B;
      }
      html[data-tema="escuro"] input::placeholder,
      html[data-tema="escuro"] textarea::placeholder { color: #7E7270; }
      html[data-tema="escuro"] option { background-color: var(--superficie-2); color: var(--texto-forte); }

      /* botoes e abas */
      html[data-tema="escuro"] .btn-white { background-color: var(--superficie-2); color: var(--ink); border-color: var(--ink); }
      html[data-tema="escuro"] .btn-white:hover { background-color: #332B2A; }
      html[data-tema="escuro"] .btn-brass { color: #FFF4F4; }
      html[data-tema="escuro"] .tab-folder.active { background-color: var(--fundo); color: var(--ink); }

      /* barra de rolagem do kanban */
      html[data-tema="escuro"] .kanban-scroll::-webkit-scrollbar-track { background: #2A2423; }

      /* cartoes e sombras ficam legiveis no escuro */
      html[data-tema="escuro"] .shadow-sm { box-shadow: 0 1px 2px rgba(0,0,0,0.5); }
      html[data-tema="escuro"] .shadow-md,
      html[data-tema="escuro"] .shadow-lg { box-shadow: 0 4px 14px rgba(0,0,0,0.6); }
    `}</style>
  );
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ETAPAS = [
  { id: 'nova', label: 'Captação Nova', colorVar: '--azul', tintVar: '--azul-tint', hex: '#C17C93' },
  { id: 'negociacao', label: 'Em Negociação', colorVar: '--brass', tintVar: '--brass-tint', hex: '#7C2629' },
  { id: 'pendencias', label: 'Com Pendências', colorVar: '--lacre', tintVar: '--lacre-tint', hex: '#8B2E3A' },
  { id: 'exito', label: 'Captação com Êxito', colorVar: '--verde', tintVar: '--verde-tint', hex: '#551B2C' },
  { id: 'nao_qualificado', label: 'Lead Não Qualificado', colorVar: '--grafite', tintVar: '--grafite-tint', hex: '#8A7B70' },
  { id: 'desistencia', label: 'Desistência do Cliente', colorVar: '--carvao', tintVar: '--carvao-tint', hex: '#5C5049' },
];

const ETAPAS_PERDIDAS = ['nao_qualificado', 'desistencia'];

const TIPOS_ACAO = [
  { id: 'previdenciaria', label: 'Previdenciária', colorVar: '--previdenciaria', tintVar: '--previdenciaria-tint', hex: '#6E3550' },
  { id: 'civel', label: 'Cível', colorVar: '--civel', tintVar: '--civel-tint', hex: '#95677A' },
  { id: 'trabalhista', label: 'Trabalhista', colorVar: '--trabalhista', tintVar: '--trabalhista-tint', hex: '#A14E3F' },
  { id: 'contratos_ndpe', label: 'Contratos NDPE', colorVar: '--indigo', tintVar: '--indigo-tint', hex: '#4A5A8C' },
  { id: 'parcerias', label: 'Parcerias', colorVar: '--oliva', tintVar: '--oliva-tint', hex: '#6B7A4A' },
  { id: 'contratos_adm', label: 'Contratos Administrativos', colorVar: '--cobre', tintVar: '--cobre-tint', hex: '#8C5A3C' },
  { id: 'outras', label: 'Outras', colorVar: null, tintVar: null, hex: '#78716C' },
];

const ORIGENS = ['Indicação', 'Parceiro', 'Site', 'Redes Sociais', 'Google Ads', 'Telefone', 'Evento', 'Outro'];

// Origens que pedem o nome de quem indicou / do parceiro.
const ORIGENS_COM_NOME = ['Indicação', 'Parceiro'];

// Mude esta data sempre que publicar uma atualizacao.
const VERSAO_SISTEMA = '15/10/2026';

const STATUS_PROCESSO = [
  { id: 'acompanhamento', label: 'Processos em Acompanhamento', colorVar: '--rubi', tintVar: '--rubi-tint', hex: '#8C3A32' },
  { id: 'finalizado', label: 'Acompanhamentos Finalizados', colorVar: '--ameixa', tintVar: '--ameixa-tint', hex: '#6B3557' },
];

// ---------------------------------------------------------------------------
// FERIADOS considerados na contagem de dias uteis.
//
// PARA INCLUIR OU TIRAR UM FERIADO, mexa so nas duas listas abaixo.
// Os feriados de data fixa ficam em FERIADOS_FIXOS; os que mudam de ano
// (Carnaval, Sexta-feira Santa, Corpus Christi) sao calculados a partir da
// Pascoa, entao valem para qualquer ano sem precisar atualizar nada.
// ---------------------------------------------------------------------------

const FERIADOS_FIXOS = [
  // Nacionais
  { dia: 1,  mes: 1,  nome: 'Confraternização Universal', esfera: 'nacional' },
  { dia: 21, mes: 4,  nome: 'Tiradentes', esfera: 'nacional' },
  { dia: 1,  mes: 5,  nome: 'Dia do Trabalho', esfera: 'nacional' },
  { dia: 7,  mes: 9,  nome: 'Independência do Brasil', esfera: 'nacional' },
  { dia: 12, mes: 10, nome: 'Nossa Senhora Aparecida', esfera: 'nacional' },
  { dia: 2,  mes: 11, nome: 'Finados', esfera: 'nacional' },
  { dia: 15, mes: 11, nome: 'Proclamação da República', esfera: 'nacional' },
  { dia: 20, mes: 11, nome: 'Consciência Negra', esfera: 'nacional' },
  { dia: 25, mes: 12, nome: 'Natal', esfera: 'nacional' },

  // Maranhão
  { dia: 28, mes: 7,  nome: 'Adesão do Maranhão à Independência', esfera: 'estadual' },

  // São Luís
  { dia: 8,  mes: 9,  nome: 'Aniversário de São Luís', esfera: 'municipal' },
];

// Feriados que dependem da Pascoa (numero de dias a partir do domingo).
const FERIADOS_MOVEIS = [
  { offset: -48, nome: 'Carnaval (segunda)', esfera: 'facultativo' },
  { offset: -47, nome: 'Carnaval (terça)', esfera: 'facultativo' },
  { offset: -2,  nome: 'Sexta-feira Santa', esfera: 'nacional' },
  { offset: 60,  nome: 'Corpus Christi', esfera: 'facultativo' },
];

// Carnaval e Corpus Christi sao ponto facultativo, nao feriado por lei — mas
// na pratica o escritorio e o forum nao funcionam. Deixe true para que a
// contagem os pule; mude para false se quiser conta-los como dia util.
const CONTAR_PONTO_FACULTATIVO_COMO_FERIADO = true;

// Domingo de Pascoa (algoritmo de Meeus/Butcher para o calendario gregoriano).
function domingoDePascoa(ano) {
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

function chaveDia(data) {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

// Monta (uma vez por ano consultado) o mapa "AAAA-MM-DD" -> nome do feriado.
const _cacheFeriados = {};
function feriadosDoAno(ano) {
  if (_cacheFeriados[ano]) return _cacheFeriados[ano];
  const mapa = {};

  FERIADOS_FIXOS.forEach(f => {
    mapa[chaveDia(new Date(ano, f.mes - 1, f.dia))] = f.nome;
  });

  const pascoa = domingoDePascoa(ano);
  FERIADOS_MOVEIS.forEach(f => {
    if (f.esfera === 'facultativo' && !CONTAR_PONTO_FACULTATIVO_COMO_FERIADO) return;
    const d = new Date(pascoa.getFullYear(), pascoa.getMonth(), pascoa.getDate() + f.offset);
    mapa[chaveDia(d)] = f.nome;
  });

  _cacheFeriados[ano] = mapa;
  return mapa;
}

// Nome do feriado naquele dia, ou null se for dia comum.
function nomeDoFeriado(data) {
  if (!data) return null;
  return feriadosDoAno(data.getFullYear())[chaveDia(data)] || null;
}

// Dia util = nao e sabado, nao e domingo e nao e feriado.
function ehDiaUtil(data) {
  if (!data) return false;
  const semana = data.getDay();
  if (semana === 0 || semana === 6) return false;
  return !nomeDoFeriado(data);
}

// De quantos em quantos dias uteis a conta mestre e cobrada.
const DIAS_UTEIS_COBRANCA = 5;

const MOTIVOS_ATENDIMENTO = [
  'INFORMAÇÕES PROCESSUAIS',
  'INFORMAÇÕES SOBRE GOLPES',
  'INFORMAÇÕES DIVERSAS',
  'AGENDAMENTO DE CONSULTA/ATENDIMENTO',
  'ENVIO DE DOCUMENTAÇÃO',
  'COBRANÇA DE PENDÊNCIAS',
  'OUTROS ATENDIMENTOS',
];

const STATUS_ATENDIMENTO = [
  { id: 'em_atendimento', label: 'Em Atendimento', colorVar: '--rubi', tintVar: '--rubi-tint', hex: '#8C3A32' },
  { id: 'finalizado', label: 'Finalizado', colorVar: '--ameixa', tintVar: '--ameixa-tint', hex: '#6B3557' },
];

const INPUT_CLASS = 'w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-body focus-brass transition-shadow bg-white';
const LABEL_CLASS = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5 font-body';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'kanban', label: 'Funil de Captação', icon: LayoutGrid },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'funil-atendimentos', label: 'Funil de Atendimentos', icon: LayoutGrid },
  { id: 'atendimentos', label: 'Registro de Atendimentos', icon: CalendarCheck },
];

// Abas visiveis somente para a conta mestre.
const TABS_MESTRE = [
  { id: 'processos', label: 'Processos Sensíveis', icon: Scale },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function formatCurrency(value) {
  const num = Number(value) || 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleDateString('pt-BR');
  } catch (err) {
    return '—';
  }
}

// Monta uma data LOCAL a partir de "AAAA-MM-DD" (sem passar pelo UTC) ou,
// quando vem com hora, converte o instante para o dia local.
function parseDataLocal(valor) {
  if (!valor) return null;
  const texto = String(valor).trim();
  const soData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  if (soData) {
    return new Date(Number(soData[1]), Number(soData[2]) - 1, Number(soData[3]));
  }
  const d = new Date(texto);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Aceita tanto "AAAA-MM-DD" quanto data com hora (ISO completo).
function formatDateOnly(dateStr) {
  if (!dateStr) return '—';
  const d = parseDataLocal(dateStr);
  if (!d) return '—';
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${d.getFullYear()}`;
}

function todayISODate() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function normalizarTimesheet(valor) {
  if (Array.isArray(valor)) return valor;
  if (typeof valor === 'string' && valor.trim()) {
    try {
      const parsed = JSON.parse(valor);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }
  return [];
}

function normalizarTempoAcumulado(valor) {
  if (valor && typeof valor === 'object' && !Array.isArray(valor)) return valor;
  if (typeof valor === 'string' && valor.trim()) {
    try {
      const parsed = JSON.parse(valor);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (err) {
      return {};
    }
  }
  return {};
}

function normalizarHistorico(valor) {
  if (Array.isArray(valor)) return valor;
  if (typeof valor === 'string' && valor.trim()) {
    try {
      const parsed = JSON.parse(valor);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }
  return [];
}

const MS_POR_HORA = 3600000;
const MS_POR_DIA = 86400000;

// Formata uma duracao em milissegundos como "2d 3,5h" (ou apenas "3,5h").
function formatDuracao(ms) {
  const total = Math.max(0, Number(ms) || 0);
  const dias = Math.floor(total / MS_POR_DIA);
  const horasRestantes = (total - dias * MS_POR_DIA) / MS_POR_HORA;
  const horasTexto = `${horasRestantes.toFixed(1).replace('.', ',')}h`;
  return dias > 0 ? `${dias}d ${horasTexto}` : horasTexto;
}

// Formata uma duracao em milissegundos como dias ("2,5 dias").
function formatDias(ms) {
  const dias = Math.max(0, Number(ms) || 0) / MS_POR_DIA;
  if (dias > 0 && dias < 0.05) return 'menos de 0,1 dia';
  const texto = dias.toFixed(1).replace('.', ',');
  return `${texto} ${dias === 1 ? 'dia' : 'dias'}`;
}

// Duracao de um lancamento, em ms. Prefere o valor bruto (duracaoMs) e so cai
// para o campo de horas em lancamentos antigos, evitando perda de precisao.
function duracaoLancamentoMs(entrada) {
  if (entrada && entrada.duracaoMs != null && !isNaN(Number(entrada.duracaoMs))) {
    return Math.max(0, Number(entrada.duracaoMs));
  }
  return Math.max(0, (Number(entrada && entrada.horas) || 0) * MS_POR_HORA);
}

// Tempo total lancado no timesheet de um registro, em ms.
function totalTempoTimesheet(registro) {
  return normalizarTimesheet(registro && registro.timesheet)
    .reduce((soma, e) => soma + duracaoLancamentoMs(e), 0);
}

function msParaHoras(ms) {
  return Math.max(0, Number(ms) || 0) / MS_POR_HORA;
}

// Tempo total (ja fechado + em curso) que um registro passou numa etapa/status.
function tempoNaFase(registro, faseId, campoFaseAtual, campoEntrada) {
  if (!registro) return 0;
  const acumulado = normalizarTempoAcumulado(registro.tempoAcumulado);
  let ms = Number(acumulado[faseId]) || 0;
  if (registro[campoFaseAtual] === faseId && registro[campoEntrada]) {
    const inicio = new Date(registro[campoEntrada]);
    if (!isNaN(inicio.getTime())) {
      ms += Math.max(0, Date.now() - inicio.getTime());
    }
  }
  return ms;
}

// Aplica a mascara de CPF conforme a pessoa digita: 000.000.000-00
function mascaraCPF(valor) {
  const d = String(valor || '').replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

// Aplica a mascara de CNPJ conforme a pessoa digita: 00.000.000/0000-00
function mascaraCNPJ(valor) {
  const d = String(valor || '').replace(/\D/g, '').slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

// Mascara certa para o tipo de pessoa escolhido.
function mascaraDocumento(valor, tipoPessoa) {
  return tipoPessoa === 'juridica' ? mascaraCNPJ(valor) : mascaraCPF(valor);
}

// Descobre o tipo de pessoa de um cadastro antigo pelo tamanho do documento.
function tipoPessoaDoDocumento(documento) {
  return String(documento || '').replace(/\D/g, '').length === 14 ? 'juridica' : 'fisica';
}

// Valida os digitos verificadores de um CNPJ.
function cnpjValido(valor) {
  const d = String(valor || '').replace(/\D/g, '');
  if (d.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(d)) return false;
  const calcula = (base) => {
    let peso = base.length - 7;
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * peso;
      peso -= 1;
      if (peso < 2) peso = 9;
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  if (calcula(d.slice(0, 12)) !== Number(d[12])) return false;
  if (calcula(d.slice(0, 13)) !== Number(d[13])) return false;
  return true;
}

// Valida os digitos verificadores de um CPF.
function cpfValido(valor) {
  const d = String(valor || '').replace(/\D/g, '');
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false; // 111.111.111-11 e afins
  for (let casa = 9; casa < 11; casa++) {
    let soma = 0;
    for (let i = 0; i < casa; i++) soma += Number(d[i]) * (casa + 1 - i);
    let dig = (soma * 10) % 11;
    if (dig === 10) dig = 0;
    if (dig !== Number(d[casa])) return false;
  }
  return true;
}

// Devolve a mensagem de erro do documento, ou '' se estiver tudo certo.
// Quando o tipo de pessoa e informado, a cobranca e especifica dele.
function validarDocumentoCliente(valor, tipoPessoa) {
  const d = String(valor || '').replace(/\D/g, '');
  const pj = tipoPessoa === 'juridica';

  if (!d) {
    return pj
      ? 'Informe o CNPJ do cliente. O campo é obrigatório.'
      : 'Informe o CPF do cliente. O campo é obrigatório.';
  }

  if (!tipoPessoa) {
    // Cadastro antigo, sem tipo definido: aceita CPF ou CNPJ validos.
    if (d.length === 14) return cnpjValido(d) ? '' : 'CNPJ inválido: confira os números digitados.';
    if (d.length !== 11) return 'Documento incompleto: informe 11 dígitos (CPF) ou 14 (CNPJ).';
    return cpfValido(d) ? '' : 'CPF inválido: confira os números digitados.';
  }

  if (pj) {
    if (d.length !== 14) return 'CNPJ incompleto: informe os 14 dígitos.';
    return cnpjValido(d) ? '' : 'CNPJ inválido: confira os números digitados.';
  }

  if (d.length !== 11) return 'CPF incompleto: informe os 11 dígitos.';
  return cpfValido(d) ? '' : 'CPF inválido: confira os números digitados.';
}

// Ja existe outro cliente com este CPF? Devolve o cliente encontrado ou null.
function clienteComMesmoDocumento(clientes, documento, ignorarId) {
  const d = String(documento || '').replace(/\D/g, '');
  if (!d) return null;
  return (clientes || []).find(
    c => c.id !== ignorarId && String(c.documento || '').replace(/\D/g, '') === d
  ) || null;
}

// Conta os dias uteis (segunda a sexta) decorridos desde uma data.
// Nao considera feriados: so os fins de semana.
function diasUteisDesde(dataISO, agoraMs) {
  const cursor = parseDataLocal(dataISO);
  if (!cursor) return 0;
  const fim = new Date(agoraMs || Date.now());
  const alvo = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate());
  let uteis = 0;
  while (cursor < alvo) {
    cursor.setDate(cursor.getDate() + 1);
    if (ehDiaUtil(cursor)) uteis += 1;
  }
  return uteis;
}

// Soma N dias uteis a uma data e devolve no formato AAAA-MM-DD.
function somarDiasUteis(dataISO, n) {
  const agora = new Date();
  const cursor = parseDataLocal(dataISO) || new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  let restam = n;
  while (restam > 0) {
    cursor.setDate(cursor.getDate() + 1);
    if (ehDiaUtil(cursor)) restam -= 1;
  }
  return chaveDia(cursor);
}

// A partir de quando contamos a proxima cobranca deste processo.
function baseDaCobranca(processo) {
  if (!processo) return null;
  return processo.dataUltimaCobranca || processo.dataCriacao || null;
}

function diasUteisSemCobranca(processo, agoraMs) {
  return diasUteisDesde(baseDaCobranca(processo), agoraMs);
}

// Processo em acompanhamento que ja passou dos 5 dias uteis sem cobranca.
function processoPrecisaCobranca(processo, agoraMs) {
  if (!processo || processo.status === 'finalizado') return false;
  return diasUteisSemCobranca(processo, agoraMs) >= DIAS_UTEIS_COBRANCA;
}

// Quais feriados cairam entre a ultima cobranca e a proxima — so para
// explicar na tela por que o prazo "esticou".
function feriadosNoPrazo(processo) {
  const inicio = parseDataLocal(baseDaCobranca(processo));
  const fim = parseDataLocal(dataProximaCobranca(processo));
  if (!inicio || !fim) return [];
  const achados = [];
  const cursor = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
  while (cursor < fim) {
    cursor.setDate(cursor.getDate() + 1);
    const semana = cursor.getDay();
    const nome = nomeDoFeriado(cursor);
    if (nome && semana !== 0 && semana !== 6) {
      achados.push({ data: chaveDia(cursor), nome });
    }
  }
  return achados;
}

function dataProximaCobranca(processo) {
  const base = baseDaCobranca(processo);
  return base ? somarDiasUteis(base, DIAS_UTEIS_COBRANCA) : '';
}

// Primeira linha preenchida de um texto longo, cortada para caber na tabela.
function primeiraLinha(texto, limite = 120) {
  const linha = String(texto || '')
    .split(/\r?\n/)
    .map(l => l.trim())
    .find(l => l.length > 0);
  if (!linha) return '—';
  return linha.length > limite ? `${linha.slice(0, limite - 1)}…` : linha;
}

// Normaliza texto para busca: sem acento, minusculo, sem espaco sobrando.
// "ANTÔNIO" e "antonio" passam a ser a mesma coisa.
function normalizarTexto(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Deixa so os digitos (para comparar CPF/telefone digitado de qualquer jeito).
function soDigitos(valor) {
  return String(valor || '').replace(/\D/g, '');
}

// Formata CPF/CNPJ para exibicao, se vier so com numeros.
function formatDocumento(valor) {
  const d = soDigitos(valor);
  if (d.length === 11) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
  if (d.length === 14) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
  return String(valor || '');
}

// O cliente casa com o termo buscado? Procura em nome, CPF e telefone.
function clienteCasaBusca(cliente, termo) {
  const t = normalizarTexto(termo);
  if (!t) return true;
  if (normalizarTexto(cliente.nome).includes(t)) return true;
  const digitos = soDigitos(termo);
  if (digitos.length >= 3) {
    if (soDigitos(cliente.documento).includes(digitos)) return true;
    if (soDigitos(cliente.telefone).includes(digitos)) return true;
  }
  if (normalizarTexto(cliente.email).includes(t)) return true;
  return false;
}

// Lista todos os responsaveis de um registro (principal + adicionais).
function listaResponsaveis(registro) {
  if (!registro) return [];
  const extras = Array.isArray(registro.responsaveisAdicionais) ? registro.responsaveisAdicionais : [];
  const todos = [registro.responsavel, ...extras].filter(Boolean);
  return Array.from(new Set(todos));
}

// O nome informado responde por este registro?
function ehResponsavel(registro, nome) {
  if (!nome) return false;
  return listaResponsaveis(registro).includes(nome);
}

function tempoEmNegociacao(lead) {
  return tempoNaFase(lead, 'negociacao', 'etapa', 'dataEntradaEtapa');
}

function tempoEmAtendimento(atendimento) {
  return tempoNaFase(atendimento, 'em_atendimento', 'status', 'dataEntradaStatus');
}

// Monta os campos atualizados de um registro ao mover de fase, fechando o
// tempo da fase anterior, gravando o historico e lancando as horas no timesheet.
function montarMovimentacao(registro, novaFase, config) {
  const { campoFaseAtual, campoEntrada, rotuloDe } = config;
  const agora = new Date();
  const faseAnterior = registro[campoFaseAtual];
  const entradaAnterior = registro[campoEntrada] ? new Date(registro[campoEntrada]) : null;
  const duracaoMs = entradaAnterior && !isNaN(entradaAnterior.getTime())
    ? Math.max(0, agora.getTime() - entradaAnterior.getTime())
    : 0;

  const acumulado = { ...normalizarTempoAcumulado(registro.tempoAcumulado) };
  if (faseAnterior && duracaoMs > 0) {
    acumulado[faseAnterior] = (Number(acumulado[faseAnterior]) || 0) + duracaoMs;
  }

  const historico = [
    ...normalizarHistorico(registro.historico),
    {
      id: generateId(),
      de: faseAnterior || null,
      para: novaFase,
      em: agora.toISOString(),
      duracaoMs,
    },
  ];

  let timesheet = normalizarTimesheet(registro.timesheet);
  if (duracaoMs > 0) {
    timesheet = [
      ...timesheet,
      {
        id: generateId(),
        data: agora.toISOString().slice(0, 10),
        horas: Number(msParaHoras(duracaoMs).toFixed(2)),
        descricao: `${rotuloDe(faseAnterior)} → ${rotuloDe(novaFase)}`,
        responsavel: registro.responsavel || '',
        auto: true,
        duracaoMs,
      },
    ];
  }

  return {
    [campoFaseAtual]: novaFase,
    [campoEntrada]: agora.toISOString(),
    tempoAcumulado: acumulado,
    historico,
    timesheet,
  };
}

function rotuloEtapa(id) {
  const e = getEtapa(id);
  return e ? e.label : (id || 'Início');
}

function rotuloStatus(id) {
  const s = getStatus(id);
  return s ? s.label : (id || 'Início');
}

// Converte uma data ISO (ou 'AAAA-MM-DD') para a chave de mês 'AAAA-MM'.
function chaveMes(dataStr) {
  if (!dataStr) return null;
  const texto = String(dataStr);
  const match = texto.match(/^(\d{4})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}`;
  const d = new Date(texto);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const NOMES_MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function formatMesLabel(chave) {
  if (!chave) return '—';
  const [ano, mes] = chave.split('-');
  const idx = Number(mes) - 1;
  if (idx < 0 || idx > 11) return chave;
  return `${NOMES_MESES[idx]}/${ano}`;
}

// Data de referência de um registro, conforme o tipo de lista.
function dataReferencia(registro, tipo) {
  if (tipo === 'captacao') return registro.dataCaptacao || registro.dataCriacao;
  return registro.dataAtendimento || registro.dataCriacao;
}

function getEtapa(id) {
  return ETAPAS.find(e => e.id === id);
}

function getTipo(id) {
  return TIPOS_ACAO.find(t => t.id === id);
}

function getStatus(id) {
  return STATUS_ATENDIMENTO.find(s => s.id === id);
}

// ---------------------------------------------------------------------------
// Small presentational components
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Permissões
// ---------------------------------------------------------------------------

const PermissoesContext = createContext({
  papel: 'mestre',
  responsavelNome: '',
  podeExcluir: true,
  podeGerirEquipe: true,
  podeTrocarResponsavel: true,
});

function usePermissoes() {
  return useContext(PermissoesContext);
}

function permissoesDoPerfil(perfil) {
  const mestre = !!perfil && perfil.papel === 'mestre';
  return {
    papel: mestre ? 'mestre' : 'colaborador',
    nome: perfil ? (perfil.nome || perfil.email || '') : '',
    responsavelNome: perfil ? (perfil.responsavelNome || '') : '',
    podeExcluir: mestre,
    podeGerirEquipe: mestre,
    podeTrocarResponsavel: mestre,
  };
}

function TelaLogin({ onEntrar, erro, carregando }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onEntrar(email.trim(), senha);
  }

  return (
    <div className="crm-root min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--ink-surface)' }}>
      <GlobalStyles />
      <div className="bg-white rounded-md w-full max-w-sm p-6 shadow-lg">
        <div className="text-center mb-6">
          <h1 className="font-display text-xl font-bold" style={{ color: 'var(--ink)' }}>CONTROLE DE LEADS E ATENDIMENTOS</h1>
          <p className="font-body text-xs text-slate-500 mt-1">Antonio Augusto Sousa Advogados Associados</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={LABEL_CLASS}>E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS} placeholder="seu@email.com" autoComplete="username" autoFocus />
          </div>
          <div>
            <label className={LABEL_CLASS}>Senha</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
              className={INPUT_CLASS} placeholder="Sua senha" autoComplete="current-password" />
          </div>
          {erro && <p className="font-body text-xs" style={{ color: 'var(--lacre)' }}>{erro}</p>}
          <button type="submit" disabled={carregando}
            className="btn-brass focus-brass w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold font-body transition-colors disabled:opacity-60">
            {carregando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="font-body text-xs text-slate-400 mt-4 text-center">
          Acesso restrito à equipe do escritório. As contas são criadas pelo administrador.
        </p>
      </div>
    </div>
  );
}

function ResponsaveisAdicionais({ principal, extras, responsaveis, onChange, bloqueado }) {
  const lista = Array.isArray(extras) ? extras : [];
  const disponiveis = responsaveis
    .map(r => r.nome)
    .filter(nome => nome !== principal && !lista.includes(nome));

  function adicionar(nome) {
    if (!nome) return;
    onChange([...lista, nome]);
  }

  function remover(nome) {
    onChange(lista.filter(n => n !== nome));
  }

  if (bloqueado && lista.length === 0) return null;

  return (
    <div className="mt-2">
      <p className="font-body text-xs text-slate-500 mb-1.5">Responsáveis adicionais</p>
      {lista.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {lista.map(nome => (
            <span key={nome}
              className="inline-flex items-center gap-1 text-xs font-semibold font-body px-2 py-1 rounded-sm"
              style={{ backgroundColor: 'var(--brass-tint)', color: 'var(--ink)' }}>
              {nome}
              {!bloqueado && (
                <button type="button" onClick={() => remover(nome)}
                  className="hover:opacity-60" title={`Remover ${nome}`}>
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      {!bloqueado && (
        disponiveis.length > 0 ? (
          <select
            value=""
            onChange={(e) => { adicionar(e.target.value); e.target.value = ''; }}
            className={INPUT_CLASS}
          >
            <option value="">+ Adicionar outro responsável...</option>
            {disponiveis.map(nome => <option key={nome} value={nome}>{nome}</option>)}
          </select>
        ) : (
          <p className="font-body text-xs text-slate-400">Todos os responsáveis já estão vinculados.</p>
        )
      )}
    </div>
  );
}

function CampoSenha({ value, onChange }) {
  const [visivel, setVisivel] = useState(false);
  return (
    <div className="relative">
      <input
        type={visivel ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_CLASS} pr-10`}
        placeholder="Senha gov.br"
        autoComplete="off"
      />
      <button
        type="button"
        onClick={() => setVisivel(v => !v)}
        className="absolute text-slate-400 hover:text-slate-600"
        style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}
        title={visivel ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {visivel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <div
      className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-md shadow-lg text-sm font-medium font-body flex items-center gap-2 text-white"
      style={{ backgroundColor: isError ? 'var(--lacre)' : 'var(--ink)' }}
    >
      {isError ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
      {toast.message}
    </div>
  );
}

function LedgerStat({ label, value, colorVar }) {
  return (
    <div className="bg-white rounded-md border border-slate-200 px-4 py-3">
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">{label}</p>
      <p className="font-ledger text-2xl font-semibold" style={{ color: colorVar ? `var(${colorVar})` : 'var(--ink)' }}>{value}</p>
      <div className="mt-2 rounded-full" style={{ height: '3px', backgroundColor: colorVar ? `var(${colorVar})` : 'var(--brass)', opacity: 0.4 }} />
    </div>
  );
}

function ChartCard({ title, children, empty, emptyText }) {
  return (
    <div className="bg-white rounded-md border border-slate-200 p-5">
      <h3 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--ink)' }}>{title}</h3>
      {empty ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-300">
          <Inbox className="w-8 h-8 mb-2" />
          <p className="font-body text-xs text-slate-400 text-center max-w-xs">{emptyText}</p>
        </div>
      ) : children}
    </div>
  );
}

function ColorTag({ label, colorVar, tintVar }) {
  if (!label) return <span className="text-slate-300 text-xs">—</span>;
  if (!colorVar) {
    return (
      <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-sm font-body bg-stone-100 text-stone-600 border-l-4 border-stone-400 whitespace-nowrap">
        {label}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-sm font-body whitespace-nowrap"
      style={{ backgroundColor: `var(${tintVar})`, color: `var(${colorVar})`, borderLeft: `3px solid var(${colorVar})` }}
    >
      {label}
    </span>
  );
}

function TipoTag({ tipoId, outraDescricao }) {
  const tipo = getTipo(tipoId);
  if (!tipo) return <span className="text-slate-300 text-xs">—</span>;
  const label = tipoId === 'outras' && outraDescricao ? `${tipo.label}: ${outraDescricao}` : tipo.label;
  return <ColorTag label={label} colorVar={tipo.colorVar} tintVar={tipo.tintVar} />;
}

function EtapaTag({ etapaId }) {
  const etapa = getEtapa(etapaId);
  if (!etapa) return <span className="text-slate-300 text-xs">—</span>;
  return <ColorTag label={etapa.label} colorVar={etapa.colorVar} tintVar={etapa.tintVar} />;
}

function StatusTag({ statusId }) {
  const status = getStatus(statusId);
  if (!status) return <span className="text-slate-300 text-xs">—</span>;
  return <ColorTag label={status.label} colorVar={status.colorVar} tintVar={status.tintVar} />;
}

function DeleteButton({ onConfirm, size }) {
  const { podeExcluir } = usePermissoes();
  const [confirming, setConfirming] = useState(false);
  if (!podeExcluir) return null;
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2 text-xs whitespace-nowrap font-body">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onConfirm(); }}
          className="font-semibold hover:underline"
          style={{ color: 'var(--lacre)' }}
        >
          Confirmar
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setConfirming(false); }}
          className="text-slate-400 hover:underline"
        >
          Cancelar
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
      className="text-slate-300 hover:text-red-500 transition-colors"
      title="Excluir"
    >
      <Trash2 className={iconSize} />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Lead Card (Kanban "ficha")
// ---------------------------------------------------------------------------

function LeadCard({ lead, onDragStart, onEdit, onDelete, onChangeEtapa }) {
  const etapa = getEtapa(lead.etapa);
  const etapaColorVar = etapa ? etapa.colorVar : '--azul';

  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(lead.id); }}
      onClick={onEdit}
      className="relative bg-white rounded-md shadow-sm border border-slate-200 p-3 cursor-pointer hover:shadow-md transition-shadow"
      style={{ borderTop: `3px solid var(${etapaColorVar})` }}
    >
      {lead.etapa === 'exito' && (
        <div
          className="absolute flex items-center justify-center"
          style={{ top: '-9px', right: '-9px', width: '24px', height: '24px', backgroundColor: 'var(--brass)', borderRadius: '9999px', border: '2px solid white', boxShadow: '0 1px 3px rgba(124,38,41,0.35)' }}
          title="Captação com êxito"
        >
          <CheckCircle2 style={{ width: '13px', height: '13px', color: 'var(--ink)' }} />
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-1.5 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-slate-300 mt-0.5 flex-shrink-0" />
          <h4 className="font-body font-semibold text-sm text-slate-900 leading-snug break-words">{lead.nome}</h4>
        </div>
        <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(); }} className="text-slate-300 hover:text-slate-600 flex-shrink-0">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {lead.tipoAcao && (
          <TipoTag tipoId={lead.tipoAcao} outraDescricao={lead.tipoAcaoOutraDescricao} />
        )}
        {tempoEmNegociacao(lead) > 0 && (
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold font-ledger px-2 py-0.5 rounded-sm"
            style={{ backgroundColor: 'var(--brass-tint)', color: 'var(--ink)' }}
            title={lead.etapa === 'negociacao'
              ? 'Tempo em negociação (contando agora)'
              : 'Tempo total que passou em negociação'}
          >
            <Clock className="w-3 h-3" /> {formatDuracao(tempoEmNegociacao(lead))}
            {lead.etapa === 'negociacao' ? ' •' : ''}
          </span>
        )}
      </div>

      <div className="mt-2 space-y-1 text-xs text-slate-500 font-body">
        {(lead.dataCaptacao || lead.dataCriacao) && (
          <div className="flex items-center gap-1.5 font-ledger">
            <CalendarCheck className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{lead.dataCaptacao ? formatDateOnly(lead.dataCaptacao) : formatDate(lead.dataCriacao)}</span>
          </div>
        )}
        {lead.cpf && (
          <div className="flex items-center gap-1.5 font-ledger" title="CPF do cliente">
            <FileText className="w-3 h-3 flex-shrink-0" /><span className="truncate">{formatDocumento(lead.cpf)}</span>
          </div>
        )}
        {lead.telefone && (
          <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 flex-shrink-0" /><span className="truncate">{lead.telefone}</span></div>
        )}
        {lead.responsavel && (
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{lead.responsavel}</span>
            {listaResponsaveis(lead).length > 1 && (
              <span className="font-ledger font-semibold flex-shrink-0" style={{ color: 'var(--ink)' }}
                title={listaResponsaveis(lead).join(', ')}>
                +{listaResponsaveis(lead).length - 1}
              </span>
            )}
          </div>
        )}
        {totalTempoTimesheet(lead) > 0 && (
          <div className="flex items-center gap-1.5 font-ledger"><FileText className="w-3 h-3 flex-shrink-0" /><span className="truncate">{formatDias(totalTempoTimesheet(lead))} no timesheet</span></div>
        )}
        {Number(lead.valorEstimado) > 0 && (
          <div className="flex items-center gap-1.5 font-ledger"><DollarSign className="w-3 h-3 flex-shrink-0" /><span className="truncate">{formatCurrency(lead.valorEstimado)}</span></div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
        <select
          value={lead.etapa}
          onChange={(e) => onChangeEtapa(lead.id, e.target.value)}
          className="text-xs border border-slate-200 rounded-sm py-1 px-1.5 bg-slate-50 text-slate-600 font-body focus-brass"
        >
          {ETAPAS.map(e2 => <option key={e2.id} value={e2.id}>{e2.label}</option>)}
        </select>
        <DeleteButton size="sm" onConfirm={() => onDelete(lead.id)} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Timesheet simplificado (reutilizado em Leads e Atendimentos)
// ---------------------------------------------------------------------------

function TimesheetAuto({ entradas }) {
  const lista = normalizarTimesheet(entradas)
    .slice()
    .sort((x, y) => (x.data || '').localeCompare(y.data || ''));
  const totalMs = lista.reduce((soma, e) => soma + duracaoLancamentoMs(e), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className={`${LABEL_CLASS} mb-0`}>Timesheet automático — tempo por etapa</label>
        {lista.length > 0 && (
          <span className="font-ledger text-xs font-semibold px-2 py-0.5 rounded-sm"
            style={{ backgroundColor: 'var(--brass-tint)', color: 'var(--ink)' }}>
            Total: {formatDias(totalMs)}
          </span>
        )}
      </div>

      {lista.length === 0 ? (
        <div className="border border-dashed border-slate-300 rounded-md px-3 py-4 text-center">
          <p className="font-body text-xs text-slate-400">
            Nenhum tempo registrado ainda. O sistema lança automaticamente a cada
            movimentação da tarefa entre as etapas.
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-md divide-y divide-slate-100 overflow-hidden">
          {lista.map(e => (
            <div key={e.id} className="flex items-center gap-2 px-2.5 py-2 text-xs font-body bg-white">
              <span className="font-ledger text-slate-500 whitespace-nowrap">{formatDateOnly(e.data)}</span>
              <span className="font-ledger font-semibold whitespace-nowrap" style={{ color: 'var(--ink)' }}>
                {formatDias(duracaoLancamentoMs(e))}
              </span>
              <span className="text-slate-600 flex-1 truncate" title={e.descricao}>{e.descricao || '—'}</span>
              {e.responsavel && <span className="text-slate-400 whitespace-nowrap hidden sm:inline">{e.responsavel}</span>}
            </div>
          ))}
        </div>
      )}
      <p className="font-body text-xs text-slate-400 mt-1">
        Registro gerado pelo sistema — não é editável manualmente.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Agenda semanal de atendimentos
// ---------------------------------------------------------------------------

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// Converte 'AAAA-MM-DD' para um Date local (evita o deslocamento de fuso do
// construtor com string ISO, que interpreta a data como UTC).
function dataLocalDeISO(dataStr) {
  if (!dataStr) return null;
  const partes = String(dataStr).slice(0, 10).split('-');
  if (partes.length !== 3) return null;
  const d = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  return isNaN(d.getTime()) ? null : d;
}

function isoDeDataLocal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Domingo da semana que contem a data informada.
function inicioDaSemana(data) {
  const d = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function AgendaSemanal({ leads, onAbrirLead }) {
  const [offsetSemana, setOffsetSemana] = useState(0);

  const { diasDaSemana, rotuloPeriodo } = useMemo(() => {
    const base = inicioDaSemana(new Date());
    base.setDate(base.getDate() + offsetSemana * 7);
    const dias = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      dias.push(d);
    }
    const fim = dias[6];
    const rotulo = `${String(base.getDate()).padStart(2, '0')}/${String(base.getMonth() + 1).padStart(2, '0')} a ${String(fim.getDate()).padStart(2, '0')}/${String(fim.getMonth() + 1).padStart(2, '0')}/${fim.getFullYear()}`;
    return { diasDaSemana: dias, rotuloPeriodo: rotulo };
  }, [offsetSemana]);

  const agendamentosPorDia = useMemo(() => {
    const mapa = {};
    diasDaSemana.forEach(d => { mapa[isoDeDataLocal(d)] = []; });
    leads.forEach(l => {
      if (!l.atendimentoAgendado || !l.dataAgendamento) return;
      const chave = String(l.dataAgendamento).slice(0, 10);
      if (mapa[chave]) mapa[chave].push(l);
    });
    Object.keys(mapa).forEach(k => {
      mapa[k].sort((a, b) => (a.horaAgendamento || '').localeCompare(b.horaAgendamento || ''));
    });
    return mapa;
  }, [leads, diasDaSemana]);

  const totalSemana = Object.values(agendamentosPorDia).reduce((s, lista) => s + lista.length, 0);
  const hojeISO = isoDeDataLocal(new Date());

  return (
    <div className="pt-2">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px bg-slate-200 flex-1" />
        <span className="font-body text-xs font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">
          Agenda semanal de atendimentos
        </span>
        <div className="h-px bg-slate-200 flex-1" />
      </div>

      <div className="bg-white rounded-md border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" style={{ color: 'var(--ink)' }} />
            <div>
              <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--ink)' }}>{rotuloPeriodo}</h3>
              <p className="font-body text-xs text-slate-500">
                {totalSemana === 0 ? 'Nenhum atendimento agendado nesta semana' : `${totalSemana} atendimento(s) agendado(s)`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => setOffsetSemana(o => o - 1)}
              className="btn-white focus-brass inline-flex items-center px-2 py-1.5 rounded-md transition-colors" title="Semana anterior">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setOffsetSemana(0)}
              className="btn-white focus-brass px-3 py-1.5 rounded-md text-xs font-semibold font-body transition-colors">
              Hoje
            </button>
            <button type="button" onClick={() => setOffsetSemana(o => o + 1)}
              className="btn-white focus-brass inline-flex items-center px-2 py-1.5 rounded-md transition-colors" title="Próxima semana">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
          {diasDaSemana.map((d, i) => {
            const chave = isoDeDataLocal(d);
            const itens = agendamentosPorDia[chave] || [];
            const ehHoje = chave === hojeISO;
            return (
              <div key={chave} className="rounded-md border p-2 flex flex-col"
                style={{
                  minHeight: '7rem',
                  borderColor: ehHoje ? 'var(--ink)' : '#e2e8f0',
                  backgroundColor: ehHoje ? 'var(--brass-tint)' : '#f8fafc',
                }}>
                <div className="mb-1.5">
                  <p className="font-body text-[10px] uppercase tracking-wide font-semibold text-slate-400">{DIAS_SEMANA[i].slice(0, 3)}</p>
                  <p className="font-ledger text-sm font-semibold" style={{ color: ehHoje ? 'var(--ink)' : '#475569' }}>
                    {String(d.getDate()).padStart(2, '0')}/{String(d.getMonth() + 1).padStart(2, '0')}
                  </p>
                </div>
                <div className="space-y-1 flex-1">
                  {itens.length === 0 ? (
                    <p className="font-body text-[10px] text-slate-300">—</p>
                  ) : itens.map(l => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => onAbrirLead(l)}
                      className="w-full text-left rounded-sm px-1.5 py-1 hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: 'white', border: '1px solid #e2e8f0' }}
                      title={`${l.nome} — ${l.horaAgendamento || 'sem horário'}`}
                    >
                      <p className="font-ledger text-[10px] font-semibold" style={{ color: 'var(--ink)' }}>{l.horaAgendamento || '--:--'}</p>
                      <p className="font-body text-[10px] text-slate-600 truncate">{l.nome}</p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Relatórios em PDF
// ---------------------------------------------------------------------------

function situacaoLead(etapaId) {
  if (etapaId === 'exito') return 'Qualificado';
  if (etapaId === 'nao_qualificado') return 'Não Qualificado';
  if (etapaId === 'desistencia') return 'Desistência do Cliente';
  if (etapaId === 'pendencias') return 'Com Pendências';
  const etapa = getEtapa(etapaId);
  return etapa ? etapa.label : '—';
}

// Origem do lead com o nome de quem indicou / do parceiro, quando houver.
function origemCompleta(lead) {
  const origem = (lead && lead.origem) || '';
  if (!origem) return '—';
  const detalhe = (lead && lead.origemDetalhe) || '';
  return detalhe ? `${origem}: ${detalhe}` : origem;
}

function tipoAcaoLabel(tipoId, outraDescricao) {
  const tipo = getTipo(tipoId);
  if (!tipo) return '—';
  return tipoId === 'outras' && outraDescricao ? `${tipo.label}: ${outraDescricao}` : tipo.label;
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function abrirRelatorioParaImpressao(titulo, subtitulo, colunas, linhas) {
  const dataGeracao = new Date().toLocaleString('pt-BR');
  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8" />
<title>${escapeHtml(titulo)}</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; margin: 0; }
  .cabecalho { border-bottom: 3px solid #7C2629; padding-bottom: 10px; margin-bottom: 6px; }
  .escritorio { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: #7C2629; font-weight: 700; }
  h1 { font-size: 19px; margin: 6px 0 2px; color: #7C2629; }
  .subtitulo { font-size: 11px; color: #555; margin: 0; }
  .meta { font-size: 10px; color: #777; margin: 10px 0 14px; display: flex; justify-content: space-between; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  thead { display: table-header-group; }
  th { background: #7C2629; color: #fff; text-align: left; padding: 7px 8px; font-size: 10px;
       text-transform: uppercase; letter-spacing: .04em; }
  td { padding: 6px 8px; border-bottom: 1px solid #e2e2e2; vertical-align: top; }
  tr { page-break-inside: avoid; }
  tbody tr:nth-child(even) { background: #faf6f6; }
  .vazio { padding: 24px; text-align: center; color: #888; font-size: 12px; border: 1px dashed #ccc; }
  .rodape { margin-top: 18px; font-size: 9px; color: #999; text-align: center;
            border-top: 1px solid #e2e2e2; padding-top: 8px; }
</style></head>
<body>
  <div class="cabecalho">
    <div class="escritorio">Antonio Augusto Sousa — Advogados Associados</div>
    <h1>${escapeHtml(titulo)}</h1>
    <p class="subtitulo">${escapeHtml(subtitulo)}</p>
  </div>
  <div class="meta">
    <span>Emitido em ${escapeHtml(dataGeracao)}</span>
    <span>${linhas.length} registro(s)</span>
  </div>
  ${linhas.length === 0
    ? '<div class="vazio">Nenhum registro encontrado com os filtros selecionados.</div>'
    : `<table><thead><tr>${colunas.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead>
       <tbody>${linhas.map(l => `<tr>${l.map(cel => `<td>${escapeHtml(cel)}</td>`).join('')}</tr>`).join('')}</tbody></table>`}
  <div class="rodape">Controle de Leads e Atendimentos — AASAA — documento gerado automaticamente</div>
</body></html>`;

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const limpar = () => {
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 1000);
  };

  iframe.onload = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (err) {
      console.error('Falha ao abrir a janela de impressão:', err);
    }
    limpar();
  };

  iframe.srcdoc = html;
}

function RelatoriosPDF({ leads, atendimentos, responsaveis }) {
  const [tipoRelatorio, setTipoRelatorio] = useState('captacao');
  const [filtroResponsavel, setFiltroResponsavel] = useState('todos');
  const [filtroTipoAcao, setFiltroTipoAcao] = useState('todos');
  const [filtroSituacao, setFiltroSituacao] = useState('todos');
  const [filtroMes, setFiltroMes] = useState('todos');

  const mesesDisponiveis = useMemo(() => {
    const base = tipoRelatorio === 'captacao' ? leads : atendimentos;
    const chaves = new Set();
    base.forEach(r => {
      const k = chaveMes(dataReferencia(r, tipoRelatorio));
      if (k) chaves.add(k);
    });
    return Array.from(chaves).sort().reverse();
  }, [tipoRelatorio, leads, atendimentos]);

  const registrosFiltrados = useMemo(() => {
    const base = tipoRelatorio === 'captacao' ? leads : atendimentos;
    return base.filter(r => {
      if (filtroResponsavel !== 'todos' && !ehResponsavel(r, filtroResponsavel)) return false;
      if (filtroTipoAcao !== 'todos' && r.tipoAcao !== filtroTipoAcao) return false;
      if (tipoRelatorio === 'captacao' && filtroSituacao !== 'todos' && r.etapa !== filtroSituacao) return false;
      if (filtroMes !== 'todos' && chaveMes(dataReferencia(r, tipoRelatorio)) !== filtroMes) return false;
      return true;
    });
  }, [tipoRelatorio, leads, atendimentos, filtroResponsavel, filtroTipoAcao, filtroSituacao, filtroMes]);

  function descricaoFiltros() {
    const partes = [];
    partes.push(filtroResponsavel === 'todos' ? 'Todos os responsáveis' : `Responsável: ${filtroResponsavel}`);
    if (filtroTipoAcao !== 'todos') {
      const t = getTipo(filtroTipoAcao);
      partes.push(`Tipo de ação: ${t ? t.label : filtroTipoAcao}`);
    } else {
      partes.push('Todos os tipos de ação');
    }
    if (tipoRelatorio === 'captacao') {
      partes.push(filtroSituacao === 'todos' ? 'Todas as situações' : `Situação: ${situacaoLead(filtroSituacao)}`);
    }
    partes.push(filtroMes === 'todos' ? 'Todos os meses' : `Mês: ${formatMesLabel(filtroMes)}`);
    return partes.join(' · ');
  }

  function handleGerar() {
    const totalTempo = registrosFiltrados.reduce((s, r) => s + totalTempoTimesheet(r), 0);
    const resumoHoras = totalTempo > 0 ? ` — Tempo total registrado: ${formatDias(totalTempo)}` : '';

    if (tipoRelatorio === 'captacao') {
      const linhas = registrosFiltrados.map(l => [
        l.dataCaptacao ? formatDateOnly(l.dataCaptacao) : formatDate(l.dataCriacao),
        l.nome || '—',
        l.cpf ? formatDocumento(l.cpf) : '—',
        tipoAcaoLabel(l.tipoAcao, l.tipoAcaoOutraDescricao),
        origemCompleta(l),
        listaResponsaveis(l).join(', ') || '—',
        situacaoLead(l.etapa),
        primeiraLinha(l.observacoes),
        l.pendencias || '—',
        formatDias(totalTempoTimesheet(l)),
      ]);
      abrirRelatorioParaImpressao(
        'Relatório de Captações',
        descricaoFiltros() + resumoHoras,
        ['Data', 'Cliente', 'CPF', 'Tipo de Ação', 'Origem / Indicação', 'Responsáveis', 'Situação do Lead', 'Descrição', 'Pendências', 'Tempo'],
        linhas
      );
    } else {
      const linhas = registrosFiltrados.map(a => [
        formatDateOnly(a.dataAtendimento),
        a.nomeCliente || '—',
        a.cpf ? formatDocumento(a.cpf) : '—',
        tipoAcaoLabel(a.tipoAcao, a.tipoAcaoOutraDescricao),
        listaResponsaveis(a).join(', ') || '—',
        formatDias(totalTempoTimesheet(a)),
      ]);
      abrirRelatorioParaImpressao(
        'Relatório de Atendimentos',
        descricaoFiltros() + resumoHoras,
        ['Data', 'Cliente', 'CPF', 'Tipo de Ação', 'Responsáveis', 'Tempo'],
        linhas
      );
    }
  }

  const selectClass = 'w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-body focus-brass bg-white';

  return (
    <div className="pt-2">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px bg-slate-200 flex-1" />
        <span className="font-body text-xs font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">
          Relatórios em PDF
        </span>
        <div className="h-px bg-slate-200 flex-1" />
      </div>

      <div className="bg-white rounded-md border border-slate-200 p-5">
        <div className="flex items-start gap-2 mb-4">
          <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--ink)' }} />
          <div>
            <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--ink)' }}>Gerar relatório</h3>
            <p className="font-body text-xs text-slate-500">Escolha a lista, aplique os filtros e gere o PDF.</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {[
            { id: 'captacao', label: 'Lista de Captações' },
            { id: 'atendimentos', label: 'Lista de Atendimentos' },
          ].map(op => {
            const ativo = tipoRelatorio === op.id;
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => setTipoRelatorio(op.id)}
                className="px-3 py-1.5 rounded-md text-sm font-semibold font-body border transition-colors"
                style={ativo
                  ? { backgroundColor: 'var(--ink-surface)', borderColor: 'var(--ink-surface)', color: '#ffffff' }
                  : { backgroundColor: 'white', borderColor: '#cbd5e1', color: '#475569' }}
              >
                {op.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className={LABEL_CLASS}>Mês de referência</label>
            <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} className={selectClass}>
              <option value="todos">Todos os meses</option>
              {mesesDisponiveis.map(m => <option key={m} value={m}>{formatMesLabel(m)}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Responsável</label>
            <select value={filtroResponsavel} onChange={(e) => setFiltroResponsavel(e.target.value)} className={selectClass}>
              <option value="todos">Todos os responsáveis</option>
              {responsaveis.map(r => <option key={r.id} value={r.nome}>{r.nome}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Tipo de ação</label>
            <select value={filtroTipoAcao} onChange={(e) => setFiltroTipoAcao(e.target.value)} className={selectClass}>
              <option value="todos">Todos os tipos</option>
              {TIPOS_ACAO.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          {tipoRelatorio === 'captacao' && (
            <div>
              <label className={LABEL_CLASS}>Situação do lead</label>
              <select value={filtroSituacao} onChange={(e) => setFiltroSituacao(e.target.value)} className={selectClass}>
                <option value="todos">Todas as situações</option>
                {ETAPAS.map(e2 => <option key={e2.id} value={e2.id}>{situacaoLead(e2.id)}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
          <p className="font-body text-sm text-slate-500">
            <span className="font-ledger font-semibold" style={{ color: 'var(--ink)' }}>{registrosFiltrados.length}</span> registro(s) serão incluídos no relatório
            {registrosFiltrados.reduce((s, r) => s + totalTempoTimesheet(r), 0) > 0 && (
              <>
                {' · '}
                <span className="font-ledger font-semibold" style={{ color: 'var(--ink)' }}>
                  {formatDias(registrosFiltrados.reduce((s, r) => s + totalTempoTimesheet(r), 0))}
                </span> registrados
              </>
            )}.
          </p>
          <button
            type="button"
            onClick={handleGerar}
            className="btn-white focus-brass inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold font-body transition-colors"
          >
            <FileText className="w-4 h-4" /> Gerar PDF
          </button>
        </div>
        <p className="font-body text-xs text-slate-400 mt-2">
          Ao clicar, abre a janela de impressão do navegador — escolha "Salvar como PDF" no destino para baixar o arquivo.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

function DashboardView({ leads, responsaveis, atendimentos, onNovoLead, onAbrirLead }) {
  const total = leads.length;
  const emAndamento = leads.filter(l => l.etapa !== 'exito' && !ETAPAS_PERDIDAS.includes(l.etapa)).length;
  const convertidos = leads.filter(l => l.etapa === 'exito').length;
  const perdidos = leads.filter(l => ETAPAS_PERDIDAS.includes(l.etapa)).length;
  const taxaConversao = total > 0 ? ((convertidos / total) * 100).toFixed(1) : '0.0';
  const valorPipeline = leads.filter(l => l.etapa !== 'exito' && !ETAPAS_PERDIDAS.includes(l.etapa)).reduce((sum, l) => sum + (Number(l.valorEstimado) || 0), 0);
  const valorConvertido = leads.filter(l => l.etapa === 'exito').reduce((sum, l) => sum + (Number(l.valorEstimado) || 0), 0);

  const dataPorEtapa = ETAPAS.map(e => ({
    name: e.label,
    quantidade: leads.filter(l => l.etapa === e.id).length,
    fill: e.hex,
  }));

  const dataPorTipo = TIPOS_ACAO.map(t => ({
    name: t.label,
    value: leads.filter(l => l.tipoAcao === t.id).length,
    fill: t.hex,
  })).filter(d => d.value > 0);

  const dataPorResponsavel = responsaveis.map(r => ({
    name: r.nome,
    Leads: leads.filter(l => l.responsavel === r.nome).length,
    Convertidos: leads.filter(l => l.responsavel === r.nome && l.etapa === 'exito').length,
  }));

  const totalAtend = atendimentos.length;
  const emAtend = atendimentos.filter(a => a.status === 'em_atendimento').length;
  const finalizadosAtend = atendimentos.filter(a => a.status === 'finalizado').length;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Painel de Acompanhamento</h2>
        <p className="font-body text-sm text-slate-500">Visão geral do funil de captação do escritório.</p>
      </div>

      <AgendaSemanal leads={leads} onAbrirLead={onAbrirLead} />

      {total === 0 ? (
        <div className="bg-white rounded-md border border-slate-200 p-12 flex flex-col items-center text-center">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <Inbox className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-display font-semibold text-slate-700 mb-1 text-lg">Nenhum lead cadastrado ainda</h3>
          <p className="font-body text-sm text-slate-500 mb-4 max-w-sm">Assim que você adicionar o primeiro lead, este painel mostrará o desempenho do funil automaticamente.</p>
          <button onClick={onNovoLead} className="btn-white focus-brass inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold font-body transition-colors">
            <Plus className="w-4 h-4" /> Cadastrar primeiro lead
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <LedgerStat label="Total de Leads" value={total} />
            <LedgerStat label="Em Andamento" value={emAndamento} colorVar="--brass" />
            <LedgerStat label="Captações com Êxito" value={convertidos} colorVar="--verde" />
            <LedgerStat label="Perdidos" value={perdidos} colorVar="--carvao" />
            <LedgerStat label="Taxa de Conversão" value={`${taxaConversao}%`} colorVar="--azul" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LedgerStat label="Valor em Captação (pipeline)" value={formatCurrency(valorPipeline)} colorVar="--azul" />
            <LedgerStat label="Valor Convertido" value={formatCurrency(valorConvertido)} colorVar="--verde" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Funil de Captação por Etapa">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={dataPorEtapa} layout="vertical" margin={{ top: 5, right: 24, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="quantidade" radius={[0, 3, 3, 0]}>
                    {dataPorEtapa.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Leads por Tipo de Ação" empty={dataPorTipo.length === 0} emptyText="Cadastre o tipo de ação dos leads para ver esta análise.">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={dataPorTipo} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2}>
                    {dataPorTipo.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Desempenho por Responsável" empty={responsaveis.length === 0} emptyText="Cadastre os responsáveis da equipe para acompanhar a produtividade de cada um.">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dataPorResponsavel} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Leads" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Convertidos" fill="#551B2C" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}

      <div className="pt-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="font-body text-xs font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">
            Atendimentos Consultivos — à parte da captação
          </span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        {totalAtend === 0 ? (
          <div className="bg-white rounded-md border border-slate-200 p-8 flex flex-col items-center text-center">
            <Inbox className="w-6 h-6 text-slate-300 mb-2" />
            <p className="font-body text-sm text-slate-400">Nenhum atendimento consultivo registrado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <LedgerStat label="Total de Atendimentos" value={totalAtend} />
            <LedgerStat label="Em Atendimento" value={emAtend} colorVar="--rubi" />
            <LedgerStat label="Finalizados" value={finalizadosAtend} colorVar="--ameixa" />
          </div>
        )}
      </div>

      <RelatoriosPDF leads={leads} atendimentos={atendimentos} responsaveis={responsaveis} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kanban
// ---------------------------------------------------------------------------

// Lista os meses (AAAA-MM) presentes nos registros, do mais recente ao mais antigo.
function mesesDosRegistros(registros, tipo) {
  const chaves = new Set();
  registros.forEach(r => {
    const k = chaveMes(dataReferencia(r, tipo));
    if (k) chaves.add(k);
  });
  return Array.from(chaves).sort().reverse();
}

function FiltroMes({ valor, onChange, meses }) {
  return (
    <select value={valor} onChange={(e) => onChange(e.target.value)}
      className="text-sm border border-slate-300 rounded-md px-3 py-1.5 bg-white font-body focus-brass">
      <option value="todos">Todos os meses</option>
      {meses.map(m => <option key={m} value={m}>{formatMesLabel(m)}</option>)}
    </select>
  );
}

function KanbanView({ leads, responsaveis, filterResponsavel, setFilterResponsavel, filterTipoAcao, setFilterTipoAcao, filterMes, setFilterMes, mesesDisponiveis, onMoveLead, onEdit, onDelete, onAddToStage }) {
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverEtapa, setDragOverEtapa] = useState(null);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Funil de Captação</h2>
        <p className="font-body text-sm text-slate-500">Arraste as fichas entre as etapas ou use o seletor rápido em cada card.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-1.5 text-slate-400 text-sm font-body">
          <Filter className="w-4 h-4" /> Filtros:
        </div>
        <select value={filterResponsavel} onChange={(e) => setFilterResponsavel(e.target.value)} className="text-sm border border-slate-300 rounded-md px-3 py-1.5 bg-white font-body focus-brass">
          <option value="todos">Todos os responsáveis</option>
          {responsaveis.map(r => <option key={r.id} value={r.nome}>{r.nome}</option>)}
        </select>
        <select value={filterTipoAcao} onChange={(e) => setFilterTipoAcao(e.target.value)} className="text-sm border border-slate-300 rounded-md px-3 py-1.5 bg-white font-body focus-brass">
          <option value="todos">Todos os tipos de ação</option>
          {TIPOS_ACAO.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <FiltroMes valor={filterMes} onChange={setFilterMes} meses={mesesDisponiveis} />
      </div>

      <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-3 kanban-scroll">
        {ETAPAS.map(etapa => {
          const columnLeads = leads.filter(l => l.etapa === etapa.id);
          const isOver = dragOverEtapa === etapa.id;
          return (
            <div
              key={etapa.id}
              onDragOver={(e) => { e.preventDefault(); setDragOverEtapa(etapa.id); }}
              onDragLeave={() => setDragOverEtapa(prev => (prev === etapa.id ? null : prev))}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedId) onMoveLead(draggedId, etapa.id);
                setDraggedId(null);
                setDragOverEtapa(null);
              }}
              className={`w-80 flex-shrink-0 rounded-md border flex flex-col bg-slate-50 ${isOver ? 'border-slate-400' : 'border-slate-200'}`}
              style={{ height: '100%' }}
            >
              <div className="px-3 py-2.5 flex items-center justify-between border-b border-slate-200 bg-white rounded-t-md">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-block rounded-full flex-shrink-0" style={{ width: '9px', height: '9px', backgroundColor: `var(${etapa.colorVar})` }} />
                  <h3 className="font-display font-semibold text-sm truncate" style={{ color: 'var(--ink)' }}>{etapa.label}</h3>
                </div>
                <span className="font-ledger text-xs font-semibold px-2 py-0.5 rounded-sm text-white flex-shrink-0" style={{ backgroundColor: `var(${etapa.colorVar})` }}>
                  {columnLeads.length}
                </span>
              </div>
              <div className="px-3 pb-3 pt-3 space-y-3 flex-1 overflow-y-auto">
                {columnLeads.length === 0 && (
                  <p className="font-body text-xs text-slate-400 text-center py-4">Arraste um lead para cá ou adicione um novo abaixo.</p>
                )}
                {columnLeads.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onDragStart={setDraggedId}
                    onEdit={() => onEdit(lead)}
                    onDelete={onDelete}
                    onChangeEtapa={onMoveLead}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => onAddToStage(etapa.id)}
                  className="w-full border-2 border-dashed border-slate-300 hover:border-slate-400 text-slate-400 hover:text-slate-600 rounded-md py-2 text-xs font-semibold font-body flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar lead
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Clientes (table + management)
// ---------------------------------------------------------------------------

function ClientesView({ clientes, leads, atendimentos, searchTerm, setSearchTerm, onEdit, onDelete, onNovo }) {
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Clientes</h2>
        <p className="font-body text-sm text-slate-500">Cadastro de clientes do escritório, vinculável a leads e atendimentos.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute pointer-events-none" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, telefone, e-mail ou documento..."
            className="pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm w-72 font-body focus-brass bg-white"
          />
        </div>
        <button onClick={onNovo} className="btn-white focus-brass inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold font-body transition-colors">
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>

      {clientes.length === 0 ? (
        <div className="bg-white rounded-md border border-slate-200 p-12 flex flex-col items-center text-center">
          <Inbox className="w-8 h-8 text-slate-300 mb-3" />
          <p className="font-body text-sm text-slate-500">Nenhum cliente encontrado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wide">
                <th className="text-left font-semibold px-4 py-3">Nome</th>
                <th className="text-left font-semibold px-4 py-3">Contato</th>
                <th className="text-left font-semibold px-4 py-3">Documento</th>
                <th className="text-left font-semibold px-4 py-3">Leads</th>
                <th className="text-left font-semibold px-4 py-3">Atendimentos</th>
                <th className="text-right font-semibold px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(cliente => {
                const leadCount = leads.filter(l => l.clienteId === cliente.id).length;
                const atendCount = atendimentos.filter(a => a.clienteId === cliente.id).length;
                return (
                  <tr key={cliente.id} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => onEdit(cliente)}>
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{cliente.nome}</td>
                    <td className="px-4 py-3 text-slate-500">
                      <div className="flex flex-col gap-0.5">
                        {cliente.telefone && <span className="flex items-center gap-1 whitespace-nowrap"><Phone className="w-3 h-3" />{cliente.telefone}</span>}
                        {cliente.email && <span className="flex items-center gap-1 whitespace-nowrap"><Mail className="w-3 h-3" />{cliente.email}</span>}
                        {!cliente.telefone && !cliente.email && '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap font-ledger">
                      {cliente.documento ? formatDocumento(cliente.documento) : '—'}
                      {cliente.documento && (
                        <span className="ml-1.5 font-body text-[10px] uppercase tracking-wide text-slate-400">
                          {tipoPessoaDoDocumento(cliente.documento) === 'juridica' ? 'PJ' : 'PF'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap font-ledger">{leadCount}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap font-ledger">{atendCount}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => onEdit(cliente)} className="text-slate-400 hover:text-slate-700"><Pencil className="w-4 h-4" /></button>
                        <DeleteButton onConfirm={() => onDelete(cliente.id)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cliente Picker (reutilizado no cadastro de Lead e de Atendimento)
// ---------------------------------------------------------------------------

function ClientePicker({ clientes, value, onSelect, onCreateNew }) {
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [busca, setBusca] = useState('');
  const [listaAberta, setListaAberta] = useState(false);

  // Busca por nome, CPF, telefone ou e-mail, ignorando acento e pontuacao.
  const resultados = useMemo(() => {
    const termo = busca.trim();
    if (!termo) return [];
    return clientes.filter(c => clienteCasaBusca(c, termo)).slice(0, 40);
  }, [clientes, busca]);

  const vinculado = useMemo(
    () => (value ? clientes.find(c => c.id === value) || null : null),
    [clientes, value]
  );

  function escolher(cliente) {
    onSelect(cliente.id, cliente);
    setBusca('');
    setListaAberta(false);
  }

  async function handleSaveNovoCliente(formData) {
    const cliente = await onCreateNew(formData);
    if (cliente) {
      onSelect(cliente.id, cliente);
      setBusca('');
      setListaAberta(false);
      setShowNovoModal(false);
    }
  }

  const mostrarLista = listaAberta && busca.trim().length > 0;

  return (
    <div>
      <label className={LABEL_CLASS}>Cliente vinculado</label>

      {/* Cliente ja vinculado: fica sempre visivel, independente da busca */}
      {vinculado ? (
        <div
          className="flex items-center justify-between gap-2 px-3 py-2 rounded-md mb-2"
          style={{ backgroundColor: 'var(--brass-tint)', border: '1px solid var(--brass)' }}
        >
          <div className="min-w-0">
            <p className="font-body font-semibold text-sm truncate" style={{ color: 'var(--ink)' }}>
              {vinculado.nome}
            </p>
            <p className="font-ledger text-xs text-slate-600 truncate">
              {vinculado.documento ? `CPF ${formatDocumento(vinculado.documento)}` : 'Sem CPF cadastrado'}
              {vinculado.telefone ? ` · ${vinculado.telefone}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelect('')}
            className="text-xs font-semibold font-body px-2 py-1 rounded-sm hover:bg-white flex-shrink-0"
            style={{ color: 'var(--ink)' }}
            title="Desvincular este cliente"
          >
            Desvincular
          </button>
        </div>
      ) : (
        <p className="font-body text-xs text-slate-400 mb-2">
          Nenhum cliente vinculado (lead avulso).
        </p>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute pointer-events-none" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
          <input
            type="text"
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setListaAberta(true); }}
            onFocus={() => setListaAberta(true)}
            onKeyDown={(e) => {
              // Enter dentro da busca NAO salva o formulario: seleciona o primeiro resultado.
              if (e.key === 'Enter') {
                e.preventDefault();
                if (resultados.length > 0) escolher(resultados[0]);
              }
              if (e.key === 'Escape') { setBusca(''); setListaAberta(false); }
            }}
            placeholder="Buscar cliente por nome, CPF ou telefone..."
            className={`${INPUT_CLASS} pl-9`}
            autoComplete="off"
          />

          {mostrarLista && (
            <div
              className="absolute left-0 right-0 bg-white border border-slate-300 rounded-md shadow-lg overflow-y-auto"
              style={{ top: 'calc(100% + 4px)', maxHeight: '15rem', zIndex: 60 }}
            >
              {resultados.length === 0 ? (
                <div className="px-3 py-3">
                  <p className="font-body text-xs text-slate-500">
                    Nenhum cliente encontrado para "{busca.trim()}".
                  </p>
                  <button
                    type="button"
                    onClick={() => { setListaAberta(false); setShowNovoModal(true); }}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold font-body"
                    style={{ color: 'var(--ink)' }}
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Cadastrar "{busca.trim()}" como novo cliente
                  </button>
                </div>
              ) : (
                resultados.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => escolher(c)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                  >
                    <p className="font-body font-semibold text-sm text-slate-800 truncate">{c.nome}</p>
                    <p className="font-ledger text-xs text-slate-500 truncate">
                      {c.documento ? `CPF ${formatDocumento(c.documento)}` : 'sem CPF'}
                      {c.telefone ? ` · ${c.telefone}` : ''}
                    </p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button type="button" onClick={() => setShowNovoModal(true)} className="flex items-center gap-1 border border-slate-300 hover:bg-slate-50 text-slate-600 px-3 rounded-md text-sm whitespace-nowrap font-body">
          <UserPlus className="w-4 h-4" /> Novo
        </button>
      </div>

      <p className="font-body text-xs text-slate-400 mt-1">
        Digite parte do nome, do CPF ou do telefone e clique no cliente na lista. Ao vincular, os campos abaixo são preenchidos a partir do cadastro (e continuam editáveis).
      </p>

      {showNovoModal && (
        <ClienteFormModal
          cliente={null}
          clientes={clientes}
          nomeSugerido={busca.trim()}
          onSave={handleSaveNovoCliente}
          onClose={() => setShowNovoModal(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cliente Form Modal (cadastro avulso, pela aba Clientes)
// ---------------------------------------------------------------------------

function buildInitialClienteForm(cliente, nomeSugerido) {
  const tipoPessoa = cliente
    ? (cliente.tipoPessoa || tipoPessoaDoDocumento(cliente.documento))
    : 'fisica';
  return {
    nome: cliente ? cliente.nome || '' : (nomeSugerido || ''),
    tipoPessoa,
    telefone: cliente ? cliente.telefone || '' : '',
    email: cliente ? cliente.email || '' : '',
    documento: cliente ? mascaraDocumento(cliente.documento, tipoPessoa) : '',
    senhaGovBr: cliente ? cliente.senhaGovBr || '' : '',
    observacoes: cliente ? cliente.observacoes || '' : '',
  };
}

function ClienteFormModal({ cliente, clientes, nomeSugerido, onSave, onClose }) {
  const [form, setForm] = useState(() => buildInitialClienteForm(cliente, nomeSugerido));
  const [erroNome, setErroNome] = useState('');
  const [erroDocumento, setErroDocumento] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    let falhou = false;

    if (!form.nome.trim()) {
      setErroNome('Informe o nome do cliente.');
      falhou = true;
    }

    // CPF/CNPJ obrigatorio e valido, conforme o tipo de pessoa escolhido
    const msg = validarDocumentoCliente(form.documento, form.tipoPessoa);
    if (msg) {
      setErroDocumento(msg);
      falhou = true;
    } else {
      // Nao permite vincular cliente novo com CPF ja cadastrado
      const duplicado = clienteComMesmoDocumento(clientes, form.documento, cliente ? cliente.id : null);
      if (duplicado) {
        const rotulo = form.tipoPessoa === 'juridica' ? 'CNPJ' : 'CPF';
        setErroDocumento(
          `Este ${rotulo} já está cadastrado para "${duplicado.nome}". Busque e vincule esse cliente em vez de cadastrar outro.`
        );
        falhou = true;
      }
    }

    if (falhou) return;
    onSave(form);
  }

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-md w-full max-w-lg overflow-y-auto"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="font-display font-bold text-xl" style={{ color: 'var(--ink)' }}>{cliente ? 'Editar Cliente' : 'Novo Cliente'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={LABEL_CLASS}>Nome completo *</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => { setForm({ ...form, nome: e.target.value }); if (erroNome) setErroNome(''); }}
              className={INPUT_CLASS}
              placeholder="Nome do cliente"
            />
            {erroNome && <p className="text-xs mt-1" style={{ color: 'var(--lacre)' }}>{erroNome}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Telefone</label>
              <input type="text" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} className={INPUT_CLASS} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label className={LABEL_CLASS}>E-mail</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={INPUT_CLASS} placeholder="email@exemplo.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>
                {form.tipoPessoa === 'juridica' ? 'CNPJ *' : 'CPF *'}
              </label>

              {/* Pessoa fisica ou juridica: troca a mascara e a validacao */}
              <div className="flex gap-2 mb-2">
                {[
                  { id: 'fisica', label: 'Pessoa Física', doc: 'CPF' },
                  { id: 'juridica', label: 'Pessoa Jurídica', doc: 'CNPJ' },
                ].map(op => {
                  const ativo = form.tipoPessoa === op.id;
                  return (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => {
                        setForm(f => ({
                          ...f,
                          tipoPessoa: op.id,
                          // reaplica a mascara do novo tipo sobre os digitos ja escritos
                          documento: mascaraDocumento(f.documento, op.id),
                        }));
                        setErroDocumento('');
                      }}
                      className="flex-1 px-3 py-2 rounded-md text-xs font-semibold font-body border transition-colors"
                      style={ativo
                        ? { backgroundColor: 'var(--brass-tint)', borderColor: 'var(--brass)', color: 'var(--ink)' }
                        : { backgroundColor: 'transparent', borderColor: 'rgb(203,213,225)', color: 'rgb(100,116,139)' }}
                    >
                      {op.label}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                inputMode="numeric"
                value={form.documento}
                onChange={(e) => {
                  setForm(f => ({ ...f, documento: mascaraDocumento(e.target.value, f.tipoPessoa) }));
                  if (erroDocumento) setErroDocumento('');
                }}
                className={INPUT_CLASS}
                placeholder={form.tipoPessoa === 'juridica' ? '00.000.000/0000-00' : '000.000.000-00'}
                maxLength={form.tipoPessoa === 'juridica' ? 18 : 14}
              />
              {erroDocumento
                ? <p className="text-xs mt-1 font-body" style={{ color: 'var(--lacre)' }}>{erroDocumento}</p>
                : <p className="text-xs mt-1 font-body text-slate-400">
                    Obrigatório. Digite só os números — a pontuação é colocada sozinha. Dois clientes não podem ter o mesmo {form.tipoPessoa === 'juridica' ? 'CNPJ' : 'CPF'}.
                  </p>}
            </div>
            <div>
              <label className={LABEL_CLASS}>Senha gov.br</label>
              <CampoSenha value={form.senhaGovBr} onChange={(v) => setForm({ ...form, senhaGovBr: v })} />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS}>Observações</label>
            <textarea
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              rows={3}
              className={INPUT_CLASS}
              placeholder="Anotações gerais sobre o cliente..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-2">
            <button type="button" onClick={onClose} className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md text-sm font-medium font-body transition-colors">Cancelar</button>
            <button type="submit" className="btn-white focus-brass px-4 py-2 rounded-md text-sm font-semibold font-body transition-colors">{cliente ? 'Salvar alterações' : 'Adicionar cliente'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ---------------------------------------------------------------------------
// Atendimento Card (Funil de Atendimentos)
// ---------------------------------------------------------------------------

function AtendimentoCard({ atendimento, onDragStart, onEdit, onDelete, onChangeStatus }) {
  const status = getStatus(atendimento.status);
  const statusColorVar = status ? status.colorVar : '--azul';

  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(atendimento.id); }}
      onClick={onEdit}
      className="relative bg-white rounded-md shadow-sm border border-slate-200 p-3 cursor-pointer hover:shadow-md transition-shadow"
      style={{ borderTop: `3px solid var(${statusColorVar})` }}
    >
      {atendimento.status === 'finalizado' && (
        <div
          className="absolute flex items-center justify-center"
          style={{ top: '-9px', right: '-9px', width: '24px', height: '24px', backgroundColor: 'var(--brass)', borderRadius: '9999px', border: '2px solid white', boxShadow: '0 1px 3px rgba(124,38,41,0.35)' }}
          title="Atendimento finalizado"
        >
          <CheckCircle2 style={{ width: '13px', height: '13px', color: 'var(--ink)' }} />
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-1.5 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-slate-300 mt-0.5 flex-shrink-0" />
          <h4 className="font-body font-semibold text-sm text-slate-900 leading-snug break-words">{atendimento.nomeCliente}</h4>
        </div>
        <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(); }} className="text-slate-300 hover:text-slate-600 flex-shrink-0">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>

      {atendimento.motivoAtendimento && (
        <p className="mt-1.5 text-xs text-slate-500 font-body break-words">{atendimento.motivoAtendimento}</p>
      )}
      {atendimento.aguardandoAnalise && (
        <span
          className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold font-body px-2 py-0.5 rounded-sm"
          style={{ backgroundColor: 'var(--lacre-tint)', color: 'var(--lacre)' }}
          title="Aguardando análise de advogado"
        >
          <Scale className="w-3 h-3" /> Aguardando advogado
        </span>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {atendimento.tipoAcao && (
          <TipoTag tipoId={atendimento.tipoAcao} outraDescricao={atendimento.tipoAcaoOutraDescricao} />
        )}
        {tempoEmAtendimento(atendimento) > 0 && (
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold font-ledger px-2 py-0.5 rounded-sm"
            style={{ backgroundColor: 'var(--rubi-tint)', color: 'var(--rubi)' }}
            title={atendimento.status === 'em_atendimento'
              ? 'Tempo em atendimento (contando agora)'
              : 'Tempo total que passou em atendimento'}
          >
            <Clock className="w-3 h-3" /> {formatDuracao(tempoEmAtendimento(atendimento))}
            {atendimento.status === 'em_atendimento' ? ' •' : ''}
          </span>
        )}
        {totalTempoTimesheet(atendimento) > 0 && (
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold font-ledger px-2 py-0.5 rounded-sm"
            style={{ backgroundColor: 'var(--brass-tint)', color: 'var(--ink)' }}
            title="Horas lançadas no timesheet"
          >
            <FileText className="w-3 h-3" /> {formatDias(totalTempoTimesheet(atendimento))}
          </span>
        )}
      </div>

      <div className="mt-2 space-y-1 text-xs text-slate-500 font-body">
        {atendimento.dataAtendimento && (
          <div className="flex items-center gap-1.5 font-ledger"><CalendarCheck className="w-3 h-3 flex-shrink-0" /><span className="truncate">{formatDateOnly(atendimento.dataAtendimento)}</span></div>
        )}
        {atendimento.cpf && (
          <div className="flex items-center gap-1.5 font-ledger" title="CPF do cliente">
            <FileText className="w-3 h-3 flex-shrink-0" /><span className="truncate">{formatDocumento(atendimento.cpf)}</span>
          </div>
        )}
        {atendimento.responsavel && (
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{atendimento.responsavel}</span>
            {listaResponsaveis(atendimento).length > 1 && (
              <span className="font-ledger font-semibold flex-shrink-0" style={{ color: 'var(--ink)' }}
                title={listaResponsaveis(atendimento).join(', ')}>
                +{listaResponsaveis(atendimento).length - 1}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
        <select
          value={atendimento.status}
          onChange={(e) => onChangeStatus(atendimento.id, e.target.value)}
          className="text-xs border border-slate-200 rounded-sm py-1 px-1.5 bg-slate-50 text-slate-600 font-body focus-brass"
        >
          {STATUS_ATENDIMENTO.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <DeleteButton size="sm" onConfirm={() => onDelete(atendimento.id)} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Funil de Atendimentos (kanban próprio, separado do funil de captação)
// ---------------------------------------------------------------------------

function AtendimentoKanbanView({ atendimentos, responsaveis, filterResponsavel, setFilterResponsavel, filterTipoAcao, setFilterTipoAcao, filterMes, setFilterMes, mesesDisponiveis, onMoveStatus, onEdit, onDelete, onAddToStatus }) {
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Funil de Atendimentos</h2>
        <p className="font-body text-sm text-slate-500">Acompanhamento próprio dos atendimentos consultivos — não entra nas métricas de captação.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-1.5 text-slate-400 text-sm font-body">
          <Filter className="w-4 h-4" /> Filtros:
        </div>
        <select value={filterResponsavel} onChange={(e) => setFilterResponsavel(e.target.value)} className="text-sm border border-slate-300 rounded-md px-3 py-1.5 bg-white font-body focus-brass">
          <option value="todos">Todos os responsáveis</option>
          {responsaveis.map(r => <option key={r.id} value={r.nome}>{r.nome}</option>)}
        </select>
        <select value={filterTipoAcao} onChange={(e) => setFilterTipoAcao(e.target.value)} className="text-sm border border-slate-300 rounded-md px-3 py-1.5 bg-white font-body focus-brass">
          <option value="todos">Todos os tipos de ação</option>
          {TIPOS_ACAO.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <FiltroMes valor={filterMes} onChange={setFilterMes} meses={mesesDisponiveis} />
      </div>

      <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-3 kanban-scroll">
        {STATUS_ATENDIMENTO.map(status => {
          const columnItems = atendimentos.filter(a => a.status === status.id);
          const isOver = dragOverStatus === status.id;
          return (
            <div
              key={status.id}
              onDragOver={(e) => { e.preventDefault(); setDragOverStatus(status.id); }}
              onDragLeave={() => setDragOverStatus(prev => (prev === status.id ? null : prev))}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedId) onMoveStatus(draggedId, status.id);
                setDraggedId(null);
                setDragOverStatus(null);
              }}
              className={`w-80 flex-shrink-0 rounded-md border flex flex-col bg-slate-50 ${isOver ? 'border-slate-400' : 'border-slate-200'}`}
              style={{ height: '100%' }}
            >
              <div className="px-3 py-2.5 flex items-center justify-between border-b border-slate-200 bg-white rounded-t-md">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-block rounded-full flex-shrink-0" style={{ width: '9px', height: '9px', backgroundColor: `var(${status.colorVar})` }} />
                  <h3 className="font-display font-semibold text-sm truncate" style={{ color: 'var(--ink)' }}>{status.label}</h3>
                </div>
                <span className="font-ledger text-xs font-semibold px-2 py-0.5 rounded-sm text-white flex-shrink-0" style={{ backgroundColor: `var(${status.colorVar})` }}>
                  {columnItems.length}
                </span>
              </div>
              <div className="px-3 pb-3 pt-3 space-y-3 flex-1 overflow-y-auto">
                {columnItems.length === 0 && (
                  <p className="font-body text-xs text-slate-400 text-center py-4">Arraste um atendimento para cá ou adicione um novo abaixo.</p>
                )}
                {columnItems.map(at => (
                  <AtendimentoCard
                    key={at.id}
                    atendimento={at}
                    onDragStart={setDraggedId}
                    onEdit={() => onEdit(at)}
                    onDelete={onDelete}
                    onChangeStatus={onMoveStatus}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => onAddToStatus(status.id)}
                  className="w-full border-2 border-dashed border-slate-300 hover:border-slate-400 text-slate-400 hover:text-slate-600 rounded-md py-2 text-xs font-semibold font-body flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar atendimento
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Processos Sensiveis / Prioritarios
// ---------------------------------------------------------------------------

function buildInitialProcessoForm(processo, defaultStatus) {
  return {
    clienteId: processo ? processo.clienteId || '' : '',
    nomeCliente: processo ? processo.nomeCliente || '' : '',
    numeroProcesso: processo ? processo.numeroProcesso || '' : '',
    tribunal: processo ? processo.tribunal || '' : '',
    vara: processo ? processo.vara || '' : '',
    advogadoResponsavel: processo ? processo.advogadoResponsavel || '' : '',
    descricao: processo ? processo.descricao || '' : '',
    status: processo ? processo.status || 'acompanhamento' : (defaultStatus || 'acompanhamento'),
  };
}

function ProcessoCard({ processo, onDragStart, onEdit, onDelete }) {
  const status = STATUS_PROCESSO.find(s => s.id === processo.status) || STATUS_PROCESSO[0];
  const atrasado = processoPrecisaCobranca(processo);
  const dias = diasUteisSemCobranca(processo);

  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(processo.id); }}
      onClick={onEdit}
      className="relative bg-white rounded-md shadow-sm border border-slate-200 p-3 cursor-pointer hover:shadow-md transition-shadow"
      style={{ borderTop: `3px solid var(${status.colorVar})` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-1.5 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-slate-300 mt-0.5 flex-shrink-0" />
          <h4 className="font-body font-semibold text-sm text-slate-900 leading-snug break-words">
            {processo.nomeCliente || 'Cliente não informado'}
          </h4>
        </div>
        <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(); }} className="text-slate-300 hover:text-slate-600 flex-shrink-0">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>

      {processo.numeroProcesso && (
        <p className="mt-1.5 font-ledger text-xs text-slate-600 break-all">{processo.numeroProcesso}</p>
      )}

      <div className="mt-2 space-y-1 text-xs text-slate-500 font-body">
        {(processo.tribunal || processo.vara) && (
          <div className="flex items-center gap-1.5">
            <Landmark className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{[processo.tribunal, processo.vara].filter(Boolean).join(' · ')}</span>
          </div>
        )}
        {processo.advogadoResponsavel && (
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{processo.advogadoResponsavel}</span>
          </div>
        )}
        {processo.descricao && (
          <p className="text-slate-500 break-words line-clamp-2">{primeiraLinha(processo.descricao, 90)}</p>
        )}
      </div>

      {processo.status !== 'finalizado' && (
        <span
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold font-ledger px-2 py-0.5 rounded-sm"
          style={atrasado
            ? { backgroundColor: 'var(--lacre-tint)', color: 'var(--lacre)' }
            : { backgroundColor: 'var(--brass-tint)', color: 'var(--ink)' }}
          title={atrasado
            ? `Cobrança vencida há ${dias - DIAS_UTEIS_COBRANCA} dia(s) útil(eis)`
            : `Próxima cobrança em ${formatDateOnly(dataProximaCobranca(processo))}`}
        >
          <Clock className="w-3 h-3" />
          {atrasado ? `Cobrar — ${dias} dias úteis` : `${dias}/${DIAS_UTEIS_COBRANCA} dias úteis`}
        </span>
      )}

      <div className="mt-2 flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
        <DeleteButton onConfirm={() => onDelete(processo.id)} />
      </div>
    </div>
  );
}

function ProcessosSensiveisView({ processos, clientes, onMoveStatus, onEdit, onDelete, onAddToStatus }) {
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [busca, setBusca] = useState('');

  const visiveis = useMemo(() => {
    const t = normalizarTexto(busca);
    if (!t) return processos;
    return processos.filter(p =>
      normalizarTexto(p.nomeCliente).includes(t) ||
      normalizarTexto(p.advogadoResponsavel).includes(t) ||
      normalizarTexto(p.tribunal).includes(t) ||
      normalizarTexto(p.vara).includes(t) ||
      soDigitos(p.numeroProcesso).includes(soDigitos(busca)) ||
      normalizarTexto(p.numeroProcesso).includes(t)
    );
  }, [processos, busca]);

  const pendentes = useMemo(() => processos.filter(p => processoPrecisaCobranca(p)).length, [processos]);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>
          Acompanhamento de Processos Sensíveis / Prioritários
        </h2>
        <p className="font-body text-sm text-slate-500">
          Tela restrita à conta mestre. A cada {DIAS_UTEIS_COBRANCA} dias úteis sem cobrança, o processo aparece na aba de Notificações.
          A contagem pula fins de semana e feriados nacionais, do Maranhão e de São Luís.
        </p>
      </div>

      {pendentes > 0 && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-md"
          style={{ backgroundColor: 'var(--lacre-tint)', border: '1px solid var(--lacre)' }}>
          <Bell className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--lacre)' }} />
          <p className="font-body text-sm" style={{ color: 'var(--lacre)' }}>
            {pendentes === 1
              ? '1 processo está há 5 dias úteis ou mais sem cobrança.'
              : `${pendentes} processos estão há 5 dias úteis ou mais sem cobrança.`}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute pointer-events-none" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cliente, processo, tribunal, vara ou advogado..."
            className="pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm w-96 max-w-full font-body focus-brass bg-white"
          />
        </div>
        <button onClick={() => onAddToStatus('acompanhamento')} className="btn-white focus-brass inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold font-body transition-colors">
          <Plus className="w-4 h-4" /> Novo Processo
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-3 kanban-scroll">
        {STATUS_PROCESSO.map(status => {
          const columnItems = visiveis.filter(p => (p.status || 'acompanhamento') === status.id);
          const isOver = dragOverStatus === status.id;
          return (
            <div
              key={status.id}
              onDragOver={(e) => { e.preventDefault(); setDragOverStatus(status.id); }}
              onDragLeave={() => setDragOverStatus(prev => (prev === status.id ? null : prev))}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedId) onMoveStatus(draggedId, status.id);
                setDraggedId(null);
                setDragOverStatus(null);
              }}
              className={`w-96 flex-shrink-0 rounded-md border flex flex-col bg-slate-50 ${isOver ? 'border-slate-400' : 'border-slate-200'}`}
              style={{ height: '100%' }}
            >
              <div className="px-3 py-2.5 flex items-center justify-between border-b border-slate-200 bg-white rounded-t-md">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-block rounded-full flex-shrink-0" style={{ width: '9px', height: '9px', backgroundColor: `var(${status.colorVar})` }} />
                  <h3 className="font-display font-semibold text-sm truncate" style={{ color: 'var(--ink)' }}>{status.label}</h3>
                </div>
                <span className="font-ledger text-xs font-semibold px-2 py-0.5 rounded-sm text-white flex-shrink-0" style={{ backgroundColor: `var(${status.colorVar})` }}>
                  {columnItems.length}
                </span>
              </div>
              <div className="px-3 pb-3 pt-3 space-y-3 flex-1 overflow-y-auto">
                {columnItems.length === 0 && (
                  <p className="font-body text-xs text-slate-400 text-center py-4">
                    {busca ? 'Nenhum processo encontrado com essa busca.' : 'Arraste um processo para cá ou adicione um novo abaixo.'}
                  </p>
                )}
                {columnItems.map(p => (
                  <ProcessoCard
                    key={p.id}
                    processo={p}
                    onDragStart={setDraggedId}
                    onEdit={() => onEdit(p)}
                    onDelete={onDelete}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => onAddToStatus(status.id)}
                  className="w-full border-2 border-dashed border-slate-300 hover:border-slate-400 text-slate-400 hover:text-slate-600 rounded-md py-2 text-xs font-semibold font-body flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar processo
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProcessoFormModal({ processo, defaultStatus, clientes, onSave, onClose, onAddCliente }) {
  const [form, setForm] = useState(() => buildInitialProcessoForm(processo, defaultStatus));
  const [erroCliente, setErroCliente] = useState('');

  function handleSelectCliente(clienteId, clienteObj) {
    if (!clienteId) {
      setForm(f => ({ ...f, clienteId: '', nomeCliente: '' }));
      return;
    }
    const cliente = clienteObj || clientes.find(c => c.id === clienteId);
    if (cliente) {
      setForm(f => ({ ...f, clienteId, nomeCliente: cliente.nome || f.nomeCliente }));
      setErroCliente('');
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.clienteId) {
      setErroCliente('Vincule o processo a um cliente cadastrado.');
      return;
    }
    onSave(form);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-md w-full max-w-3xl overflow-y-auto"
        style={{ maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="font-display font-bold text-xl" style={{ color: 'var(--ink)' }}>
            {processo ? 'Editar Processo Sensível' : 'Novo Processo Sensível'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <ClientePicker clientes={clientes} value={form.clienteId} onSelect={handleSelectCliente} onCreateNew={onAddCliente} />
          {erroCliente && <p className="text-xs font-body" style={{ color: 'var(--lacre)' }}>{erroCliente}</p>}

          <div>
            <label className={LABEL_CLASS}>Número do processo</label>
            <input
              type="text"
              value={form.numeroProcesso}
              onChange={(e) => setForm({ ...form, numeroProcesso: e.target.value })}
              className={INPUT_CLASS}
              placeholder="0000000-00.0000.0.00.0000"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Tribunal</label>
              <input
                type="text"
                value={form.tribunal}
                onChange={(e) => setForm({ ...form, tribunal: e.target.value })}
                className={INPUT_CLASS}
                placeholder="Ex: TJGO, TRF1, TRT-18"
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Vara</label>
              <input
                type="text"
                value={form.vara}
                onChange={(e) => setForm({ ...form, vara: e.target.value })}
                className={INPUT_CLASS}
                placeholder="Ex: 2ª Vara Federal de Goiânia"
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Advogado responsável</label>
            <input
              type="text"
              value={form.advogadoResponsavel}
              onChange={(e) => setForm({ ...form, advogadoResponsavel: e.target.value })}
              className={INPUT_CLASS}
              placeholder="Nome do advogado que responde pelo processo"
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Descrição</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              rows={6}
              className={INPUT_CLASS}
              style={{ minHeight: '8rem', resize: 'vertical' }}
              placeholder="Por que este processo é sensível/prioritário, o que precisa ser acompanhado, prazos..."
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Situação</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={INPUT_CLASS}
            >
              {STATUS_PROCESSO.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {processo && (
            <div className="border border-slate-200 rounded-md p-3">
              <p className="font-body text-xs text-slate-500">
                {processo.dataUltimaCobranca
                  ? `Última cobrança registrada em ${formatDateOnly(processo.dataUltimaCobranca)}.`
                  : 'Nenhuma cobrança registrada ainda — a contagem começou no cadastro.'}
                {processo.status !== 'finalizado' && ` Próxima cobrança: ${formatDateOnly(dataProximaCobranca(processo))}.`}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-brass focus-brass px-4 py-2 rounded-md text-sm font-semibold font-body">
              {processo ? 'Salvar alterações' : 'Cadastrar processo'}
            </button>
            <button type="button" onClick={onClose} className="btn-white focus-brass px-4 py-2 rounded-md text-sm font-semibold font-body">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NotificacoesView({ processos, onRegistrarCobranca, onAbrirProcesso }) {
  const agora = Date.now();
  const emAcompanhamento = processos.filter(p => (p.status || 'acompanhamento') !== 'finalizado');
  const vencidos = emAcompanhamento
    .filter(p => processoPrecisaCobranca(p, agora))
    .sort((a, b) => diasUteisSemCobranca(b, agora) - diasUteisSemCobranca(a, agora));
  const emDia = emAcompanhamento
    .filter(p => !processoPrecisaCobranca(p, agora))
    .sort((a, b) => diasUteisSemCobranca(b, agora) - diasUteisSemCobranca(a, agora));

  function Linha({ p, vencido }) {
    const dias = diasUteisSemCobranca(p, agora);
    return (
      <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-body font-semibold text-sm text-slate-900">{p.nomeCliente || 'Cliente não informado'}</h4>
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold font-ledger px-2 py-0.5 rounded-sm"
              style={vencido
                ? { backgroundColor: 'var(--lacre-tint)', color: 'var(--lacre)' }
                : { backgroundColor: 'var(--brass-tint)', color: 'var(--ink)' }}
            >
              <Clock className="w-3 h-3" /> {dias} {dias === 1 ? 'dia útil' : 'dias úteis'}
            </span>
          </div>
          {p.numeroProcesso && <p className="font-ledger text-xs text-slate-600 mt-1 break-all">{p.numeroProcesso}</p>}
          <p className="font-body text-xs text-slate-500 mt-1">
            {[p.tribunal, p.vara, p.advogadoResponsavel].filter(Boolean).join(' · ') || '—'}
          </p>
          <p className="font-body text-xs text-slate-400 mt-1">
            {p.dataUltimaCobranca
              ? `Última cobrança: ${formatDateOnly(p.dataUltimaCobranca)}`
              : `Cadastrado em ${formatDateOnly(p.dataCriacao)} — sem cobrança registrada`}
            {` · próxima: ${formatDateOnly(dataProximaCobranca(p))}`}
            {feriadosNoPrazo(p).length > 0 && (
              <span title={feriadosNoPrazo(p).map(f => `${formatDateOnly(f.data)} — ${f.nome}`).join('\n')}>
                {` · ${feriadosNoPrazo(p).length} feriado(s) no período`}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => onAbrirProcesso(p)}
            className="btn-white focus-brass px-3 py-1.5 rounded-md text-xs font-semibold font-body"
          >
            Abrir
          </button>
          <button
            type="button"
            onClick={() => onRegistrarCobranca(p.id)}
            className="btn-brass focus-brass px-3 py-1.5 rounded-md text-xs font-semibold font-body"
            title="Zera a contagem e começa de novo a partir de hoje"
          >
            Registrar cobrança
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Notificações</h2>
        <p className="font-body text-sm text-slate-500">
          Cobranças dos processos sensíveis. Um processo entra aqui quando completa {DIAS_UTEIS_COBRANCA} dias úteis sem cobrança registrada —
          sem contar fins de semana nem feriados nacionais, do Maranhão e de São Luís.
        </p>
      </div>

      <div className="mb-6">
        <h3 className="font-display font-semibold text-sm mb-2" style={{ color: 'var(--lacre)' }}>
          Para cobrar agora ({vencidos.length})
        </h3>
        {vencidos.length === 0 ? (
          <div className="bg-white rounded-md border border-slate-200 p-8 flex flex-col items-center text-center">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mb-2" />
            <p className="font-body text-sm text-slate-500">Nenhuma cobrança vencida. Tudo em dia.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vencidos.map(p => <Linha key={p.id} p={p} vencido />)}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-display font-semibold text-sm mb-2 text-slate-500">
          Dentro do prazo ({emDia.length})
        </h3>
        {emDia.length === 0 ? (
          <p className="font-body text-xs text-slate-400">Nenhum processo em acompanhamento dentro do prazo.</p>
        ) : (
          <div className="space-y-3">
            {emDia.map(p => <Linha key={p.id} p={p} vencido={false} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Atendimentos Consultivos
// ---------------------------------------------------------------------------

function AtendimentosView({ atendimentos, searchTerm, setSearchTerm, filterResponsavel, setFilterResponsavel, filterTipoAcao, setFilterTipoAcao, filterStatus, setFilterStatus, responsaveis, onEdit, onDelete, onNovo }) {
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Registro de Atendimentos</h2>
        <p className="font-body text-sm text-slate-500">Lista completa dos atendimentos consultivos, independente da captação de leads.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute pointer-events-none" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome do cliente..."
              className="pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm w-64 font-body focus-brass bg-white"
            />
          </div>
          <select value={filterResponsavel} onChange={(e) => setFilterResponsavel(e.target.value)} className="text-sm border border-slate-300 rounded-md px-3 py-2 bg-white font-body focus-brass">
            <option value="todos">Todos os responsáveis</option>
            {responsaveis.map(r => <option key={r.id} value={r.nome}>{r.nome}</option>)}
          </select>
          <select value={filterTipoAcao} onChange={(e) => setFilterTipoAcao(e.target.value)} className="text-sm border border-slate-300 rounded-md px-3 py-2 bg-white font-body focus-brass">
            <option value="todos">Todos os tipos de ação</option>
            {TIPOS_ACAO.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border border-slate-300 rounded-md px-3 py-2 bg-white font-body focus-brass">
            <option value="todos">Todos os status</option>
            {STATUS_ATENDIMENTO.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            <option value="aguardando_analise">Aguardando análise de advogado</option>
          </select>
        </div>
        <button onClick={onNovo} className="btn-white focus-brass inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold font-body transition-colors">
          <Plus className="w-4 h-4" /> Novo Atendimento
        </button>
      </div>

      {atendimentos.length === 0 ? (
        <div className="bg-white rounded-md border border-slate-200 p-12 flex flex-col items-center text-center">
          <Inbox className="w-8 h-8 text-slate-300 mb-3" />
          <p className="font-body text-sm text-slate-500">Nenhum atendimento encontrado com esses filtros.</p>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-slate-200 tabela-scroll">
          <table className="w-full text-sm font-body" style={{ minWidth: '68rem' }}>
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wide">
                <th className="text-left font-semibold px-4 py-3 bg-slate-50">Cliente</th>
                <th className="text-left font-semibold px-4 py-3 bg-slate-50">Motivo</th>
                <th className="text-left font-semibold px-4 py-3 bg-slate-50">Data</th>
                <th className="text-left font-semibold px-4 py-3 bg-slate-50">Tipo de Ação</th>
                <th className="text-left font-semibold px-4 py-3 bg-slate-50">Status</th>
                <th className="text-left font-semibold px-4 py-3 bg-slate-50">Responsável</th>
                <th className="text-left font-semibold px-4 py-3 bg-slate-50">Tempo em Atendimento</th>
                <th className="text-left font-semibold px-4 py-3 bg-slate-50">Tempo Registrado</th>
                <th className="text-right font-semibold px-4 py-3 bg-slate-50">Ações</th>
              </tr>
            </thead>
            <tbody>
              {atendimentos.map(at => (
                <tr key={at.id} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => onEdit(at)}>
                  <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{at.nomeCliente}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                    {at.motivoAtendimento || '—'}
                    {at.aguardandoAnalise && (
                      <span
                        className="ml-1.5 inline-flex items-center gap-1 text-[10px] font-semibold font-body px-1.5 py-0.5 rounded-sm align-middle whitespace-nowrap"
                        style={{ backgroundColor: 'var(--lacre-tint)', color: 'var(--lacre)' }}
                        title="Aguardando análise de advogado"
                      >
                        <Scale className="w-3 h-3" /> advogado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap font-ledger">{formatDateOnly(at.dataAtendimento)}</td>
                  <td className="px-4 py-3"><TipoTag tipoId={at.tipoAcao} outraDescricao={at.tipoAcaoOutraDescricao} /></td>
                  <td className="px-4 py-3"><StatusTag statusId={at.status} /></td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{at.responsavel || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap font-ledger">
                    {tempoEmAtendimento(at) > 0 ? formatDuracao(tempoEmAtendimento(at)) : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap font-ledger">
                    {totalTempoTimesheet(at) > 0 ? formatDias(totalTempoTimesheet(at)) : '—'}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => onEdit(at)} className="text-slate-400 hover:text-slate-700"><Pencil className="w-4 h-4" /></button>
                      <DeleteButton onConfirm={() => onDelete(at.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lead Form Modal
// ---------------------------------------------------------------------------

function buildInitialForm(lead, defaultEtapa) {
  return {
    clienteId: lead ? lead.clienteId || '' : '',
    nome: lead ? lead.nome || '' : '',
    telefone: lead ? lead.telefone || '' : '',
    cpf: lead ? lead.cpf || '' : '',
    senhaGovBr: lead ? lead.senhaGovBr || '' : '',
    dataCaptacao: lead ? (lead.dataCaptacao || (lead.dataCriacao ? String(lead.dataCriacao).slice(0, 10) : todayISODate())) : todayISODate(),
    tipoAcao: lead ? lead.tipoAcao || '' : '',
    tipoAcaoOutraDescricao: lead ? lead.tipoAcaoOutraDescricao || '' : '',
    responsavel: lead ? lead.responsavel || '' : '',
    responsaveisAdicionais: lead && Array.isArray(lead.responsaveisAdicionais) ? lead.responsaveisAdicionais : [],
    origem: lead ? lead.origem || '' : '',
    origemDetalhe: lead ? lead.origemDetalhe || '' : '',
    valorEstimado: lead ? lead.valorEstimado || '' : '',
    observacoes: lead ? lead.observacoes || '' : '',
    etapa: lead ? lead.etapa || defaultEtapa || 'nova' : (defaultEtapa || 'nova'),
    pendencias: lead ? lead.pendencias || '' : '',
    atendimentoAgendado: lead ? !!lead.atendimentoAgendado : false,
    dataAgendamento: lead ? lead.dataAgendamento || '' : '',
    horaAgendamento: lead ? lead.horaAgendamento || '' : '',
    timesheet: lead ? normalizarTimesheet(lead.timesheet) : [],
  };
}

function LeadFormModal({ lead, defaultEtapa, responsaveis, clientes, onSave, onClose, onAddResponsavel, onAddCliente }) {
  const { podeTrocarResponsavel, responsavelNome } = usePermissoes();
  const [form, setForm] = useState(() => {
    const inicial = buildInitialForm(lead, defaultEtapa);
    // Colaborador só cria lead em seu próprio nome (o banco também exige isso).
    if (!podeTrocarResponsavel && !lead && responsavelNome) {
      inicial.responsavel = responsavelNome;
    }
    return inicial;
  });
  const [showNovoResp, setShowNovoResp] = useState(false);
  const [novoRespNome, setNovoRespNome] = useState('');
  const [erroNome, setErroNome] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome.trim()) {
      setErroNome('Informe o nome do cliente/lead.');
      return;
    }
    onSave({ ...form, valorEstimado: form.valorEstimado === '' ? 0 : Number(form.valorEstimado) });
  }

  function handleSelectCliente(clienteId, clienteObj) {
    if (!clienteId) {
      setForm(f => ({ ...f, clienteId: '' }));
      return;
    }
    const cliente = clienteObj || clientes.find(c => c.id === clienteId);
    if (cliente) {
      setForm(f => ({
        ...f,
        clienteId,
        nome: cliente.nome || f.nome,
        telefone: cliente.telefone || f.telefone,
        cpf: cliente.documento || f.cpf,
        senhaGovBr: cliente.senhaGovBr || f.senhaGovBr,
      }));
      if (erroNome) setErroNome('');
    }
  }

  async function handleAddNovoResp() {
    if (!novoRespNome.trim()) return;
    const nome = await onAddResponsavel(novoRespNome);
    if (nome) {
      setForm(f => ({ ...f, responsavel: nome }));
      setNovoRespNome('');
      setShowNovoResp(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-md w-full max-w-4xl overflow-y-auto"
        style={{ maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="font-display font-bold text-xl" style={{ color: 'var(--ink)' }}>{lead ? 'Editar Cliente / Lead' : 'Novo Lead'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <ClientePicker clientes={clientes} value={form.clienteId} onSelect={handleSelectCliente} onCreateNew={onAddCliente} />

          <div>
            <label className={LABEL_CLASS}>Nome completo *</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => { setForm({ ...form, nome: e.target.value }); if (erroNome) setErroNome(''); }}
              className={INPUT_CLASS}
              placeholder="Nome do cliente ou lead"
            />
            {erroNome && <p className="text-xs mt-1" style={{ color: 'var(--lacre)' }}>{erroNome}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={LABEL_CLASS}>Telefone</label>
              <input type="text" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} className={INPUT_CLASS} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label className={LABEL_CLASS}>CPF</label>
              <input type="text" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} className={INPUT_CLASS} placeholder="000.000.000-00" />
            </div>
            <div>
              <label className={LABEL_CLASS}>Senha gov.br</label>
              <CampoSenha value={form.senhaGovBr} onChange={(v) => setForm({ ...form, senhaGovBr: v })} />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Tipo de Ação</label>
            <div className="flex flex-wrap gap-2">
              {TIPOS_ACAO.map(t => {
                const active = form.tipoAcao === t.id;
                const activeStyle = t.colorVar
                  ? { backgroundColor: `var(${t.colorVar})`, borderColor: `var(${t.colorVar})`, color: 'white' }
                  : { backgroundColor: '#78716c', borderColor: '#78716c', color: 'white' };
                const inactiveStyle = { backgroundColor: 'white', borderColor: '#cbd5e1', color: '#475569' };
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm({ ...form, tipoAcao: t.id })}
                    className="px-3 py-1.5 rounded-md text-sm font-semibold font-body border transition-colors"
                    style={active ? activeStyle : inactiveStyle}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            {form.tipoAcao === 'outras' && (
              <input
                type="text"
                value={form.tipoAcaoOutraDescricao}
                onChange={(e) => setForm({ ...form, tipoAcaoOutraDescricao: e.target.value })}
                placeholder="Especifique o tipo de ação (opcional)"
                className={`${INPUT_CLASS} mt-2`}
              />
            )}
          </div>

          <div>
            <label className={LABEL_CLASS}>Responsável pela captação</label>
            {!podeTrocarResponsavel ? (
              <div>
                <input
                  type="text"
                  value={form.responsavel || responsavelNome || '—'}
                  readOnly
                  disabled
                  className={`${INPUT_CLASS} bg-slate-100 text-slate-500 cursor-not-allowed`}
                />
                <p className="font-body text-xs text-slate-400 mt-1">
                  Somente a conta mestre pode alterar o responsável.
                </p>
              </div>
            ) : !showNovoResp ? (
              <div className="flex gap-2">
                <select value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} className={INPUT_CLASS}>
                  <option value="">Selecione um responsável...</option>
                  {responsaveis.map(r => <option key={r.id} value={r.nome}>{r.nome}</option>)}
                </select>
                <button type="button" onClick={() => setShowNovoResp(true)} className="flex items-center gap-1 border border-slate-300 hover:bg-slate-50 text-slate-600 px-3 rounded-md text-sm whitespace-nowrap font-body">
                  <UserPlus className="w-4 h-4" /> Novo
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={novoRespNome}
                  onChange={(e) => setNovoRespNome(e.target.value)}
                  placeholder="Nome do novo responsável"
                  className={INPUT_CLASS}
                  autoFocus
                />
                <button type="button" onClick={handleAddNovoResp} className="btn-brass focus-brass px-3 rounded-md text-sm whitespace-nowrap font-semibold font-body">Adicionar</button>
                <button type="button" onClick={() => { setShowNovoResp(false); setNovoRespNome(''); }} className="text-slate-400 hover:text-slate-600 px-2 text-sm whitespace-nowrap font-body">Cancelar</button>
              </div>
            )}
            <ResponsaveisAdicionais
              principal={form.responsavel}
              extras={form.responsaveisAdicionais}
              responsaveis={responsaveis}
              onChange={(novos) => setForm(f => ({ ...f, responsaveisAdicionais: novos }))}
              bloqueado={false}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Data de captação</label>
              <input
                type="date"
                value={form.dataCaptacao}
                onChange={(e) => setForm({ ...form, dataCaptacao: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Origem do lead</label>
              <select
                value={form.origem}
                onChange={(e) => {
                  const novaOrigem = e.target.value;
                  setForm(f => ({
                    ...f,
                    origem: novaOrigem,
                    origemDetalhe: ORIGENS_COM_NOME.includes(novaOrigem) ? f.origemDetalhe : '',
                  }));
                }}
                className={INPUT_CLASS}
              >
                <option value="">Não informado</option>
                {ORIGENS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              {ORIGENS_COM_NOME.includes(form.origem) && (
                <input
                  type="text"
                  value={form.origemDetalhe}
                  onChange={(e) => setForm({ ...form, origemDetalhe: e.target.value })}
                  placeholder={form.origem === 'Parceiro' ? 'Nome do parceiro' : 'Nome de quem indicou'}
                  className={`${INPUT_CLASS} mt-2`}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Valor estimado</label>
              <div className="relative">
                <span className="absolute text-slate-400 text-sm" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}>R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.valorEstimado}
                  onChange={(e) => setForm({ ...form, valorEstimado: e.target.value })}
                  className={`${INPUT_CLASS} pl-9`}
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          {form.etapa === 'pendencias' && (
            <div className="border rounded-md p-3" style={{ borderColor: 'var(--lacre)', backgroundColor: 'var(--lacre-tint)' }}>
              <label className={LABEL_CLASS} style={{ color: 'var(--lacre)' }}>Pendências do lead</label>
              <textarea
                value={form.pendencias}
                onChange={(e) => setForm({ ...form, pendencias: e.target.value })}
                rows={4}
                className={INPUT_CLASS}
                style={{ minHeight: '6rem', resize: 'vertical' }}
                placeholder="Descreva o que está pendente (documentos, retorno do cliente, assinatura...)"
              />
              <p className="font-body text-xs text-slate-500 mt-1">
                Este campo aparece porque o lead está em "Com Pendências" e sai nos relatórios.
              </p>
            </div>
          )}

          <div className="border border-slate-200 rounded-md p-3" style={{ backgroundColor: form.atendimentoAgendado ? 'var(--azul-tint)' : 'transparent' }}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.atendimentoAgendado}
                onChange={(e) => {
                  const marcado = e.target.checked;
                  setForm(f => ({
                    ...f,
                    atendimentoAgendado: marcado,
                    dataAgendamento: marcado ? (f.dataAgendamento || todayISODate()) : '',
                    horaAgendamento: marcado ? (f.horaAgendamento || '09:00') : '',
                  }));
                }}
                className="w-4 h-4"
                style={{ accentColor: 'var(--ink)' }}
              />
              <span className="font-body text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                Atendimento agendado
              </span>
            </label>
            {form.atendimentoAgendado && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className={LABEL_CLASS}>Data do atendimento</label>
                  <input type="date" value={form.dataAgendamento} onChange={(e) => setForm({ ...form, dataAgendamento: e.target.value })} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Horário</label>
                  <input type="time" value={form.horaAgendamento} onChange={(e) => setForm({ ...form, horaAgendamento: e.target.value })} className={INPUT_CLASS} />
                </div>
              </div>
            )}
            <p className="font-body text-xs text-slate-400 mt-2">
              Agendamentos marcados aparecem na agenda semanal do Dashboard.
            </p>
          </div>

          <TimesheetAuto entradas={form.timesheet} />

          {lead && (
            <div>
              <label className={LABEL_CLASS}>Etapa no funil</label>
              <select value={form.etapa} onChange={(e) => setForm({ ...form, etapa: e.target.value })} className={INPUT_CLASS}>
                {ETAPAS.map(e2 => <option key={e2.id} value={e2.id}>{e2.label}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className={LABEL_CLASS}>Observações</label>
            <textarea
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              rows={10}
              className={INPUT_CLASS}
              style={{ minHeight: '12rem', resize: 'vertical' }}
              placeholder="Anotações sobre o atendimento, negociação, pendências..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-2">
            <button type="button" onClick={onClose} className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md text-sm font-medium font-body transition-colors">Cancelar</button>
            <button type="submit" className="btn-white focus-brass px-4 py-2 rounded-md text-sm font-semibold font-body transition-colors">{lead ? 'Salvar alterações' : 'Adicionar lead'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Atendimento Form Modal
// ---------------------------------------------------------------------------

function buildInitialAtendimentoForm(atendimento, defaultStatus) {
  return {
    clienteId: atendimento ? atendimento.clienteId || '' : '',
    nomeCliente: atendimento ? atendimento.nomeCliente || '' : '',
    cpf: atendimento ? atendimento.cpf || '' : '',
    dataAtendimento: atendimento ? atendimento.dataAtendimento || todayISODate() : todayISODate(),
    motivoAtendimento: atendimento ? atendimento.motivoAtendimento || '' : '',
    aguardandoAnalise: atendimento ? !!atendimento.aguardandoAnalise : false,
    tipoAcao: atendimento ? atendimento.tipoAcao || '' : '',
    tipoAcaoOutraDescricao: atendimento ? atendimento.tipoAcaoOutraDescricao || '' : '',
    responsavel: atendimento ? atendimento.responsavel || '' : '',
    responsaveisAdicionais: atendimento && Array.isArray(atendimento.responsaveisAdicionais) ? atendimento.responsaveisAdicionais : [],
    status: atendimento ? atendimento.status || 'em_atendimento' : (defaultStatus || 'em_atendimento'),
    devolutiva: atendimento ? atendimento.devolutiva || '' : '',
    timesheet: atendimento ? normalizarTimesheet(atendimento.timesheet) : [],
  };
}

function AtendimentoFormModal({ atendimento, defaultStatus, responsaveis, clientes, onSave, onClose, onAddResponsavel, onAddCliente }) {
  const [form, setForm] = useState(() => buildInitialAtendimentoForm(atendimento, defaultStatus));
  const [showNovoResp, setShowNovoResp] = useState(false);
  const [novoRespNome, setNovoRespNome] = useState('');
  const [erroNome, setErroNome] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nomeCliente.trim()) {
      setErroNome('Informe o nome do cliente.');
      return;
    }
    onSave(form);
  }

  function handleSelectCliente(clienteId, clienteObj) {
    if (!clienteId) {
      setForm(f => ({ ...f, clienteId: '' }));
      return;
    }
    const cliente = clienteObj || clientes.find(c => c.id === clienteId);
    if (cliente) {
      setForm(f => ({
        ...f,
        clienteId,
        nomeCliente: cliente.nome || f.nomeCliente,
        cpf: cliente.documento || f.cpf,
      }));
      if (erroNome) setErroNome('');
    }
  }

  async function handleAddNovoResp() {
    if (!novoRespNome.trim()) return;
    const nome = await onAddResponsavel(novoRespNome);
    if (nome) {
      setForm(f => ({ ...f, responsavel: nome }));
      setNovoRespNome('');
      setShowNovoResp(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-md w-full max-w-4xl overflow-y-auto"
        style={{ maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="font-display font-bold text-xl" style={{ color: 'var(--ink)' }}>{atendimento ? 'Editar Atendimento' : 'Novo Atendimento'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <ClientePicker clientes={clientes} value={form.clienteId} onSelect={handleSelectCliente} onCreateNew={onAddCliente} />

          <div>
            <label className={LABEL_CLASS}>Nome do cliente *</label>
            <input
              type="text"
              value={form.nomeCliente}
              onChange={(e) => { setForm({ ...form, nomeCliente: e.target.value }); if (erroNome) setErroNome(''); }}
              className={INPUT_CLASS}
              placeholder="Nome do cliente atendido"
            />
            {erroNome && <p className="text-xs mt-1" style={{ color: 'var(--lacre)' }}>{erroNome}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>CPF</label>
              <input
                type="text"
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                className={INPUT_CLASS}
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Data do atendimento</label>
              <input
                type="date"
                value={form.dataAtendimento}
                onChange={(e) => setForm({ ...form, dataAtendimento: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Motivo do atendimento</label>
            <select
              value={form.motivoAtendimento}
              onChange={(e) => setForm({ ...form, motivoAtendimento: e.target.value })}
              className={INPUT_CLASS}
            >
              <option value="">Selecione o motivo...</option>
              {MOTIVOS_ATENDIMENTO.map(m => <option key={m} value={m}>{m}</option>)}
              {/* Atendimentos antigos foram cadastrados com texto livre:
                  o motivo original continua aqui para nao se perder. */}
              {form.motivoAtendimento && !MOTIVOS_ATENDIMENTO.includes(form.motivoAtendimento) && (
                <option value={form.motivoAtendimento}>
                  {form.motivoAtendimento} (cadastro antigo)
                </option>
              )}
            </select>
          </div>

          {/* Aguardando analise de advogado */}
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, aguardandoAnalise: !f.aguardandoAnalise }))}
            aria-pressed={form.aguardandoAnalise}
            className="w-full flex items-center gap-3 border rounded-md p-3 text-left transition-colors"
            style={form.aguardandoAnalise
              ? { borderColor: 'var(--lacre)', backgroundColor: 'var(--lacre-tint)' }
              : { borderColor: 'rgb(226,232,240)', backgroundColor: 'transparent' }}
          >
            <span
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{
                width: '34px', height: '34px',
                backgroundColor: form.aguardandoAnalise ? 'var(--lacre)' : 'rgb(241,245,249)',
              }}
            >
              <Scale className="w-4 h-4" style={{ color: form.aguardandoAnalise ? '#ffffff' : 'rgb(148,163,184)' }} />
            </span>
            <span className="min-w-0">
              <span className="block font-body font-semibold text-sm"
                style={{ color: form.aguardandoAnalise ? 'var(--lacre)' : 'rgb(71,85,105)' }}>
                Aguardando análise de advogado
              </span>
              <span className="block font-body text-xs text-slate-500">
                {form.aguardandoAnalise
                  ? 'Marcado — aparece destacado no funil e no registro de atendimentos.'
                  : 'Clique para marcar que este atendimento depende de análise jurídica.'}
              </span>
            </span>
          </button>

          <div>
            <label className={LABEL_CLASS}>Tipo de Ação</label>
            <div className="flex flex-wrap gap-2">
              {TIPOS_ACAO.map(t => {
                const active = form.tipoAcao === t.id;
                const activeStyle = t.colorVar
                  ? { backgroundColor: `var(${t.colorVar})`, borderColor: `var(${t.colorVar})`, color: 'white' }
                  : { backgroundColor: '#78716c', borderColor: '#78716c', color: 'white' };
                const inactiveStyle = { backgroundColor: 'white', borderColor: '#cbd5e1', color: '#475569' };
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm({ ...form, tipoAcao: t.id })}
                    className="px-3 py-1.5 rounded-md text-sm font-semibold font-body border transition-colors"
                    style={active ? activeStyle : inactiveStyle}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            {form.tipoAcao === 'outras' && (
              <input
                type="text"
                value={form.tipoAcaoOutraDescricao}
                onChange={(e) => setForm({ ...form, tipoAcaoOutraDescricao: e.target.value })}
                placeholder="Especifique o tipo de ação (opcional)"
                className={`${INPUT_CLASS} mt-2`}
              />
            )}
          </div>

          <div>
            <label className={LABEL_CLASS}>Status do atendimento</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_ATENDIMENTO.map(s => {
                const active = form.status === s.id;
                const activeStyle = { backgroundColor: `var(${s.colorVar})`, borderColor: `var(${s.colorVar})`, color: 'white' };
                const inactiveStyle = { backgroundColor: 'white', borderColor: '#cbd5e1', color: '#475569' };
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setForm({ ...form, status: s.id })}
                    className="px-3 py-1.5 rounded-md text-sm font-semibold font-body border transition-colors"
                    style={active ? activeStyle : inactiveStyle}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Responsável pelo atendimento</label>
            {!showNovoResp ? (
              <div className="flex gap-2">
                <select value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} className={INPUT_CLASS}>
                  <option value="">Selecione um responsável...</option>
                  {responsaveis.map(r => <option key={r.id} value={r.nome}>{r.nome}</option>)}
                </select>
                <button type="button" onClick={() => setShowNovoResp(true)} className="flex items-center gap-1 border border-slate-300 hover:bg-slate-50 text-slate-600 px-3 rounded-md text-sm whitespace-nowrap font-body">
                  <UserPlus className="w-4 h-4" /> Novo
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={novoRespNome}
                  onChange={(e) => setNovoRespNome(e.target.value)}
                  placeholder="Nome do novo responsável"
                  className={INPUT_CLASS}
                  autoFocus
                />
                <button type="button" onClick={handleAddNovoResp} className="btn-brass focus-brass px-3 rounded-md text-sm whitespace-nowrap font-semibold font-body">Adicionar</button>
                <button type="button" onClick={() => { setShowNovoResp(false); setNovoRespNome(''); }} className="text-slate-400 hover:text-slate-600 px-2 text-sm whitespace-nowrap font-body">Cancelar</button>
              </div>
            )}
            <ResponsaveisAdicionais
              principal={form.responsavel}
              extras={form.responsaveisAdicionais}
              responsaveis={responsaveis}
              onChange={(novos) => setForm(f => ({ ...f, responsaveisAdicionais: novos }))}
              bloqueado={false}
            />
          </div>

          <TimesheetAuto entradas={form.timesheet} />

          <div>
            <label className={LABEL_CLASS}>Devolutiva do atendimento</label>
            <textarea
              value={form.devolutiva}
              onChange={(e) => setForm({ ...form, devolutiva: e.target.value })}
              rows={4}
              className={INPUT_CLASS}
              placeholder="Registre a orientação, parecer ou retorno dado ao cliente..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-2">
            <button type="button" onClick={onClose} className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md text-sm font-medium font-body transition-colors">Cancelar</button>
            <button type="submit" className="btn-white focus-brass px-4 py-2 rounded-md text-sm font-semibold font-body transition-colors">{atendimento ? 'Salvar alterações' : 'Registrar atendimento'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Team Modal
// ---------------------------------------------------------------------------

function TeamModal({ responsaveis, leads, onAdd, onRemove, onClose }) {
  const [novoNome, setNovoNome] = useState('');

  async function handleAdd() {
    if (!novoNome.trim()) return;
    await onAdd(novoNome);
    setNovoNome('');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-md w-full max-w-md overflow-y-auto" style={{ maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-display font-bold text-xl" style={{ color: 'var(--ink)' }}>Equipe / Responsáveis</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
              placeholder="Nome do novo responsável"
              className={INPUT_CLASS}
            />
            <button onClick={handleAdd} className="btn-brass focus-brass px-3 rounded-md text-sm whitespace-nowrap font-semibold font-body flex items-center gap-1">
              <UserPlus className="w-4 h-4" /> Adicionar
            </button>
          </div>
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '18rem' }}>
            {responsaveis.length === 0 && (
              <p className="font-body text-sm text-slate-400 text-center py-6">Nenhum responsável cadastrado ainda.</p>
            )}
            {responsaveis.map(r => {
              const count = leads.filter(l => l.responsavel === r.nome).length;
              return (
                <div key={r.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-md">
                  <div>
                    <p className="font-body font-medium text-sm text-slate-800">{r.nome}</p>
                    <p className="font-body text-xs text-slate-500">{count} lead(s) atribuído(s)</p>
                  </div>
                  <DeleteButton onConfirm={() => onRemove(r.id)} />
                </div>
              );
            })}
          </div>
          <p className="font-body text-xs text-slate-400 mt-4">Esses dados são compartilhados com toda a equipe que acessa este CRM. Remover um responsável não apaga leads já atribuídos a ele.</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main App
// ---------------------------------------------------------------------------

export default function App() {
  const [leads, setLeads] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  // --- Tema claro/escuro -------------------------------------------------
  const [tema, setTema] = useState(() => {
    try {
      const salvo = localStorage.getItem('aasaa-tema');
      if (salvo === 'escuro' || salvo === 'claro') return salvo;
      // Sem preferencia salva: segue a configuracao do sistema.
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'escuro';
    } catch (e) { /* navegador sem localStorage: segue no claro */ }
    return 'claro';
  });

  useEffect(() => {
    try { document.documentElement.setAttribute('data-tema', tema); } catch (e) { /* ignora */ }
    try { localStorage.setItem('aasaa-tema', tema); } catch (e) { /* ignora */ }
  }, [tema]);

  const alternarTema = () => setTema(t => (t === 'escuro' ? 'claro' : 'escuro'));

  const [activeTab, setActiveTab] = useState('dashboard');

  const [showLeadModal, setShowLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [newLeadEtapa, setNewLeadEtapa] = useState('nova');
  const [showTeamModal, setShowTeamModal] = useState(false);

  const [showAtendimentoModal, setShowAtendimentoModal] = useState(false);
  const [editingAtendimento, setEditingAtendimento] = useState(null);
  const [newAtendimentoStatus, setNewAtendimentoStatus] = useState('em_atendimento');

  const [showClienteModal, setShowClienteModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [searchClienteTerm, setSearchClienteTerm] = useState('');

  const [filterResponsavel, setFilterResponsavel] = useState('todos');
  const [filterTipoAcao, setFilterTipoAcao] = useState('todos');
  const [filterMesLead, setFilterMesLead] = useState('todos');

  const [filterAtendResponsavel, setFilterAtendResponsavel] = useState('todos');
  const [filterAtendTipoAcao, setFilterAtendTipoAcao] = useState('todos');
  const [filterMesAtend, setFilterMesAtend] = useState('todos');
  const [filterAtendStatus, setFilterAtendStatus] = useState('todos');
  const [searchAtendTerm, setSearchAtendTerm] = useState('');

  // Processos sensiveis / prioritarios (visivel so para a conta mestre)
  const [processos, setProcessos] = useState([]);
  const [showProcessoModal, setShowProcessoModal] = useState(false);
  const [editingProcesso, setEditingProcesso] = useState(null);
  const [newProcessoStatus, setNewProcessoStatus] = useState('acompanhamento');

  const [toast, setToast] = useState(null);

  // --- autenticação ---
  const [sessao, setSessao] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [authCarregando, setAuthCarregando] = useState(true);
  const [erroLogin, setErroLogin] = useState('');
  const [entrando, setEntrando] = useState(false);

  const permissoes = useMemo(() => permissoesDoPerfil(perfil), [perfil]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthCarregando(false);
      return;
    }
    let ativo = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!ativo) return;
      setSessao(data ? data.session : null);
      setAuthCarregando(false);
    }).catch(() => { if (ativo) setAuthCarregando(false); });

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao);
      if (!novaSessao) {
        setPerfil(null);
        setLeads([]); setAtendimentos([]); setClientes([]); setResponsaveis([]); setProcessos([]);
      }
    });
    return () => {
      ativo = false;
      if (sub && sub.subscription) sub.subscription.unsubscribe();
    };
  }, []);

  // Carrega o perfil (papel + responsável) assim que há sessão.
  useEffect(() => {
    if (!sessao) return;
    let ativo = true;
    supabase.from('perfis').select('*').eq('id', sessao.user.id).maybeSingle()
      .then(({ data, error }) => {
        if (!ativo) return;
        if (error) {
          console.error('[Supabase] erro ao carregar perfil:', error);
          showToast('Não foi possível carregar seu perfil de acesso.', 'error');
        }
        // Sem registro em perfis, entra como colaborador sem leads vinculados.
        setPerfil(data || { papel: 'colaborador', email: sessao.user.email, nome: sessao.user.email, responsavelNome: '' });
      });
    return () => { ativo = false; };
  }, [sessao]);

  async function handleEntrar(email, senha) {
    if (!email || !senha) {
      setErroLogin('Informe e-mail e senha.');
      return;
    }
    setEntrando(true);
    setErroLogin('');
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setEntrando(false);
    if (error) {
      console.error('[Supabase] erro de login:', error);
      setErroLogin(
        error.message && error.message.toLowerCase().includes('invalid')
          ? 'E-mail ou senha incorretos.'
          : `Não foi possível entrar: ${error.message}`
      );
    }
  }

  async function handleSair() {
    await supabase.auth.signOut();
    setPerfil(null);
    setActiveTab('dashboard');
  }

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      if (!isSupabaseConfigured || !sessao) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [leadsRes, respRes, atendRes, clientesRes, procRes] = await Promise.all([
          supabase.from('leads').select('*').order('dataCriacao', { ascending: false }),
          supabase.from('responsaveis').select('*').order('nome', { ascending: true }),
          supabase.from('atendimentos').select('*'),
          supabase.from('clientes').select('*').order('nome', { ascending: true }),
          supabase.from('processos_sensiveis').select('*').order('dataCriacao', { ascending: false }),
        ]);
        if (cancelled) return;
        if (leadsRes.error) {
          console.error('[Supabase] erro ao carregar leads:', leadsRes.error);
          showToast(`Erro ao carregar leads: ${leadsRes.error.message}`, 'error');
          setLeads([]);
        } else {
          setLeads(leadsRes.data || []);
        }
        if (respRes.error) {
          console.error('[Supabase] erro ao carregar responsaveis:', respRes.error);
          showToast(`Erro ao carregar a equipe: ${respRes.error.message}`, 'error');
          setResponsaveis([]);
        } else {
          setResponsaveis(respRes.data || []);
        }
        if (atendRes.error) {
          console.error('[Supabase] erro ao carregar atendimentos:', atendRes.error);
          showToast(`Erro ao carregar atendimentos: ${atendRes.error.message}`, 'error');
          setAtendimentos([]);
        } else {
          setAtendimentos(atendRes.data || []);
        }
        if (clientesRes.error) {
          console.error('[Supabase] erro ao carregar clientes:', clientesRes.error);
          showToast(`Erro ao carregar clientes: ${clientesRes.error.message}`, 'error');
          setClientes([]);
        } else {
          setClientes(clientesRes.data || []);
        }
        // A tabela de processos sensiveis so e legivel pela conta mestre:
        // para o colaborador o Supabase devolve lista vazia, sem erro.
        if (procRes.error) {
          console.error('[Supabase] erro ao carregar processos sensiveis:', procRes.error);
          setProcessos([]);
        } else {
          setProcessos(procRes.data || []);
        }
      } catch (err) {
        console.error('[Supabase] falha de conexão ao carregar dados:', err);
        if (!cancelled) {
          showToast('Não foi possível conectar ao Supabase. Confira a URL/chave no arquivo .env.', 'error');
          setLeads([]);
          setResponsaveis([]);
          setAtendimentos([]);
          setClientes([]);
          setProcessos([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [sessao]);

  function showToast(message, type) {
    setToast({ message, type: type || 'success' });
    setTimeout(() => setToast(null), 4000);
  }

  // --- Processos sensiveis / prioritarios -------------------------------
  // Quantos processos sensiveis estao vencidos (para o sino do cabecalho).
  const cobrancasPendentes = useMemo(
    () => processos.filter(p => processoPrecisaCobranca(p)).length,
    [processos]
  );

  // As abas de processos e notificacoes so existem para a conta mestre.
  const tabsVisiveis = useMemo(
    () => (permissoes.papel === 'mestre' ? [...TABS, ...TABS_MESTRE] : TABS),
    [permissoes.papel]
  );

  // Se o perfil deixar de ser mestre, nao deixa a tela restrita aberta.
  useEffect(() => {
    if (permissoes.papel !== 'mestre' && (activeTab === 'processos' || activeTab === 'notificacoes')) {
      setActiveTab('dashboard');
    }
  }, [permissoes.papel, activeTab]);

  function openNewProcessoModal(statusId) {
    setEditingProcesso(null);
    setNewProcessoStatus(statusId || 'acompanhamento');
    setShowProcessoModal(true);
  }

  function openEditProcessoModal(processo) {
    setEditingProcesso(processo);
    setShowProcessoModal(true);
  }

  async function handleSaveProcesso(formData) {
    if (editingProcesso) {
      const { error } = await supabase.from('processos_sensiveis').update(formData).eq('id', editingProcesso.id);
      if (error) { console.error('[Supabase] erro ao salvar processo:', error); showToast(`Erro ao salvar: ${error.message}`, 'error'); return; }
      setProcessos(prev => prev.map(p => (p.id === editingProcesso.id ? { ...p, ...formData } : p)));
      showToast('Processo atualizado.');
    } else {
      const novo = {
        id: generateId(),
        ...formData,
        dataCriacao: new Date().toISOString(),
        dataUltimaCobranca: null,
        historico: [],
      };
      const { error } = await supabase.from('processos_sensiveis').insert([novo]);
      if (error) { console.error('[Supabase] erro ao cadastrar processo:', error); showToast(`Erro ao cadastrar: ${error.message}`, 'error'); return; }
      setProcessos(prev => [novo, ...prev]);
      showToast('Processo cadastrado no acompanhamento.');
    }
    setShowProcessoModal(false);
    setEditingProcesso(null);
  }

  async function handleMoveProcessoStatus(id, novoStatus) {
    const atual = processos.find(p => p.id === id);
    if (!atual || (atual.status || 'acompanhamento') === novoStatus) return;
    const updates = { status: novoStatus };
    setProcessos(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    const { error } = await supabase.from('processos_sensiveis').update(updates).eq('id', id);
    if (error) {
      console.error('[Supabase] erro ao mover processo:', error);
      showToast(`Erro ao mover: ${error.message}`, 'error');
      setProcessos(prev => prev.map(p => (p.id === id ? atual : p)));
    }
  }

  async function handleDeleteProcesso(id) {
    const { error } = await supabase.from('processos_sensiveis').delete().eq('id', id);
    if (error) { console.error('[Supabase] erro ao excluir processo:', error); showToast(`Erro ao excluir: ${error.message}`, 'error'); return; }
    setProcessos(prev => prev.filter(p => p.id !== id));
    showToast('Processo removido do acompanhamento.');
  }

  // Zera a contagem de dias uteis e guarda quem cobrou e quando.
  async function handleRegistrarCobranca(id) {
    const agora = new Date().toISOString();
    const atual = processos.find(p => p.id === id);
    if (!atual) return;
    const historico = Array.isArray(atual.historico) ? atual.historico : [];
    const updates = {
      dataUltimaCobranca: agora,
      historico: [...historico, { data: agora, por: permissoes.nome || 'conta mestre' }],
    };
    setProcessos(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    const { error } = await supabase.from('processos_sensiveis').update(updates).eq('id', id);
    if (error) {
      console.error('[Supabase] erro ao registrar cobranca:', error);
      showToast(`Erro ao registrar cobrança: ${error.message}`, 'error');
      setProcessos(prev => prev.map(p => (p.id === id ? atual : p)));
      return;
    }
    showToast('Cobrança registrada. A contagem recomeça hoje.');
  }

  function openNewLeadModal(etapaId) {
    setEditingLead(null);
    setNewLeadEtapa(etapaId || 'nova');
    setShowLeadModal(true);
  }

  function openEditLeadModal(lead) {
    setEditingLead(lead);
    setShowLeadModal(true);
  }

  async function handleSaveLead(formData) {
    const isEdit = !!editingLead;
    if (isEdit) {
      let dataToSave = formData;
      if (formData.etapa !== editingLead.etapa) {
        // Mudou de etapa pelo formulário: fecha o tempo da etapa anterior.
        const mov = montarMovimentacao({ ...editingLead, timesheet: formData.timesheet }, formData.etapa, {
          campoFaseAtual: 'etapa',
          campoEntrada: 'dataEntradaEtapa',
          rotuloDe: rotuloEtapa,
        });
        dataToSave = { ...formData, ...mov };
      }
      const { error } = await supabase.from('leads').update(dataToSave).eq('id', editingLead.id);
      if (error) { console.error('[Supabase] erro ao atualizar lead:', error); showToast(`Erro ao salvar: ${error.message}`, 'error'); return; }
      setLeads(prev => prev.map(l => (l.id === editingLead.id ? { ...l, ...dataToSave } : l)));
    } else {
      const agora = new Date().toISOString();
      const newLead = {
        id: generateId(),
        dataCriacao: agora,
        dataEntradaEtapa: agora,
        tempoAcumulado: {},
        historico: [],
        ...formData,
      };
      const { error } = await supabase.from('leads').insert([newLead]);
      if (error) { console.error('[Supabase] erro ao inserir lead:', error); showToast(`Erro ao salvar: ${error.message}`, 'error'); return; }
      setLeads(prev => [newLead, ...prev]);
    }
    setShowLeadModal(false);
    setEditingLead(null);
    showToast(isEdit ? 'Dados atualizados com sucesso.' : 'Lead adicionado ao funil de captação.');
  }

  async function handleDeleteLead(id) {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) { console.error('[Supabase] erro ao remover lead:', error); showToast(`Erro ao remover: ${error.message}`, 'error'); return; }
    setLeads(prev => prev.filter(l => l.id !== id));
    showToast('Registro removido.');
  }

  function handleMoveStage(id, novaEtapa) {
    const atual = leads.find(l => l.id === id);
    if (!atual || atual.etapa === novaEtapa) return;
    const updates = montarMovimentacao(atual, novaEtapa, {
      campoFaseAtual: 'etapa',
      campoEntrada: 'dataEntradaEtapa',
      rotuloDe: rotuloEtapa,
    });
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
    supabase.from('leads').update(updates).eq('id', id).then(({ error }) => {
      if (error) { console.error('[Supabase] erro ao mover etapa:', error); showToast(`Erro ao mover: ${error.message}`, 'error'); }
    });
  }

  async function handleAddResponsavel(nome) {
    const trimmed = (nome || '').trim();
    if (!trimmed) return null;
    const exists = responsaveis.some(r => r.nome.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      showToast('Esse responsável já está cadastrado.', 'error');
      return trimmed;
    }
    const novoResp = { id: generateId(), nome: trimmed };
    const { error } = await supabase.from('responsaveis').insert([novoResp]);
    if (error) { console.error('[Supabase] erro ao inserir responsável:', error); showToast(`Erro ao cadastrar responsável: ${error.message}`, 'error'); return null; }
    setResponsaveis(prev => [...prev, novoResp]);
    showToast('Responsável cadastrado com sucesso.');
    return trimmed;
  }

  async function handleRemoveResponsavel(id) {
    const { error } = await supabase.from('responsaveis').delete().eq('id', id);
    if (error) { console.error('[Supabase] erro ao remover responsável:', error); showToast(`Erro ao remover responsável: ${error.message}`, 'error'); return; }
    setResponsaveis(prev => prev.filter(r => r.id !== id));
  }

  function openNewClienteModal() {
    setEditingCliente(null);
    setShowClienteModal(true);
  }

  function openEditClienteModal(cliente) {
    setEditingCliente(cliente);
    setShowClienteModal(true);
  }

  async function handleAddCliente(formData) {
    const trimmed = (formData.nome || '').trim();
    if (!trimmed) return null;

    // CPF obrigatorio e unico — barreira final, valendo tambem para o
    // cadastro feito de dentro do lead/atendimento.
    const msgDoc = validarDocumentoCliente(formData.documento, formData.tipoPessoa);
    if (msgDoc) { showToast(msgDoc, 'error'); return null; }
    const duplicado = clienteComMesmoDocumento(clientes, formData.documento, null);
    if (duplicado) {
      showToast(`CPF já cadastrado para "${duplicado.nome}". Vincule o cliente existente.`, 'error');
      return null;
    }

    const novoCliente = {
      id: generateId(),
      nome: trimmed,
      telefone: formData.telefone || '',
      email: formData.email || '',
      documento: formData.documento || '',
      tipoPessoa: formData.tipoPessoa || tipoPessoaDoDocumento(formData.documento),
      senhaGovBr: formData.senhaGovBr || '',
      observacoes: formData.observacoes || '',
      dataCriacao: new Date().toISOString(),
    };
    const { error } = await supabase.from('clientes').insert([novoCliente]);
    if (error) { console.error('[Supabase] erro ao inserir cliente:', error); showToast(`Erro ao cadastrar cliente: ${error.message}`, 'error'); return null; }
    setClientes(prev => [novoCliente, ...prev]);
    showToast('Cliente cadastrado com sucesso.');
    return novoCliente;
  }

  async function handleSaveCliente(formData) {
    const isEdit = !!editingCliente;
    const msgDoc = validarDocumentoCliente(formData.documento, formData.tipoPessoa);
    if (msgDoc) { showToast(msgDoc, 'error'); return; }
    const dup = clienteComMesmoDocumento(clientes, formData.documento, isEdit ? editingCliente.id : null);
    if (dup) { showToast(`CPF já cadastrado para "${dup.nome}".`, 'error'); return; }
    if (isEdit) {
      const { error } = await supabase.from('clientes').update(formData).eq('id', editingCliente.id);
      if (error) { console.error('[Supabase] erro ao atualizar cliente:', error); showToast(`Erro ao salvar: ${error.message}`, 'error'); return; }
      setClientes(prev => prev.map(c => (c.id === editingCliente.id ? { ...c, ...formData } : c)));
    } else {
      const newCliente = { id: generateId(), dataCriacao: new Date().toISOString(), ...formData };
      const { error } = await supabase.from('clientes').insert([newCliente]);
      if (error) { console.error('[Supabase] erro ao inserir cliente:', error); showToast(`Erro ao salvar: ${error.message}`, 'error'); return; }
      setClientes(prev => [newCliente, ...prev]);
    }
    setShowClienteModal(false);
    setEditingCliente(null);
    showToast(isEdit ? 'Cliente atualizado com sucesso.' : 'Cliente cadastrado com sucesso.');
  }

  async function handleDeleteCliente(id) {
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) { console.error('[Supabase] erro ao remover cliente:', error); showToast(`Erro ao remover: ${error.message}`, 'error'); return; }
    setClientes(prev => prev.filter(c => c.id !== id));
    showToast('Cliente removido.');
  }

  function openNewAtendimentoModal(statusId) {
    setEditingAtendimento(null);
    setNewAtendimentoStatus(statusId || 'em_atendimento');
    setShowAtendimentoModal(true);
  }

  function openEditAtendimentoModal(atendimento) {
    setEditingAtendimento(atendimento);
    setShowAtendimentoModal(true);
  }

  function handleMoveAtendimentoStatus(id, novoStatus) {
    const atual = atendimentos.find(a => a.id === id);
    if (!atual || atual.status === novoStatus) return;
    const updates = montarMovimentacao(atual, novoStatus, {
      campoFaseAtual: 'status',
      campoEntrada: 'dataEntradaStatus',
      rotuloDe: rotuloStatus,
    });
    setAtendimentos(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
    supabase.from('atendimentos').update(updates).eq('id', id).then(({ error }) => {
      if (error) { console.error('[Supabase] erro ao mover status de atendimento:', error); showToast(`Erro ao mover: ${error.message}`, 'error'); }
    });
  }

  async function handleSaveAtendimento(formData) {
    const isEdit = !!editingAtendimento;
    if (isEdit) {
      let dataToSave = formData;
      if (formData.status !== editingAtendimento.status) {
        const mov = montarMovimentacao({ ...editingAtendimento, timesheet: formData.timesheet }, formData.status, {
          campoFaseAtual: 'status',
          campoEntrada: 'dataEntradaStatus',
          rotuloDe: rotuloStatus,
        });
        dataToSave = { ...formData, ...mov };
      }
      const { error } = await supabase.from('atendimentos').update(dataToSave).eq('id', editingAtendimento.id);
      if (error) { console.error('[Supabase] erro ao atualizar atendimento:', error); showToast(`Erro ao salvar: ${error.message}`, 'error'); return; }
      setAtendimentos(prev => prev.map(a => (a.id === editingAtendimento.id ? { ...a, ...dataToSave } : a)));
    } else {
      const agora = new Date().toISOString();
      const newAtendimento = {
        id: generateId(),
        dataCriacao: agora,
        dataEntradaStatus: agora,
        tempoAcumulado: {},
        historico: [],
        ...formData,
      };
      const { error } = await supabase.from('atendimentos').insert([newAtendimento]);
      if (error) { console.error('[Supabase] erro ao inserir atendimento:', error); showToast(`Erro ao salvar: ${error.message}`, 'error'); return; }
      setAtendimentos(prev => [newAtendimento, ...prev]);
    }
    setShowAtendimentoModal(false);
    setEditingAtendimento(null);
    showToast(isEdit ? 'Atendimento atualizado com sucesso.' : 'Atendimento registrado com sucesso.');
  }

  async function handleDeleteAtendimento(id) {
    const { error } = await supabase.from('atendimentos').delete().eq('id', id);
    if (error) { console.error('[Supabase] erro ao remover atendimento:', error); showToast(`Erro ao remover: ${error.message}`, 'error'); return; }
    setAtendimentos(prev => prev.filter(a => a.id !== id));
    showToast('Atendimento removido.');
  }

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      if (filterResponsavel !== 'todos' && !ehResponsavel(l, filterResponsavel)) return false;
      if (filterTipoAcao !== 'todos' && l.tipoAcao !== filterTipoAcao) return false;
      if (filterMesLead !== 'todos' && chaveMes(dataReferencia(l, 'captacao')) !== filterMesLead) return false;
      return true;
    });
  }, [leads, filterResponsavel, filterTipoAcao, filterMesLead]);

  const mesesLeads = useMemo(() => mesesDosRegistros(leads, 'captacao'), [leads]);

  const filteredClientes = useMemo(() => {
    const term = searchClienteTerm.trim();
    if (!term) return clientes;
    return clientes.filter(c => clienteCasaBusca(c, term));
  }, [clientes, searchClienteTerm]);

  const filteredAtendimentos = useMemo(() => {
    const term = searchAtendTerm.trim();
    return atendimentos
      .filter(a => {
        if (filterAtendResponsavel !== 'todos' && a.responsavel !== filterAtendResponsavel) return false;
        if (filterAtendTipoAcao !== 'todos' && a.tipoAcao !== filterAtendTipoAcao) return false;
        if (filterAtendStatus === 'aguardando_analise') {
          if (!a.aguardandoAnalise) return false;
        } else if (filterAtendStatus !== 'todos' && a.status !== filterAtendStatus) {
          return false;
        }
        if (term && !normalizarTexto(a.nomeCliente).includes(normalizarTexto(term))) return false;
        return true;
      })
      .sort((a, b) => (b.dataAtendimento || '').localeCompare(a.dataAtendimento || ''));
  }, [atendimentos, filterAtendResponsavel, filterAtendTipoAcao, filterAtendStatus, searchAtendTerm]);

  const kanbanFilteredAtendimentos = useMemo(() => {
    return atendimentos.filter(a => {
      if (filterAtendResponsavel !== 'todos' && !ehResponsavel(a, filterAtendResponsavel)) return false;
      if (filterAtendTipoAcao !== 'todos' && a.tipoAcao !== filterAtendTipoAcao) return false;
      if (filterMesAtend !== 'todos' && chaveMes(dataReferencia(a, 'atendimentos')) !== filterMesAtend) return false;
      return true;
    });
  }, [atendimentos, filterAtendResponsavel, filterAtendTipoAcao, filterMesAtend]);

  const mesesAtendimentos = useMemo(() => mesesDosRegistros(atendimentos, 'atendimentos'), [atendimentos]);

  if (!isSupabaseConfigured) {
    return (
      <div className="crm-root min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <GlobalStyles />
        <div className="bg-white rounded-md border border-slate-200 p-8 max-w-lg text-center shadow-sm">
          <div className="mx-auto mb-4 flex items-center justify-center rounded-full bg-slate-100" style={{ width: '56px', height: '56px' }}>
            <AlertCircle className="w-7 h-7" style={{ color: 'var(--lacre)' }} />
          </div>
          <h2 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>Configuração do Supabase ausente</h2>
          <p className="font-body text-sm text-slate-600 mb-3">
            As variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> não
            foram encontradas, ou a URL não é um endereço válido.
          </p>
          <p className="font-body text-sm text-slate-600 mb-3">
            <strong>Testando localmente?</strong> Confira o arquivo <code>.env</code> na raiz do
            projeto e reinicie o <code>npm run dev</code> depois de editá-lo.
          </p>
          <p className="font-body text-sm text-slate-600">
            <strong>Site já publicado?</strong> Adicione as duas variáveis nas configurações de
            Environment Variables da Vercel/Netlify e publique uma nova versão — apenas salvar
            as variáveis não atualiza um site já publicado, é necessário reimplantar.
          </p>
        </div>
      </div>
    );
  }

  if (authCarregando) {
    return (
      <div className="crm-root min-h-screen bg-slate-100 flex items-center justify-center">
        <GlobalStyles />
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--brass)' }} />
      </div>
    );
  }

  if (!sessao) {
    return <TelaLogin onEntrar={handleEntrar} erro={erroLogin} carregando={entrando} />;
  }

  return (
    <PermissoesContext.Provider value={permissoes}>
    <div className="crm-root min-h-screen bg-slate-100">
      <GlobalStyles />
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--brass)' }} />
            <p className="font-body text-slate-500 text-sm">Carregando dados do CRM...</p>
          </div>
        </div>
      ) : (
        <>
          <header style={{ backgroundColor: 'var(--ink-surface)' }} className="sticky top-0 z-30">
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <img src={logoAasaa} alt="Antonio Augusto Sousa Advogados Associados" className="flex-shrink-0" style={{ height: '40px', width: 'auto' }} />
                <div>
                  <h1 className="font-display text-lg sm:text-xl font-bold leading-tight text-white">CONTROLE DE LEADS E ATENDIMENTOS</h1>
                  <p className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Gestão Antonio Augusto Sousa Advogados Associados
                    <span className="font-ledger ml-2" title="Versão publicada — confira se bate com a última atualização enviada">
                      v{VERSAO_SISTEMA}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden md:flex flex-col items-end mr-1">
                  <span className="font-body text-xs font-semibold text-white truncate" style={{ maxWidth: '14rem' }}>
                    {permissoes.nome}
                  </span>
                  <span className="font-body text-[10px] uppercase tracking-wide inline-flex items-center gap-1"
                    style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {permissoes.papel === 'mestre' && <ShieldCheck className="w-3 h-3" />}
                    {permissoes.papel === 'mestre' ? 'Conta mestre' : 'Colaborador'}
                  </span>
                </div>
                {permissoes.podeGerirEquipe && (
                  <button onClick={() => setShowTeamModal(true)} className="btn-ink-outline focus-brass inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium font-body transition-colors">
                    <UserPlus className="w-4 h-4" /> <span className="hidden sm:inline">Equipe</span>
                  </button>
                )}
                <button onClick={handleSair} title="Sair" className="btn-ink-outline focus-brass inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium font-body transition-colors">
                  <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sair</span>
                </button>
                {cobrancasPendentes > 0 && (
                  <button
                    onClick={() => setActiveTab('notificacoes')}
                    title={`${cobrancasPendentes} processo(s) sensível(eis) aguardando cobrança`}
                    className="btn-ink-outline focus-brass relative inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium font-body transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                    <span
                      className="absolute font-ledger text-[10px] font-bold px-1.5 rounded-full text-white"
                      style={{ top: '-6px', right: '-6px', backgroundColor: 'var(--lacre)', border: '1.5px solid var(--ink-surface)' }}
                    >
                      {cobrancasPendentes}
                    </span>
                  </button>
                )}
                <button
                  onClick={alternarTema}
                  title={tema === 'escuro' ? 'Mudar para o modo claro' : 'Mudar para o modo escuro'}
                  aria-label={tema === 'escuro' ? 'Mudar para o modo claro' : 'Mudar para o modo escuro'}
                  className="btn-ink-outline focus-brass inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium font-body transition-colors"
                >
                  {tema === 'escuro' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span className="hidden lg:inline">{tema === 'escuro' ? 'Claro' : 'Escuro'}</span>
                </button>
                <button onClick={() => openNewLeadModal('nova')} className="btn-white focus-brass inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold font-body transition-colors">
                  <Plus className="w-4 h-4" /> Novo Lead
                </button>
              </div>
            </div>
            <div className="px-4 sm:px-6 flex gap-1 overflow-x-auto">
              {tabsVisiveis.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-folder ${active ? 'active' : ''} flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold font-body whitespace-nowrap`}
                  >
                    <Icon className="w-4 h-4" /> {tab.label}
                    {tab.id === 'notificacoes' && cobrancasPendentes > 0 && (
                      <span
                        className="ml-1 font-ledger text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: 'var(--lacre)' }}
                      >
                        {cobrancasPendentes}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </header>

          <main className="flex-1">
            {activeTab === 'dashboard' && (
              <DashboardView leads={leads} responsaveis={responsaveis} atendimentos={atendimentos} onNovoLead={() => openNewLeadModal('nova')} onAbrirLead={openEditLeadModal} />
            )}
            {activeTab === 'kanban' && (
              <KanbanView
                leads={filteredLeads}
                responsaveis={responsaveis}
                filterResponsavel={filterResponsavel}
                setFilterResponsavel={setFilterResponsavel}
                filterTipoAcao={filterTipoAcao}
                setFilterTipoAcao={setFilterTipoAcao}
                filterMes={filterMesLead}
                setFilterMes={setFilterMesLead}
                mesesDisponiveis={mesesLeads}
                onMoveLead={handleMoveStage}
                onEdit={openEditLeadModal}
                onDelete={handleDeleteLead}
                onAddToStage={(etapaId) => openNewLeadModal(etapaId)}
              />
            )}
            {activeTab === 'clientes' && (
              <ClientesView
                clientes={filteredClientes}
                leads={leads}
                atendimentos={atendimentos}
                searchTerm={searchClienteTerm}
                setSearchTerm={setSearchClienteTerm}
                onEdit={openEditClienteModal}
                onDelete={handleDeleteCliente}
                onNovo={openNewClienteModal}
              />
            )}
            {activeTab === 'funil-atendimentos' && (
              <AtendimentoKanbanView
                atendimentos={kanbanFilteredAtendimentos}
                responsaveis={responsaveis}
                filterResponsavel={filterAtendResponsavel}
                setFilterResponsavel={setFilterAtendResponsavel}
                filterTipoAcao={filterAtendTipoAcao}
                setFilterTipoAcao={setFilterAtendTipoAcao}
                filterMes={filterMesAtend}
                setFilterMes={setFilterMesAtend}
                mesesDisponiveis={mesesAtendimentos}
                onMoveStatus={handleMoveAtendimentoStatus}
                onEdit={openEditAtendimentoModal}
                onDelete={handleDeleteAtendimento}
                onAddToStatus={(statusId) => openNewAtendimentoModal(statusId)}
              />
            )}
            {activeTab === 'processos' && (
              <ProcessosSensiveisView
                processos={processos}
                clientes={clientes}
                onMoveStatus={handleMoveProcessoStatus}
                onEdit={openEditProcessoModal}
                onDelete={handleDeleteProcesso}
                onAddToStatus={openNewProcessoModal}
              />
            )}

            {activeTab === 'notificacoes' && (
              <NotificacoesView
                processos={processos}
                onRegistrarCobranca={handleRegistrarCobranca}
                onAbrirProcesso={openEditProcessoModal}
              />
            )}

            {activeTab === 'atendimentos' && (
              <AtendimentosView
                atendimentos={filteredAtendimentos}
                searchTerm={searchAtendTerm}
                setSearchTerm={setSearchAtendTerm}
                filterResponsavel={filterAtendResponsavel}
                setFilterResponsavel={setFilterAtendResponsavel}
                filterTipoAcao={filterAtendTipoAcao}
                setFilterTipoAcao={setFilterAtendTipoAcao}
                filterStatus={filterAtendStatus}
                setFilterStatus={setFilterAtendStatus}
                responsaveis={responsaveis}
                onEdit={openEditAtendimentoModal}
                onDelete={handleDeleteAtendimento}
                onNovo={() => openNewAtendimentoModal('em_atendimento')}
              />
            )}
          </main>

          {showLeadModal && (
            <LeadFormModal
              lead={editingLead}
              defaultEtapa={newLeadEtapa}
              responsaveis={responsaveis}
              clientes={clientes}
              onSave={handleSaveLead}
              onClose={() => { setShowLeadModal(false); setEditingLead(null); }}
              onAddResponsavel={handleAddResponsavel}
              onAddCliente={handleAddCliente}
            />
          )}

          {showAtendimentoModal && (
            <AtendimentoFormModal
              atendimento={editingAtendimento}
              defaultStatus={newAtendimentoStatus}
              responsaveis={responsaveis}
              clientes={clientes}
              onSave={handleSaveAtendimento}
              onClose={() => { setShowAtendimentoModal(false); setEditingAtendimento(null); }}
              onAddResponsavel={handleAddResponsavel}
              onAddCliente={handleAddCliente}
            />
          )}

          {showProcessoModal && (
            <ProcessoFormModal
              processo={editingProcesso}
              defaultStatus={newProcessoStatus}
              clientes={clientes}
              onSave={handleSaveProcesso}
              onClose={() => { setShowProcessoModal(false); setEditingProcesso(null); }}
              onAddCliente={handleAddCliente}
            />
          )}

          {showClienteModal && (
            <ClienteFormModal
              cliente={editingCliente}
              clientes={clientes}
              onSave={handleSaveCliente}
              onClose={() => { setShowClienteModal(false); setEditingCliente(null); }}
            />
          )}

          {showTeamModal && (
            <TeamModal
              responsaveis={responsaveis}
              leads={leads}
              onAdd={handleAddResponsavel}
              onRemove={handleRemoveResponsavel}
              onClose={() => setShowTeamModal(false)}
            />
          )}

          <Toast toast={toast} />
        </>
      )}
    </div>
    </PermissoesContext.Provider>
  );
}
