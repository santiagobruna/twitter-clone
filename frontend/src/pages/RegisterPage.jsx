import { Link } from 'react-router-dom'

export function RegisterPage() {
  return (
    <section>
      <h1>Criar conta</h1>
      <p>
        Formulário de cadastro será implementado na próxima etapa
        (<code>/api/auth/register/</code>).
      </p>
      <p>
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </section>
  )
}
