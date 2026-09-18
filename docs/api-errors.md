# Erros da API

Formato padrão de erro:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Mensagem amigável em português",
    "fields": {
      "email": ["Informe um endereço de email válido."]
    }
  }
}
```

`fields` é opcional.

## Status HTTP usados

| Status | Quando |
|--------|--------|
| `400` | Validação / auto-seguir |
| `401` | Login inválido / sem token |
| `403` | Sem permissão (ex.: apagar post de outro) |
| `404` | Recurso inexistente / deixar de seguir quem não segue |
| `409` | Conflito (já segue / já curtiu) |
| `201` | Criação (cadastro, post, follow, like, comentário) |
| `204` | Unfollow |

## Códigos (`error.code`)

- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `CONFLICT`
- `SELF_FOLLOW`
- `ALREADY_FOLLOWING`
- `NOT_FOLLOWING`
- `ALREADY_LIKED`
- `NOT_LIKED`

No front, `formatUserError()` prioriza `error.message` / `error.fields` e cai no mapa de status/código.
