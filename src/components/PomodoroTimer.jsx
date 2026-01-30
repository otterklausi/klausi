import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Coffee, Brain, Trophy } from 'lucide-react'

const WORK_TIME = 25 * 60 // 25 minutes
const SHORT_BREAK = 5 * 60 // 5 minutes
const LONG_BREAK = 15 * 60 // 15 minutes

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState('work') // 'work', 'shortBreak', 'longBreak'
  const [completedSessions, setCompletedSessions] = useState(0)
  const [totalFocusTime, setTotalFocusTime] = useState(0)

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    const totalTime = mode === 'work' ? WORK_TIME : mode === 'shortBreak' ? SHORT_BREAK : LONG_BREAK
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setIsActive(false)
    setTimeLeft(newMode === 'work' ? WORK_TIME : newMode === 'shortBreak' ? SHORT_BREAK : LONG_BREAK)
  }

  const reset = () => {
    setIsActive(false)
    setTimeLeft(mode === 'work' ? WORK_TIME : mode === 'shortBreak' ? SHORT_BREAK : LONG_BREAK)
  }

  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1)
        if (mode === 'work') {
          setTotalFocusTime(time => time + 1)
        }
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
      if (mode === 'work') {
        setCompletedSessions(s => s + 1)
        // Auto-switch to break after work
        if ((completedSessions + 1) % 4 === 0) {
          switchMode('longBreak')
        } else {
          switchMode('shortBreak')
        }
      } else {
        // Auto-switch to work after break
        switchMode('work')
      }
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft, mode, completedSessions])

  const getModeConfig = () => {
    switch (mode) {
      case 'work':
        return { 
          icon: Brain, 
          color: 'text-primary-400', 
          bgColor: 'bg-primary-500/10',
          gradient: 'from-primary-500 to-accent-cyan',
          label: 'Fokus'
        }
      case 'shortBreak':
        return { 
          icon: Coffee, 
          color: 'text-green-400', 
          bgColor: 'bg-green-500/10',
          gradient: 'from-green-500 to-emerald-400',
          label: 'Kurze Pause'
        }
      case 'longBreak':
        return { 
          icon: Coffee, 
          color: 'text-purple-400', 
          bgColor: 'bg-purple-500/10',
          gradient: 'from-purple-500 to-pink-400',
          label: 'Lange Pause'
        }
    }
  }

  const config = getModeConfig()
  const Icon = config.icon
  const progress = getProgress()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center`}>
            <Icon size={20} className={config.color} />
          </div>
          <div>
            <h3 className="font-display font-semibold">Pomodoro</h3>
            <p className="text-xs text-[var(--text-secondary)]">{config.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <Trophy size={14} className="text-yellow-400" />
          <span>{completedSessions} Sessions</span>
        </div>
      </div>

      {/* Timer Circle */}
      <div className="relative flex items-center justify-center mb-6">
        <svg className="w-48 h-48 transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="var(--bg-elevated)"
            strokeWidth="8"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
            className="transition-all duration-1000"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={`text-${config.gradient.split(' ')[0].replace('from-', '')}`} stopColor="currentColor" />
              <stop offset="100%" className={`text-${config.gradient.split(' ')[1].replace('to-', '')}`} stopColor="currentColor" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-display font-bold ${config.color} tabular-nums`}>
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm text-[var(--text-secondary)] mt-2">
            {isActive ? 'Läuft...' : 'Pausiert'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isActive 
              ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
              : 'bg-primary-500 text-white hover:bg-primary-600 shadow-glow'
          }`}
        >
          {isActive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </button>
        <button
          onClick={reset}
          className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-[var(--bg-elevated)] rounded-xl">
        {['work', 'shortBreak', 'longBreak'].map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              mode === m 
                ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {m === 'work' ? 'Fokus' : m === 'shortBreak' ? 'Kurz' : 'Lang'}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-400">{completedSessions}</p>
            <p className="text-xs text-[var(--text-secondary)]">Sessions heute</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent-cyan">
              {Math.floor(totalFocusTime / 60)}m
            </p>
            <p className="text-xs text-[var(--text-secondary)]">Fokus-Zeit</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
