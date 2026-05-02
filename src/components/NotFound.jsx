import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

export default function NotFound() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen grid place-items-center text-center">
      <div className="grid gap-3">
        <h1 className="text-8xl font-bold text-teal-700 m-0">404</h1>
        <p className="text-gray-600">{t.notFound ?? 'Page not found'}</p>
        <Link to="/dashboard" className="text-teal-700 underline">
          {t.goHome ?? 'Go to Dashboard'}
        </Link>
      </div>
    </main>
  )
}
