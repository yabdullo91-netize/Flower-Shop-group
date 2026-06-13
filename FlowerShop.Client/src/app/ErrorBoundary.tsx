import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Replace with Sentry.captureException(error, { extra: info }) when monitoring is set up
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-svh flex flex-col items-center justify-center gap-6 p-8 text-center bg-cream">
          <p className="text-5xl">🌸</p>
          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-semibold text-ink">Что-то пошло не так</h1>
            <p className="text-sm text-muted max-w-xs">
              Попробуйте обновить страницу. Если ошибка повторяется — напишите нам в Telegram.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="h-11 px-6 rounded-xl bg-green-deep text-white text-sm font-semibold hover:bg-green-light transition-colors"
            >
              Обновить
            </button>
            <a
              href="https://t.me/yakubov_111"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-6 rounded-xl border border-border text-sm font-medium text-muted hover:text-ink hover:border-ink transition-colors flex items-center"
            >
              Написать в TG
            </a>
          </div>
          {import.meta.env.DEV && (
            <pre className="text-left text-xs text-error bg-error/5 border border-error/20 rounded-xl p-4 max-w-lg overflow-auto">
              {this.state.error.message}
            </pre>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
