import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verifica se a URL recebida é realmente uma URL http(s) válida — evita que
// createClient() derrube a aplicação inteira (tela branca) quando a variável
// de ambiente está ausente, vazia, ou foi colada com aspas/espaços por engano.
function isValidHttpUrl(value) {
  if (!value) return false
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch (err) {
    return false
  }
}

export const isSupabaseConfigured = isValidHttpUrl(supabaseUrl) && Boolean(supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.error(
    '[Supabase] Configuração ausente ou inválida. Verifique se VITE_SUPABASE_URL ' +
    '(deve começar com https:// e terminar em .supabase.co) e VITE_SUPABASE_ANON_KEY ' +
    'estão definidas — no arquivo .env local, ou nas variáveis de ambiente do Vercel/Netlify.'
  )
}

// Quando a configuração está ausente, usamos uma URL de placeholder apenas
// para o createClient() não lançar exceção na carga do módulo. O aviso real
// para quem estiver usando o sistema aparece na tela (ver App.jsx).
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key'
)
