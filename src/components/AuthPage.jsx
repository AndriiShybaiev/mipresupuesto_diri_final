import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Header from './Header'

const INITIAL_FORM = {
  email: '',
  password: '',
  fullName: '',
}

export default function AuthPage({ t }) {
  const [authMode, setAuthMode] = useState('login')
  const [form, setForm] = useState(INITIAL_FORM)
  const [error, setError] = useState('')
  const { signIn, register } = useAuth()

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function switchMode() {
    setError('')
    setForm(INITIAL_FORM)
    setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'))
  }

  function onSubmit(event) {
    event.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Email and password are required')
      return
    }

    try {
      if (authMode === 'login') {
        signIn({ email: form.email, password: form.password })
      } else {
        register({ email: form.email, password: form.password, name: form.fullName })
      }
    } catch (submitError) {
      setError(submitError.message || 'Authentication failed')
    }
  }

  return (
    <main className="auth-shell">
      <Header appName={t.appName} logo={t.logo} showLanguage={false} />

      <section className="auth-card fade-up">
        <h2>{t.loginTitle}</h2>
        <p>{t.loginHint}</p>

        <form onSubmit={onSubmit} className="auth-form">
          {authMode === 'register' ? (
            <label>
              <span>{t.fullName}</span>
              <input
                type="text"
                value={form.fullName}
                onChange={(event) => updateField('fullName', event.target.value)}
                placeholder={t.fullName}
              />
            </label>
          ) : null}

          <label>
            <span>{t.email}</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder={t.email}
            />
          </label>

          <label>
            <span>{t.password}</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              placeholder={t.password}
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <div className="auth-actions">
            <button type="submit" className="primary">
              {authMode === 'login' ? t.login : t.register}
            </button>
            <button type="button" className="ghost" onClick={switchMode}>
              {authMode === 'login' ? t.register : t.login}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
