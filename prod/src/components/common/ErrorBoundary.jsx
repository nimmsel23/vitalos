import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-3">
          <div className="text-fit-ink font-black uppercase tracking-widest text-sm">Etwas ist schiefgelaufen</div>
          <div className="text-fit-dim text-xs max-w-md break-words">{this.state.error.message}</div>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-2 px-4 py-2 rounded-xl bg-fit-accent text-black font-black uppercase tracking-wider text-[10px]"
          >
            Erneut versuchen
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
