import { Link } from 'react-router-dom'

import './AuthLayout.css'

export function AuthLayout({
  brandTitle,
  brandDescription,
  children,
}) {
  return (
    <div className="auth-page">
      <div className="auth-page__inner">
        <section className="auth-brand" aria-label="Apresentação">
          <Link to="/login" className="auth-brand__mark" aria-label="Chirp">
            <svg viewBox="0 0 24 24" width="48" height="48" aria-hidden="true">
              <path
                fill="currentColor"
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              />
            </svg>
          </Link>
          <h1 className="auth-brand__title">{brandTitle}</h1>
          <p className="auth-brand__text">{brandDescription}</p>
        </section>

        <section className="auth-panel">{children}</section>
      </div>
    </div>
  )
}
