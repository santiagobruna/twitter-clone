import { BrandMark } from './Icons'
import './Loader.css'

export function ScreenLoader({ label = 'Carregando…' }) {
  return (
    <div className="screen-loader" role="status" aria-live="polite" aria-label={label}>
      <div className="screen-loader__card">
        <BrandMark size={36} />
        <span className="spinner spinner--lg" aria-hidden="true" />
        <p>{label}</p>
      </div>
    </div>
  )
}

export function PageLoader({ label = 'Carregando…' }) {
  return (
    <div className="page-loader" role="status" aria-live="polite" aria-label={label}>
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}

export function FeedSkeleton() {
  return (
    <div className="feed-skeleton" aria-hidden="true">
      {[0, 1, 2].map((item) => (
        <div key={item} className="skeleton-post">
          <span className="skeleton-avatar" />
          <div className="skeleton-copy">
            <span className="skeleton-line skeleton-line--sm" />
            <span className="skeleton-line" />
            <span className="skeleton-line skeleton-line--md" />
          </div>
        </div>
      ))}
    </div>
  )
}
