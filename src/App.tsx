import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ToastContainer } from '@/components/ui/toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
