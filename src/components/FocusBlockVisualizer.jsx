import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Briefcase, Target, Zap, Coffee } from 'lucide-react'

const FOCUS_BLOCKS = {
  monday: { type: 'papaprotect', label: 'PapaProtect', icon: Briefcase, color: 'from-purple-500 to-pink-500' },
  tuesday: { type: 'seo', label: 'SEO Kunden', icon: Target, color: 'from-blue-500 to-cyan-500' },
  wednesday: { type: 'papaprotect', label: 'PapaProtect', icon: Briefcase, color: 'from-purple-500 to-pink-500' },
  thursday: { type: 'seo', label: 'SEO Kunden', icon: Target, color: 'from-blue-500 to-cyan-500' },
  friday: { type: 'papaprotect', label: 'PapaProtect', icon: Briefcase, color: 'from-purple-500 to-pink-500' },
  saturday: { type: 'recovery', label: 'Recovery', icon: Coffee, color: 'from-green-500 to-emerald-500' },
  sunday: { type: 'planning', label: 'Weekly Planning', icon: Zap, color: 'from-yellow-500 to-orange-500' },
}

export default function FocusBlockVisualizer() {
  const [currentBlock, setCurrentBlock] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)

  const now = new Date()
  const dayName = now.toLocaleDateString('en-US', { weekday: 'lowercase' })
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTime = currentHour * 60 + currentMinute

  // Focus block is 9:30 - 12:30 (570 - 750 minutes)
  const blockStart = 9 * 60 + 30 // 9:30
  const blockEnd = 12 * 60 + 30 // 12:30

  useEffect(() => {
    const updateBlock = () => {
      const block = FOCUS_BLOCKS[dayName]
      setCurrentBlock(block)

      if (currentTime >= blockStart && currentTime < blockEnd) {
        setIsActive(true)
        setTimeLeft(blockEnd - currentTime)
      } else if (currentTime < blockStart) {
        setIsActive(false)
        setTimeLeft(blockStart - currentTime)
      } else {
        setIsActive(false)
        setTimeLeft(0)
      }
    }

    updateBlock()
    const interval = setInterval(updateBlock, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [dayName, currentTime])

  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hrs}:${mins.toString().padStart(2, '0')}`
  }

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hrs > 0) return `${hrs}h ${mins}m`
    return `${mins}m`
  }

  if (!currentBlock) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
        <div className="h-20 bg-[var(--bg-elevated)] rounded-xl animate-pulse" />
      </motion.div>
    )
  }

  const Icon = currentBlock.icon
  const progress = isActive ? ((750 - currentTime) / 180) * 100 : 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentBlock.color} flex items-center justify-center`}>
            <Icon size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">Fokus-Block</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {isActive ? 'Läuft gerade' : currentTime < blockStart ? 'Startet bald' : 'Beendet'}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isActive ? 'bg-green-500/20 text-green-400' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
        }`}>
          {isActive ? '🔥 Aktiv' : '⏸️ Pausiert'}
        </div>
      </div>

      {/* Current Block Info */}
      <div className="mb-6 p-4 rounded-xl bg-[var(--bg-elevated)]">
        <p className="text-sm text-[var(--text-secondary)] mb-1">Heutiger Fokus</p>
        <p className="text-xl font-bold text-[var(--text-primary)]">{currentBlock.label}</p>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          9:30 - 12:30 Uhr (3 Stunden Deep Work)
        </p>
      </div>

      {/* Timer */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--text-secondary)]">
            {isActive ? 'Verbleibende Zeit' : currentTime < blockStart ? 'Startet in' : 'Nächster Block morgen'}
          </span>
          <span className="text-2xl font-bold tabular-nums">
            {isActive || currentTime < blockStart ? formatDuration(timeLeft) : '--:--'}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${isActive ? progress : currentTime < blockStart ? 0 : 100}%` }}
            className={`h-full rounded-full bg-gradient-to-r ${currentBlock.color}`}
          />
        </div>
      </div>

      {/* Week Overview */}
      <div className="grid grid-cols-7 gap-1">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day, i) => {
          const dayKey = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][i]
          const block = FOCUS_BLOCKS[dayKey]
          const isToday = dayKey === dayName
          
          return (
            <div 
              key={day}
              className={`text-center p-2 rounded-lg ${
                isToday 
                  ? 'bg-primary-500/20 border border-primary-500/30' 
                  : 'bg-[var(--bg-elevated)]'
              }`}
            >
              <p className="text-xs text-[var(--text-secondary)]">{day}</p>
              <div className={`w-6 h-6 rounded mx-auto mt-1 bg-gradient-to-br ${block.color}`} />
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
