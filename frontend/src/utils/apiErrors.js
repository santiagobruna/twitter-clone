const FIELD_LABELS = {
  username: 'Nome de usuário',
  email: 'E-mail',
  password: 'Senha',
  password_confirm: 'Confirmação de senha',
  display_name: 'Nome',
  bio: 'Bio',
  avatar: 'Foto de perfil',
  content: 'Conteúdo',
}

const STATUS_MESSAGES = {
  0: 'Falha de conexão. Verifique sua internet e se a API está no ar.',
  400: 'Dados inválidos. Verifique os campos e tente novamente.',
  401: 'Sessão expirada ou inválida. Faça login novamente.',
  403: 'Você não tem permissão para esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Esta ação já foi realizada ou conflita com o estado atual.',
  413: 'Arquivo muito grande. Use uma imagem menor.',
  429: 'Muitas tentativas. Aguarde um momento e tente novamente.',
  500: 'Erro no servidor. Tente novamente em instantes.',
  502: 'Serviço temporariamente indisponível. Tente novamente.',
  503: 'Serviço em manutenção. Tente novamente em instantes.',
}

const CODE_MESSAGES = {
  UNAUTHORIZED: 'Sessão expirada ou inválida. Faça login novamente.',
  FORBIDDEN: 'Você não tem permissão para esta ação.',
  NOT_FOUND: 'Recurso não encontrado.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos e tente novamente.',
  CONFLICT: 'Esta ação já foi realizada ou conflita com o estado atual.',
  SELF_FOLLOW: 'Você não pode seguir a si mesmo.',
  ALREADY_FOLLOWING: 'Você já segue este usuário.',
  NOT_FOLLOWING: 'Você não segue este usuário.',
  ALREADY_LIKED: 'Você já curtiu esta postagem.',
  NOT_LIKED: 'Você ainda não curtiu esta postagem.',
  BAD_REQUEST: 'Não foi possível concluir a solicitação.',
}

const TECHNICAL_PATTERNS = [
  {
    test: /row-level security|rls|violates row-level/i,
    message:
      'Não foi possível enviar a foto. Verifique as permissões do bucket no Supabase.',
  },
  {
    test: /bucket not found|The resource was not found/i,
    message: 'Bucket de imagens não encontrado. Confira VITE_SUPABASE_BUCKET no .env.',
  },
  {
    test: /jwt|invalid api key|Invalid authentication/i,
    message: 'Configuração do Supabase inválida. Confira a URL e a anon key no .env.',
  },
  {
    test: /Failed to fetch|NetworkError|Load failed|network/i,
    message: STATUS_MESSAGES[0],
  },
  {
    test: /payload too large|entity too large|maximum size/i,
    message: 'Arquivo muito grande. Use uma imagem de até 2MB.',
  },
  {
    test: /mime type|not allowed|invalid content type/i,
    message: 'Formato de arquivo não suportado. Envie uma imagem (JPG, PNG ou WEBP).',
  },
]

function humanizeTechnicalMessage(raw) {
  if (!raw || typeof raw !== 'string') return null
  for (const rule of TECHNICAL_PATTERNS) {
    if (rule.test.test(raw)) return rule.message
  }
  return null
}

function messageFromFields(fields) {
  if (!fields || typeof fields !== 'object') return null
  for (const [key, value] of Object.entries(fields)) {
    const text = Array.isArray(value) ? value[0] : value
    if (!text) continue
    const label = FIELD_LABELS[key]
    return label ? `${label}: ${text}` : String(text)
  }
  return null
}

function getStandardError(data) {
  if (!data || typeof data !== 'object') return null
  if (data.error && typeof data.error === 'object') return data.error
  return null
}

/**
 * Converte erros da API (formato padronizado) / Supabase / rede
 * em mensagem legível para o usuário.
 */
export function formatUserError(error, fallback = 'Algo deu errado. Tente novamente.') {
  if (!error) return fallback

  const status = error.status
  const data = error.data
  const standard = getStandardError(data)

  // 1) Formato padronizado do backend: { error: { code, message, fields } }
  if (standard) {
    const fromFields = messageFromFields(standard.fields)
    if (fromFields) return fromFields

    if (standard.message) {
      const technical = humanizeTechnicalMessage(standard.message)
      if (technical) return technical
      return standard.message
    }

    if (standard.code && CODE_MESSAGES[standard.code]) {
      return CODE_MESSAGES[standard.code]
    }
  }

  // 2) Status HTTP
  if (status === 0) return STATUS_MESSAGES[0]
  if (status === 401) {
    // Login inválido também é 401 — preferir mensagem do backend se houver
    if (standard?.message) return standard.message
    return STATUS_MESSAGES[401]
  }
  if (STATUS_MESSAGES[status] && status !== 400) {
    // 400 sem body padronizado cai no fallback/campo abaixo
    if (status >= 500 || status === 403 || status === 404 || status === 409) {
      return STATUS_MESSAGES[status]
    }
  }

  // 3) Legado / mensagem solta
  const rawMessage =
    (typeof data === 'string' && data) ||
    (typeof error.message === 'string' && error.message) ||
    null

  const technical = humanizeTechnicalMessage(rawMessage)
  if (technical) return technical

  if (rawMessage && !/API request failed|Failed to fetch|violates|policy|traceback/i.test(rawMessage)) {
    // Mensagens amigáveis já em português
    if (/[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(rawMessage) || /^[A-ZÀ-Ú]/.test(rawMessage)) {
      return rawMessage
    }
  }

  if (status && STATUS_MESSAGES[status]) return STATUS_MESSAGES[status]
  return fallback
}

/** @deprecated Use formatUserError */
export function formatApiError(error, fallback) {
  return formatUserError(error, fallback)
}
