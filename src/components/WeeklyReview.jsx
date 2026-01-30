import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, CheckCircle2, Clock, Target, TrendingUp, Calendar } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function WeeklyReview() {
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    tasksCreated: 0,
    focusTime: 0,
    habitsCompleted: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWeeklyStats()
  }, [])

  async function fetchWeeklyStats() {
    try {
      const now = new Date()
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1)) // Monday
      weekStart.setHours(0, 0, 0, 0)

      // Fetch tasks completed this week
      const { data: completedTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'done')
        .gte('updated_at', weekStart.toISOString())

      // Fetch tasks created this week
      const { data: createdTasks } = await supabase
        .from('tasks')
        .select('*')
        .gte('created_at', weekStart.toISOString())

      // Fetch habits this week
      const { data: habits } = await supabase
        .from('daily_habits')
        .select('*')
        .gte('date', weekStart.toISOString().split('T')[0])

      const habitsCompleted = habits?.reduce((sum, h) => {
        return sum + Object.values(h.completed || {}).filter(Boolean).length
      }, 0) || 0

      setStats({
        tasksCompleted: completedTasks?.length || 0,
        tasksCreated: createdTasks?.length || 0,
        focusTime: (completedTasks?.length || 0) * 25, // Rough estimate: 25min per task
        habitsCompleted,
      })
    } catch (error) {
      console.error('Error fetching weekly stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  const today = new Date().getDay() || 7 // 1-7 (Monday-Sunday)

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
        <div className="h-6 bg-[var(--bg-elevated)] rounded w-1/3 mb-4 animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-[var(--bg-elevated)] rounded-xl animate-pulse" />
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <BarChart3 size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">Weekly Review</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              KW {new Date().toLocaleDateString('de-DE', { week: 'numeric' })}
            </p>
          </div>
        </div>
        <button 
          onClick={fetchWeeklyStats}
          className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
        >
          <Calendar size={18} />
        </button>
      </div>

      {/* Week Progress */}
      <div className="flex justify-between mb-6">
        {weekDays.map((day, i) => (
          <div key={day} className="flex flex-col items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                i + 1 <= today 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
              }`}
            >
              {i + 1 < today ? '✓' : day.charAt(0)}
            </div>
          </div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-green-400" />
            <span className="text-xs text-[var(--text-secondary)]">Tasks Erledigt</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.tasksCompleted}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            +{stats.tasksCreated} neue
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-blue-400" />
            <span className="text-xs text-[var(--text-secondary)]">Fokus-Zeit</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {Math.floor(stats.focusTime / 60)}h
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Diese Woche
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-purple-400" />
            <span className="text-xs text-[var(--text-secondary)]">Habits</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.habitsCompleted}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Erledigt
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-orange-400" />
            <span className="text-xs text-[var(--text-secondary)]">Produktivität</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.tasksCompleted > 0 ? Math.min(100, Math.round((stats.tasksCompleted / 20) * 100)) : 0}%
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Ziel: 20 Tasks/Woche
          </p>
        </div>
      </div>

      {/* Motivation */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-accent-cyan/10 border border-primary-500/20">
        <p className="text-sm text-[var(--text-primary)]">
          {stats.tasksCompleted >= 15 
            ? '🚀 Super Woche! Du bist auf Kurs.' 
            : stats.tasksCompleted >= 10 
            ? '💪 Gute Woche! Weiter so.' 
            : stats.tasksCompleted >= 5 
            ? '🎯 Steigere das Tempo für deine Ziele.' 
            : '🔥 Neue Woche, neues Glück!'}
        </p>
      </div>
    </motion.div>
  )
}
