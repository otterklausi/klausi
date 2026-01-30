import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Sun, Moon, BookOpen, PenTool, Footprints, Dumbbell } from 'lucide-react'
import { supabase } from '../supabaseClient'

const HABITS = [
  { id: 'meditation_morning', label: 'Meditation (Morgen)', icon: Sun, color: 'text-yellow-400' },
  { id: 'meditation_evening', label: 'Meditation (Abend)', icon: Moon, color: 'text-indigo-400' },
  { id: 'journaling', label: 'Journaling', icon: PenTool, color: 'text-purple-400' },
  { id: 'reading', label: 'Lesen', icon: BookOpen, color: 'text-blue-400' },
  { id: 'steps', label: '10k Schritte', icon: Footprints, color: 'text-green-400' },
  { id: 'workout', label: 'Training', icon: Dumbbell, color: 'text-orange-400' },
]

export default function DailyHabits() {
  const [completed, setCompleted] = useState({})
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchHabits()
  }, [])

  async function fetchHabits() {
    try {
      const { data } = await supabase
        .from('daily_habits')
        .select('*')
        .eq('date', today)
        .single()
      
      if (data) {
        setCompleted(data.completed || {})
        setStreak(data.streak || 0)
      }
    } catch (error) {
      console.log('No habits data yet')
    } finally {
      setLoading(false)
    }
  }

  async function toggleHabit(habitId) {
    const newCompleted = { ...completed, [habitId]: !completed[habitId] }
    setCompleted(newCompleted)

    const completedCount = Object.values(newCompleted).filter(Boolean).length
    const newStreak = completedCount === HABITS.length ? streak + 1 : streak

    try {
      await supabase
        .from('daily_habits')
        .upsert({
          date: today,
          completed: newCompleted,
          streak: newStreak,
          updated_at: new Date().toISOString()
        })
      setStreak(newStreak)
    } catch (error) {
      console.error('Error saving habit:', error)
    }
  }

  const progress = Math.round((Object.values(completed).filter(Boolean).length / HABITS.length) * 100)

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
        <div className="h-6 bg-[var(--bg-elevated)] rounded w-1/3 mb-4 animate-pulse" />
        <div className="space-y-2">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-12 bg-[var(--bg-elevated)] rounded-xl animate-pulse" />
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-semibold text-lg">Daily Habits</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-400">{progress}%</div>
          <div className="text-xs text-[var(--text-secondary)]">{streak} Tage Streak</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-[var(--bg-elevated)] rounded-full mb-6 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-cyan"
        />
      </div>

      {/* Habits List */}
      <div className="space-y-2">
        {HABITS.map((habit) => {
          const Icon = habit.icon
          const isDone = completed[habit.id]
          
          return (
            <button
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                isDone 
                  ? 'bg-green-500/10 border border-green-500/30' 
                  : 'bg-[var(--bg-elevated)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDone ? 'bg-green-500/20' : 'bg-[var(--bg-secondary)]'
              }`}>
                {isDone ? (
                  <Check size={20} className="text-green-400" />
                ) : (
                  <Icon size={20} className={habit.color} />
                )}
              </div>
              <span className={`flex-1 text-left ${isDone ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'}`}>
                {habit.label}
              </span>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
