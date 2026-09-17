# Decisões de arquitetura

## Visão geral

Projeto **dividido** em front-end e back-end, com comunicação via API REST.

```
[ React (frontend) ]  <--- HTTP/JSON --->  [ Django + DRF (backend) ]  --->  [ Banco ]
```

## Por que separado?

- Atende o requisito de API REST de forma explícita
- Facilita deploy independente (ex.: front no Vercel/Netlify, API no Render/Railway)
- Organiza melhor autenticação (JWT/Token), CRUD e permissões

## Apps Django previstos (próximo passo)

| App | Responsabilidade |
|-----|------------------|
| `accounts` | Cadastro, login, perfil (foto, nome, senha) |
| `social` | Seguir / seguidores |
| `posts` | Postagens, curtidas e comentários |

## Ordem de implementação sugerida

1. Preparação do repositório ✅
2. Configurar Django + DRF + banco ✅ (`feat/setup-django`)
3. Autenticação e perfil
4. Posts + feed
5. Seguir usuários
6. Curtidas e comentários
7. Front-end React
8. Deploy + README final

## Rotas da API (esqueleto)

| Prefixo | App | Status |
|---------|-----|--------|
| `/api/auth/` | `accounts` | Em breve (passo 3) |
| `/api/social/` | `social` | Em breve (passo 5) |
| `/api/posts/` | `posts` | Em breve (passos 4 e 6) |
