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
3. Cadastro de usuários ✅ (`feat/user-registration`)
4. Preparar API para produção ✅ (`feat/production-ready`)
5. Login e edição de perfil
6. Posts + feed
7. Seguir usuários
8. Curtidas e comentários
9. Front-end React
10. Deploy final + README

Guia de deploy: [`deploy.md`](deploy.md)

## Rotas da API

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| `POST` | `/api/auth/register/` | Cadastro de usuário | ✅ |
| — | `/api/auth/` (login/perfil) | Login e perfil | Próximo |
| — | `/api/social/` | Seguir / seguidores | Em breve |
| — | `/api/posts/` | Posts, curtidas, comentários | Em breve |
