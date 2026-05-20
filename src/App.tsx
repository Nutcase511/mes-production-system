import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ToastContainer } from '@/components/ui/toast'
import { AuthProvider } from '@/contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer />
    </AuthProvider>
  )
}

export default App
