# Estrutura do front-end (React + Vite)

## Stack

- React 19
- Vite 8
- React Router DOM 7

## Pastas

```
frontend/
├── public/
├── src/
│   ├── api/              # Cliente HTTP e endpoints da API
│   ├── components/       # Componentes reutilizáveis
│   │   └── layout/
│   ├── contexts/         # AuthContext (token/usuário)
│   ├── pages/            # Páginas por rota
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── package.json
└── vite.config.js
```

## Rotas previstas

| Rota | Página | Status |
|------|--------|--------|
| `/login` | Login | Placeholder |
| `/register` | Cadastro | Placeholder |
| `/` | Feed | Placeholder |
| `/profile` | Perfil | Placeholder |

## Variável de ambiente

Copie `.env.example` para `.env`:

```bash
copy .env.example .env
```

`VITE_API_URL` aponta para a API (local ou Render).

## Próximas etapas

1. Tela de cadastro e login (integrar com a API)
2. Feed + criar post
3. Perfil (nome, foto, senha)
4. Seguir / curtidas / comentários
5. Deploy do front (Vercel/Netlify) + CI
