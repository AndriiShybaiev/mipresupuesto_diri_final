import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import Header from './Header'

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

    if (!form.email || !form.password) {
      setError('Email and password are required')
      return
    }

    try {
      if (authMode === 'login') {
        await signIn({ email: form.email, password: form.password })
      } else {
        await register({ email: form.email, password: form.password, name: form.fullName })
      }
      navigate('/dashboard')
    } catch (submitError) {
      setError(submitError.message || 'Authentication failed')
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-teal-50/40">
      <Header appName={t.appName} logo={t.logo} showLanguage={false} />

      <div className="flex flex-1 items-center justify-center p-4">
        <section
          className="w-full max-w-lg border-2 border-gray-800 p-6 bg-white shadow-md"
          style={{ animation: 'fadeUp 420ms ease both' }}
        >
          <h2 className="text-2xl font-bold m-0 mb-1">{t.loginTitle}</h2>
          <p className="text-gray-500 mb-4">{t.loginHint}</p>

          <form onSubmit={onSubmit} className="grid gap-3">
            {authMode === 'register' ? (
              <label className="grid gap-1">
                <span className="font-semibold text-sm">{t.fullName}</span>
                <input
                  type="text"
                  className="min-h-9 px-2 border border-gray-300 bg-white"
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
                className="min-h-9 px-2 border border-gray-300 bg-white"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                placeholder={t.email}
              />
            </label>

            <label className="grid gap-1">
              <span className="font-semibold text-sm">{t.password}</span>
              <input
                type="password"
                className="min-h-9 px-2 border border-gray-300 bg-white"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                placeholder={t.password}
              />
            </label>

            {error ? <p className="m-0 text-red-700 font-semibold text-sm">{error}</p> : null}

            <div className="grid grid-cols-2 gap-2 mt-1">
              <button type="submit" className="bg-teal-700 text-white border-2 border-teal-800 px-3 py-2 cursor-pointer hover:bg-teal-800">
                {authMode === 'login' ? t.login : t.register}
              </button>
              <button type="button" className="border-2 border-gray-800 bg-white px-3 py-2 cursor-pointer hover:bg-gray-100" onClick={switchMode}>
                {authMode === 'login' ? t.register : t.login}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}
