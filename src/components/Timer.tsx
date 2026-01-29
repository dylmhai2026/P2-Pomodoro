import { useEffect, useState } from 'react'
import { useTimerStore, TimerMode } from '../store/timerStore'
import { Play, Pause, RotateCcw, Coffee, Brain, Armchair } from 'lucide-react'
import { clsx } from 'clsx'

export default function Timer() {
  const { 
    mode, 
    status, 
    duration,
    calculateRemaining, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    switchMode,
    fetchTimer,
    subscribeToTimer,
    unsubscribeFromTimer
  } = useTimerStore()

  // Local state for smooth UI updates
  const [displayTime, setDisplayTime] = useState(duration)

  // Initialize and subscribe
  useEffect(() => {
    fetchTimer()
    subscribeToTimer()
    return () => unsubscribeFromTimer()
  }, [])

  // Update display tick
  useEffect(() => {
    const tick = () => {
      const remaining = calculateRemaining()
      setDisplayTime(remaining)
      
      // Update document title
      const minutes = Math.floor(remaining / 60)
      const seconds = remaining % 60
      document.title = `${minutes}:${seconds.toString().padStart(2, '0')} - Pomodoro Sync`
    }

    tick() // Initial update
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [calculateRemaining, status, duration]) // Dependencies might need tuning

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const progress = ((duration - displayTime) / duration) * 100

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Mode Switcher */}
      <div className="flex bg-gray-200 p-1 rounded-full mb-8">
        {(['pomodoro', 'short_break', 'long_break'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={clsx(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
              mode === m 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {m === 'pomodoro' && <Brain size={16} />}
            {m === 'short_break' && <Coffee size={16} />}
            {m === 'long_break' && <Armchair size={16} />}
            <span className="capitalize">{m.replace('_', ' ')}</span>
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="relative mb-8">
        {/* Progress Ring (simplified for now, can be SVG) */}
        <div className="text-8xl font-bold text-gray-800 font-mono tracking-tighter">
          {formatTime(displayTime)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        {status === 'running' ? (
          <button
            onClick={() => pauseTimer()}
            className="flex items-center gap-2 px-8 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition font-semibold"
          >
            <Pause size={24} /> Pause
          </button>
        ) : (
          <button
            onClick={() => startTimer()}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-lg shadow-blue-200"
          >
            <Play size={24} /> Start
          </button>
        )}
        
        <button
          onClick={() => resetTimer()}
          className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition"
          aria-label="Reset Timer"
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  )
}
