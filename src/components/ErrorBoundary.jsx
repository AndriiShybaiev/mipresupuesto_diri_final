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
        <main className="min-h-screen grid place-items-center">
          <section className="w-full max-w-md border-2 border-gray-800 p-6 bg-white">
            <h2 className="text-xl font-bold m-0 mb-2">Unexpected error</h2>
            <p className="text-gray-600">Reload the page to continue.</p>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
