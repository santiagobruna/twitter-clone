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
├── backend/          # API Django + DRF
├── frontend/         # Interface React
├── docs/             # Documentação do projeto
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

> Instruções completas serão preenchidas após a configuração do Django e do front-end.

### Back-end

```bash
cd backend
# python -m venv .venv
# .venv\Scripts\activate   # Windows
# pip install -r requirements.txt
# python manage.py migrate
# python manage.py runserver
```

### Front-end

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
