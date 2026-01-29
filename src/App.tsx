import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import Auth from './components/Auth'
import Dashboard from './pages/Dashboard'

function App() {
  const { session, setSession, setUser, setLoading, loading } = useAuthStore()

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes on auth state (logged in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setSession, setUser, setLoading])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {!session ? <Auth /> : <Dashboard />}
    </div>
  )
}

export default App
