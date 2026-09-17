# Clone do Twitter — Projeto Final EBAC

Aplicação de microblog inspirada no Twitter, com autenticação, perfis, feed social, curtidas e comentários.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Back-end | Python + Django REST Framework |
| Front-end | React (a definir na configuração) |
| Banco de dados | SQLite (dev) / PostgreSQL (produção, opcional) |
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

- [ ] Cadastro e login com autenticação segura
- [ ] Edição de perfil (foto, nome e senha — campos opcionais)
- [ ] Seguir / deixar de seguir usuários
- [ ] Lista de seguidores e seguidos
- [ ] Feed apenas com posts de quem o usuário segue
- [ ] Curtidas e comentários em postagens
- [ ] Deploy online + este repositório no GitHub

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

### Front-end

> Será configurado em um passo futuro.

```bash
cd frontend
# npm install
# npm run dev
```

## Deploy

- **URL da aplicação:** _(será adicionada após o deploy)_
- **Repositório:** _(será adicionado após publicar no GitHub)_

## Autores

Projeto Final — EBAC
