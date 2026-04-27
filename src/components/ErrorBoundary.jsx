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
        <main className="auth-shell">
          <section className="auth-card">
            <h2>Unexpected error</h2>
            <p>Reload the page to continue.</p>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
