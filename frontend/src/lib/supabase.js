import { createClient } from '@supabase/supabase-js'

import { formatUserError } from '../utils/apiErrors'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const bucket = import.meta.env.VITE_SUPABASE_BUCKET || 'twitter-clone'

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

function uploadError(message) {
  const error = new Error(message)
  error.code = 'UPLOAD_ERROR'
  return error
}

/**
 * Faz upload de uma imagem de perfil para o bucket público do Supabase.
 * Retorna a URL pública do arquivo.
 */
export async function uploadAvatar(file, userId) {
  return uploadProfileImage(file, userId, 'avatar')
}

export async function uploadBanner(file, userId) {
  return uploadProfileImage(file, userId, 'banner')
}

export async function uploadPostImage(file, userId) {
  return uploadProfileImage(file, userId, 'post')
}

async function uploadProfileImage(file, userId, kind) {
  if (!supabase) {
    throw uploadError(
      'O envio de fotos ainda não está configurado. Peça para revisar as variáveis do Supabase.',
    )
  }

  if (!file?.type?.startsWith('image/')) {
    throw uploadError('Selecione um arquivo de imagem (JPG, PNG ou WEBP).')
  }

  const maxBytes = 2 * 1024 * 1024
  if (file.size > maxBytes) {
    throw uploadError('A imagem deve ter no máximo 2MB.')
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${userId}/${kind}-${Date.now()}.${extension}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  })

  if (error) {
    throw uploadError(
      formatUserError(
        { message: error.message },
        'Não foi possível enviar a foto. Tente outra imagem ou tente novamente.',
      ),
    )
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  if (!data?.publicUrl) {
    throw uploadError('Não foi possível obter o link da imagem enviada.')
  }

  return data.publicUrl
}
