import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <div className="p-4 rounded-full bg-red-500/10">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-200">页面出现错误</h2>
            <p className="text-sm text-slate-400">
              {this.state.error?.message || '发生了未知错误'}
            </p>
            <Button
              variant="outline"
              onClick={this.handleReset}
              className="mt-2"
            >
              重试
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export { ErrorBoundary }
export default ErrorBoundary
