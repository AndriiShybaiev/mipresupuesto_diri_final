import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import Header from './Header'

const MIN_PASSWORD_LENGTH = 6
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const INITIAL_FORM = {
  email: '',
  password: '',
  fullName: '',
}

export default function AuthPage() {
  const { t } = useLanguage()
  const [authMode, setAuthMode] = useState('login')
  const [form, setForm] = useState(INITIAL_FORM)
  const [error, setError] = useState('')
  const { signIn, register } = useAuth()
  const navigate = useNavigate()

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function switchMode() {
    setError('')
    setForm(INITIAL_FORM)
    setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'))
  }

  async function onSubmit(event) {
    event.preventDefault()
    setError('')

    const email = form.email.trim()
    const password = form.password.trim()

    if (!email || !password) {
      setError(t.validationRequiredAuth)
      return
    }

    if (!EMAIL_PATTERN.test(email)) {
      setError(t.validationInvalidEmail)
      return
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t.validationPasswordMin)
      return
    }

    try {
      if (authMode === 'login') {
        await signIn({ email, password })
      } else {
        await register({ email, password, name: form.fullName.trim() })
      }
      navigate('/dashboard')
    } catch (submitError) {
      setError(submitError.message || t.authenticationFailed)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <Header appName={t.appName} logo={t.logo} showLanguage={false} />

      <div className="flex flex-1 items-center justify-center p-4">
        <section
          className="w-full max-w-lg rounded-xl border border-slate-200 p-6 bg-white shadow-sm"
          style={{ animation: 'fadeUp 420ms ease both' }}
        >
          <h2 className="text-2xl font-bold tracking-tight m-0 mb-1">{t.loginTitle}</h2>
          <p className="text-slate-500 mb-4">{t.loginHint}</p>

          <form onSubmit={onSubmit} className="grid gap-3">
            {authMode === 'register' ? (
              <label className="grid gap-1">
                <span className="font-semibold text-sm">{t.fullName}</span>
                <input
                  type="text"
                  className="min-h-10 px-3 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  value={form.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  placeholder={t.fullName}
                />
              </label>
            ) : null}

            <label className="grid gap-1">
              <span className="font-semibold text-sm">{t.email}</span>
              <input
                type="email"
                className="min-h-10 px-3 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                placeholder={t.email}
              />
            </label>

            <label className="grid gap-1">
              <span className="font-semibold text-sm">{t.password}</span>
              <input
                type="password"
                className="min-h-10 px-3 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                placeholder={t.password}
              />
            </label>

            {error ? <p className="m-0 text-sm px-3 py-2 border border-red-300 bg-red-50 text-red-800">{error}</p> : null}

            <div className="grid grid-cols-2 gap-2 mt-1">
              <button type="submit" className="rounded-md bg-teal-600 text-white px-3 py-2 cursor-pointer font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40">
                {authMode === 'login' ? t.login : t.register}
              </button>
              <button type="button" className="rounded-md border border-slate-300 bg-white px-3 py-2 cursor-pointer font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/40" onClick={switchMode}>
                {authMode === 'login' ? t.register : t.login}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}
