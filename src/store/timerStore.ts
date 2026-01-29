import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { differenceInSeconds } from 'date-fns'

export type TimerMode = 'pomodoro' | 'short_break' | 'long_break'
export type TimerStatus = 'idle' | 'running' | 'paused'

interface TimerState {
  mode: TimerMode
  status: TimerStatus
  remainingTime: number
  duration: number
  startTime: string | null
  pausedAt: string | null
  
  // Actions
  setTimer: (state: Partial<TimerState>) => void
  fetchTimer: () => Promise<void>
  subscribeToTimer: () => void
  unsubscribeFromTimer: () => void
  
  // Timer controls
  startTimer: () => Promise<void>
  pauseTimer: () => Promise<void>
  resetTimer: () => Promise<void>
  switchMode: (mode: TimerMode) => Promise<void>
  
  // Helper to calculate actual remaining time
  calculateRemaining: () => number
}

const MODES = {
  pomodoro: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
}

export const useTimerStore = create<TimerState>((set, get) => ({
  mode: 'pomodoro',
  status: 'idle',
  remainingTime: MODES.pomodoro,
  duration: MODES.pomodoro,
  startTime: null,
  pausedAt: null,
  subscription: null,

  setTimer: (state) => set(state),

  calculateRemaining: () => {
    const { status, remainingTime, startTime } = get()
    if (status === 'running' && startTime) {
      const elapsed = differenceInSeconds(new Date(), new Date(startTime))
      return Math.max(0, remainingTime - elapsed)
    }
    return remainingTime
  },

  fetchTimer: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('timers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching timer:', error)
      return
    }

    if (data) {
      // Calculate derived state
      let calculatedRemaining = data.remaining_time
      if (data.status === 'running' && data.start_time) {
        const elapsed = differenceInSeconds(new Date(), new Date(data.start_time))
        calculatedRemaining = Math.max(0, data.remaining_time - elapsed)
      }

      set({
        mode: data.mode,
        status: data.status,
        remainingTime: data.remaining_time, // This is the base remaining time stored in DB
        duration: data.duration,
        startTime: data.start_time,
        pausedAt: data.paused_at,
      })
    } else {
      // Initialize timer if not exists
      await supabase.from('timers').insert({
        user_id: user.id,
        mode: 'pomodoro',
        status: 'idle',
        remaining_time: MODES.pomodoro,
        duration: MODES.pomodoro
      })
    }
  },

  subscribeToTimer: () => {
    const { user } = supabase.auth.getUser() as any // Simplified for now
    // Actually we need the user ID. We can get it from authStore or re-fetch.
    // Better to rely on the fact that RLS protects the rows.
    
    const subscription = supabase
      .channel('timer_sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'timers',
        },
        (payload: any) => {
           // We only care about our own timer, but RLS ensures we only receive ours usually.
           // However, payload.new might be just the changed fields.
           const newData = payload.new
           if (newData) {
             set((state) => ({
               ...state,
               mode: newData.mode,
               status: newData.status,
               remainingTime: newData.remaining_time,
               duration: newData.duration,
               startTime: newData.start_time,
               pausedAt: newData.paused_at,
             }))
           }
        }
      )
      .subscribe()
      
    // Store subscription to cleanup later if needed? 
    // Zustand store is global, so maybe just one subscription is fine.
  },

  unsubscribeFromTimer: () => {
    supabase.removeAllChannels()
  },

  startTimer: async () => {
    const { remainingTime } = get()
    // When starting, we don't change remainingTime, we just set start_time to NOW.
    // But wait, if we were paused, remainingTime is correct.
    // If we were idle, remainingTime is full duration.
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const startTime = new Date().toISOString()
    
    // Optimistic update
    set({ status: 'running', startTime })

    await supabase.from('timers').update({
      status: 'running',
      start_time: startTime,
      paused_at: null,
      remaining_time: remainingTime // Keep the current base
    }).eq('user_id', user.id)
  },

  pauseTimer: async () => {
    const { calculateRemaining } = get()
    const currentRemaining = calculateRemaining()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const pausedAt = new Date().toISOString()

    // Optimistic update
    set({ status: 'paused', remainingTime: currentRemaining, pausedAt, startTime: null })

    await supabase.from('timers').update({
      status: 'paused',
      paused_at: pausedAt,
      start_time: null,
      remaining_time: currentRemaining
    }).eq('user_id', user.id)
  },

  resetTimer: async () => {
    const { mode } = get()
    const duration = MODES[mode]
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    set({ status: 'idle', remainingTime: duration, duration, startTime: null, pausedAt: null })

    await supabase.from('timers').update({
      status: 'idle',
      remaining_time: duration,
      duration: duration,
      start_time: null,
      paused_at: null
    }).eq('user_id', user.id)
  },

  switchMode: async (mode) => {
    const duration = MODES[mode]
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    set({ mode, status: 'idle', remainingTime: duration, duration, startTime: null, pausedAt: null })

    await supabase.from('timers').update({
      mode,
      status: 'idle',
      remaining_time: duration,
      duration: duration,
      start_time: null,
      paused_at: null
    }).eq('user_id', user.id)
  }
}))
