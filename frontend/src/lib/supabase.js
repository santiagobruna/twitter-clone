import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const bucket = import.meta.env.VITE_SUPABASE_BUCKET || 'avatars'

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/**
 * Faz upload de uma imagem de perfil para o bucket público do Supabase.
 * Retorna a URL pública do arquivo.
 */
export async function uploadAvatar(file, userId) {
  if (!supabase) {
    throw new Error(
      'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env',
    )
  }

  if (!file?.type?.startsWith('image/')) {
    throw new Error('Selecione um arquivo de imagem.')
  }

  const maxBytes = 2 * 1024 * 1024
  if (file.size > maxBytes) {
    throw new Error('A imagem deve ter no máximo 2MB.')
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${userId}/${Date.now()}.${extension}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  })

  if (error) {
    throw new Error(error.message || 'Falha no upload da imagem.')
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  if (!data?.publicUrl) {
    throw new Error('Não foi possível obter a URL pública da imagem.')
  }

  return data.publicUrl
}
