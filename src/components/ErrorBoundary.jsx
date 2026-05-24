import { Component } from 'react'

class ErrorBoundary extends Component {
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
    if (this.state.hasError) {
      return (
        <main className="min-h-screen grid place-items-center bg-slate-50">
          <section className="w-full max-w-md rounded-xl border border-slate-200 p-6 bg-white shadow-sm">
            <h2 className="text-xl font-bold tracking-tight m-0 mb-2">Unexpected error</h2>
            <p className="text-slate-600">Reload the page to continue.</p>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
