import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { Session, User } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  isGuest: boolean
  setSession: (session: Session | null) => void
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setGuest: (isGuest: boolean) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      loading: true,
      isGuest: false,
      setSession: (session) => set({ session }),
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setGuest: (isGuest) => set({ isGuest }),
      signOut: async () => {
        await supabase.auth.signOut()
        set({ session: null, user: null, isGuest: false })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ isGuest: state.isGuest }), // Only persist isGuest state
    }
  )
)
