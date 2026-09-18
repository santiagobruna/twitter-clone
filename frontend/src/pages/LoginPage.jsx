import { Link } from 'react-router-dom'

export function LoginPage() {
  return (
    <section>
      <h1>Entrar</h1>
      <p>
        Formulário de login será implementado na próxima etapa
        (<code>/api/auth/login/</code>).
      </p>
      <p>
        Não tem conta? <Link to="/register">Cadastre-se</Link>
      </p>
    </section>
  )
}
