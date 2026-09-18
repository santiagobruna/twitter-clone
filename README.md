# Clone do Twitter — Projeto Final EBAC

Aplicação de microblog inspirada no Twitter, com autenticação, perfis, feed social, curtidas e comentários.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Back-end | Python + Django REST Framework |
| Front-end | React (a definir na configuração) |
| Banco de dados | SQLite (dev) / PostgreSQL (produção) |
| API | Arquitetura REST |

## Estrutura do repositório

```
projeto-final-ebac/
├── backend/                 # API Django + DRF
│   ├── accounts/            # Auth e perfil
│   ├── social/              # Seguir / seguidores
│   ├── posts/               # Posts, curtidas, comentários
│   ├── config/              # Settings e URLs do projeto
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/                # Interface React (próximos passos)
├── docs/
├── .gitignore
└── README.md
```

## Funcionalidades

- [x] Cadastro de usuário (`POST /api/auth/register/`)
- [x] Login com autenticação segura (`POST /api/auth/login/`)
- [x] Edição de perfil (foto, nome e senha — campos opcionais)
- [x] Seguir / deixar de seguir usuários
- [x] Lista de seguidores e seguidos
- [x] Feed apenas com posts de quem o usuário segue
- [x] Curtidas e comentários em postagens
- [ ] Deploy online + este repositório no GitHub / front-end

## Como rodar (local)

### Back-end

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py runserver
```

API em: http://127.0.0.1:8000/  
Admin em: http://127.0.0.1:8000/admin/

### Cadastro de usuário

```http
POST /api/auth/register/
Content-Type: application/json

{
  "username": "bruna",
  "email": "bruna@email.com",
  "password": "suaSenhaForte123",
  "password_confirm": "suaSenhaForte123"
}
```

Resposta `201`:

```json
{
  "user": {
    "id": 1,
    "username": "bruna",
    "email": "bruna@email.com",
    "date_joined": "...",
    "profile": { "display_name": "bruna", "avatar": null, "bio": "" }
  },
  "token": "seu-token-de-acesso"
}
```

### Login

```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "bruna",
  "password": "suaSenhaForte123"
}
```

Resposta `200`: mesmo formato do cadastro (`user` + `token`).

Use o token nas próximas requisições:

```http
Authorization: Token seu-token-de-acesso
```

### Perfil (autenticado)

```http
GET /api/auth/profile/
Authorization: Token seu-token-de-acesso
```

Atualização parcial — envie **apenas** o que quiser mudar (`multipart/form-data` se houver foto):

```http
PATCH /api/auth/profile/
Authorization: Token seu-token-de-acesso
Content-Type: multipart/form-data

display_name=Bruna Santiago
avatar=<arquivo>
password=NovaSenhaForte123!
password_confirm=NovaSenhaForte123!
```

Ou só JSON, sem foto:

```http
PATCH /api/auth/profile/
Authorization: Token seu-token-de-acesso
Content-Type: application/json

{
  "display_name": "Bruna Santiago"
}
```

### Seguir usuários

```http
POST   /api/social/follow/<user_id>/
DELETE /api/social/follow/<user_id>/
GET    /api/social/following/
GET    /api/social/followers/
GET    /api/social/users/<user_id>/following/
GET    /api/social/users/<user_id>/followers/
```

Header: `Authorization: Token ...`

### Postagens, feed, curtidas e comentários

```http
POST   /api/posts/                    # criar post { "content": "Olá!" }
GET    /api/posts/                    # minhas postagens
GET    /api/posts/feed/               # só posts de quem eu sigo
GET    /api/posts/<id>/
DELETE /api/posts/<id>/               # só o autor
POST   /api/posts/<id>/like/
DELETE /api/posts/<id>/like/
GET    /api/posts/<id>/comments/
POST   /api/posts/<id>/comments/      # { "content": "..." }
DELETE /api/posts/comments/<id>/      # só o autor do comentário
```

### Front-end

> Será configurado em um passo futuro.

```bash
cd frontend
# npm install
# npm run dev
```

## Deploy

Guia completo: [`docs/deploy.md`](docs/deploy.md)

Resumo (Render):

1. Criar PostgreSQL no Render e copiar a Internal Database URL
2. Criar Web Service com Root Directory `backend`
3. Build: `bash build.sh` · Start: `gunicorn config.wsgi:application`
4. Definir `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `DATABASE_URL`, etc.
5. Testar `POST /api/auth/register/` na URL do serviço

- **URL da API:** https://twitter-clone-aqu5.onrender.com
- **Repositório:** https://github.com/santiagobruna/twitter-clone

## Autores

Projeto Final — EBAC
