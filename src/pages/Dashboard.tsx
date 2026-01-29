import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useTranslation } from 'react-i18next'
import Timer from '../components/Timer'
import TaskList from '../components/TaskList'
import SettingsModal from '../components/SettingsModal'
import { Settings } from 'lucide-react'

export default function Dashboard() {
  const { signOut, user, isGuest, setGuest } = useAuthStore()
  const { t } = useTranslation()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const handleSignOut = () => {
    signOut()
  }

  const handleSignIn = () => {
      setGuest(false) // This will trigger the router to show Auth component
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                Pomodoro Sync
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                title={t('common.settings')}
              >
                <Settings className="w-5 h-5" />
              </button>

              {isGuest ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded-full hidden sm:inline-block">
                    {t('common.guest_mode')}
                  </span>
                  <button
                    onClick={handleSignIn}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm"
                  >
                    {t('common.sign_in_sync')}
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-sm text-gray-600 hidden sm:block">
                    {t('common.welcome', { name: user?.user_metadata?.username || user?.email })}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                  >
                    {t('common.sign_out')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 mb-12">
          <Timer />
        </div>

        <TaskList />
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  )
}
