import { useEffect, useState } from 'react'
import { useTaskStore } from '../store/taskStore'
import { CheckCircle, Circle, Plus, Trash2, MoreVertical } from 'lucide-react'
import { clsx } from 'clsx'

export default function TaskList() {
  const { 
    tasks, 
    fetchTasks, 
    addTask, 
    deleteTask, 
    toggleTaskStatus,
    subscribeToTasks,
    unsubscribeFromTasks
  } = useTaskStore()

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    fetchTasks()
    subscribeToTasks()
    return () => unsubscribeFromTasks()
  }, [])

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    await addTask(newTaskTitle, 1) // Default 1 pomodoro
    setNewTaskTitle('')
    setIsAdding(false)
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Tasks</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Add Task Form */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-fade-in">
          <input
            type="text"
            placeholder="What are you working on?"
            className="w-full px-4 py-2 border-b-2 border-gray-100 focus:border-blue-500 outline-none transition text-lg"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end mt-4 gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 && !isAdding && (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            <p>No tasks yet. Add one to get started!</p>
          </div>
        )}
        
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className={clsx(
              "group bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md",
              task.status === 'completed' && "opacity-60"
            )}
          >
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => toggleTaskStatus(task.id, task.status)}
                className={clsx(
                  "transition-colors",
                  task.status === 'completed' ? "text-green-500" : "text-gray-300 hover:text-blue-500"
                )}
              >
                {task.status === 'completed' ? <CheckCircle size={24} /> : <Circle size={24} />}
              </button>
              
              <div className="flex-1">
                <h3 className={clsx(
                  "font-medium text-gray-800 transition-all",
                  task.status === 'completed' && "line-through text-gray-500"
                )}>
                  {task.title}
                </h3>
                <span className="text-xs text-gray-400">
                  {task.completed_pomodoros}/{task.estimated_pomodoros} Pomodoros
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
