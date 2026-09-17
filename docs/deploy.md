# Deploy da API (Render + PostgreSQL)

Guia rápido para subir o back-end em produção.

## Pré-requisitos

- Código desta branch (`feat/production-ready`) no GitHub
- Conta no [Render](https://render.com)

## 1. Criar o PostgreSQL

1. No Render: **New → PostgreSQL**
2. Nome sugerido: `twitter-clone-db`
3. Crie o banco e copie a **Internal Database URL**

## 2. Criar o Web Service

1. **New → Web Service** → conecte o repositório
2. Configuração:

| Campo | Valor |
|--------|--------|
| Root Directory | `backend` |
| Runtime | Python 3 |
| Build Command | `bash build.sh` |
| Start Command | `gunicorn config.wsgi:application` |

## 3. Variáveis de ambiente

No Web Service → **Environment**:

| Key | Value |
|-----|--------|
| `SECRET_KEY` | Chave longa e aleatória (não use a de desenvolvimento) |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `.onrender.com` (ou o host exato do serviço) |
| `DATABASE_URL` | Internal Database URL do Postgres |
| `DATABASE_SSL_REQUIRE` | `True` |
| `CSRF_TRUSTED_ORIGINS` | `https://SEU-APP.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` (depois adicione a URL do front) |
| `SECURE_SSL_REDIRECT` | `True` |

## 4. Deploy e teste

1. Faça o deploy e aguarde o build terminar
2. Teste o cadastro:

```http
POST https://SEU-APP.onrender.com/api/auth/register/
Content-Type: application/json

{
  "username": "bruna",
  "email": "bruna@email.com",
  "password": "SenhaForte123!",
  "password_confirm": "SenhaForte123!"
}
```

Esperado: status `201` com `user` e `token`.

## Observações

- No plano free o serviço pode “dormir”; a primeira request demora mais
- Avatares em `media/` no disco do Render não são persistentes a longo prazo (ok para o curso; depois use S3/Cloudinary)
- Localmente continue com SQLite (`DEBUG=True`, sem `DATABASE_URL`)
