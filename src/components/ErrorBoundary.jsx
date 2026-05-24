import { Component } from 'react'
import { LanguageContext } from '../contexts/LanguageContext'

class ErrorBoundary extends Component {
  static contextType = LanguageContext

  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('UI error', error, info)
  }

  render() {
    const t = this.context?.t ?? {}

    if (this.state.hasError) {
      return (
        <main className="min-h-screen grid place-items-center bg-slate-50">
          <section className="w-full max-w-md rounded-xl border border-slate-200 p-6 bg-white shadow-sm">
            <h2 className="text-xl font-bold tracking-tight m-0 mb-2">{t.errorBoundaryTitle ?? 'Unexpected error'}</h2>
            <p className="text-slate-600">{t.errorBoundaryHint ?? 'Reload the page to continue.'}</p>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
