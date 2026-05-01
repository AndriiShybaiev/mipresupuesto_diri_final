import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

export default function NotFound() {
  const { t } = useLanguage()

  return (
    <main className="not-found">
      <h1>404</h1>
      <p>{t.notFound ?? 'Page not found'}</p>
      <Link to="/dashboard">{t.goHome ?? 'Go to Dashboard'}</Link>
    </main>
  )
}
