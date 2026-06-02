import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-7xl">⚠️</p>
        <h1 className="text-2xl font-bold text-gray-800">Something went wrong</h1>
        <p className="text-gray-500 text-sm max-w-sm">{this.state.error?.message || 'An unexpected error occurred.'}</p>
        <button onClick={() => window.location.href = '/'} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-lg transition-colors">
          Go to Shop
        </button>
      </div>
    )
    return this.props.children
  }
}
