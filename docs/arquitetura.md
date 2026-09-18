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
5. Login e edição de perfil ✅ (`feat/profile-settings`)
6. Seguir + posts + feed + curtidas/comentários ✅ (`feat/social-feed-interactions`)
7. Front-end React
8. Deploy final + README

Guia de deploy: [`deploy.md`](deploy.md)

## Rotas da API

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| `POST` | `/api/auth/register/` | Cadastro | ✅ |
| `POST` | `/api/auth/login/` | Login | ✅ |
| `GET`/`PATCH` | `/api/auth/profile/` | Perfil | ✅ |
| `POST`/`DELETE` | `/api/social/follow/<id>/` | Seguir / deixar de seguir | ✅ |
| `GET` | `/api/social/following/` | Quem eu sigo | ✅ |
| `GET` | `/api/social/followers/` | Meus seguidores | ✅ |
| `POST`/`GET` | `/api/posts/` | Criar / minhas posts | ✅ |
| `GET` | `/api/posts/feed/` | Feed (só seguidos) | ✅ |
| `POST`/`DELETE` | `/api/posts/<id>/like/` | Curtir | ✅ |
| `GET`/`POST` | `/api/posts/<id>/comments/` | Comentários | ✅ |
