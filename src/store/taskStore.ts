import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
// 使用简单的自增计数器生成唯一 ID，避免引入 uuid 依赖
let _uuidCounter = 0
const uuidv4 = () => `guest-${Date.now()}-${++_uuidCounter}`

export type TaskStatus = 'pending' | 'in_progress' | 'completed'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  estimated_pomodoros: number
  completed_pomodoros: number
  created_at: string
}

interface TaskState {
  tasks: Task[]
  loading: boolean
  
  fetchTasks: () => Promise<void>
  addTask: (title: string, estimated_pomodoros: number) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTaskStatus: (id: string, currentStatus: TaskStatus) => Promise<void>
  subscribeToTasks: () => void
  unsubscribeFromTasks: () => void
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      loading: false,

      fetchTasks: async () => {
        set({ loading: true })
        const { data: { user } } = await supabase.auth.getUser()
        
        // If guest, tasks are already loaded via persist, just ensure loading false
        if (!user) {
          set({ loading: false })
          return
        }

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Error fetching tasks:', error)
        } else {
          set({ tasks: data || [] })
        }
        set({ loading: false })
      },

      addTask: async (title, estimated_pomodoros) => {
        const { data: { user } } = await supabase.auth.getUser()
        
        const newTaskBase = {
          title,
          estimated_pomodoros,
          status: 'pending' as TaskStatus,
          completed_pomodoros: 0,
          created_at: new Date().toISOString()
        }

        if (!user) {
           // Guest Mode: Local only
           const newTask: Task = {
             id: uuidv4(),
             ...newTaskBase
           }
           set((state) => ({ tasks: [newTask, ...state.tasks] }))
           return
        }

        // Authenticated Mode
        const newTask = {
          user_id: user.id,
          ...newTaskBase
        }

        const { data, error } = await supabase
          .from('tasks')
          .insert(newTask)
          .select()
          .single()

        if (error) {
          console.error('Error adding task:', error)
        } else if (data) {
          set((state) => ({ tasks: [data, ...state.tasks] }))
        }
      },

      updateTask: async (id, updates) => {
        // Optimistic update
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
        }))

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
          .from('tasks')
          .update(updates)
          .eq('id', id)

        if (error) {
          console.error('Error updating task:', error)
          // Revert could be implemented here if needed
        }
      },

      deleteTask: async (id) => {
        // Optimistic update
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id)
        }))

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error deleting task:', error)
        }
      },

      toggleTaskStatus: async (id, currentStatus) => {
        const newStatus: TaskStatus = currentStatus === 'completed' ? 'pending' : 'completed'
        await get().updateTask(id, { status: newStatus })
      },

      subscribeToTasks: () => {
         // Only subscribe if user is authenticated
         supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) return

             const subscription = supabase
              .channel('task_sync')
              .on(
                'postgres_changes',
                {
                  event: '*',
                  schema: 'public',
                  table: 'tasks',
                },
                (payload) => {
                   const { eventType, new: newRecord, old: oldRecord } = payload
        
                   if (eventType === 'INSERT') {
                     // Check if already exists (optimistic update)
                     const exists = get().tasks.find(t => t.id === newRecord.id)
                     if (!exists) {
                        set((state) => ({ tasks: [newRecord as Task, ...state.tasks] }))
                     }
                   } else if (eventType === 'UPDATE') {
                     set((state) => ({
                       tasks: state.tasks.map((t) => (t.id === newRecord.id ? (newRecord as Task) : t))
                     }))
                   } else if (eventType === 'DELETE') {
                     set((state) => ({
                       tasks: state.tasks.filter((t) => t.id !== oldRecord.id)
                     }))
                   }
                }
              )
              .subscribe()
         })
      },

      unsubscribeFromTasks: () => {
        supabase.removeAllChannels()
      }
    }),
    {
      name: 'task-storage',
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
)
