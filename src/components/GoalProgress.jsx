import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Trophy, TrendingUp, Calendar, Dumbbell, Briefcase, PiggyBank } from 'lucide-react'

const GOALS = {
  hyrox: {
    title: 'Hyrox Bangkok',
    date: '2026-03-22',
    icon: Dumbbell,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    target: 'Unter 1:30 Stunden',
    current: 'Training läuft',
  },
  business: {
    title: 'PapaProtect Exit',
    targetAmount: 9700000, // 9.7M €
    currentAmount: 0, // Starting from 0
    monthlyTarget: 100000, // 100K €/Monat
    icon: Briefcase,
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10',
  },
  revenue: {
    title: 'Monatlicher Cashflow',
    currentAmount: 5600, // Current SEO revenue
    targetAmount: 100000, // Target
    icon: PiggyBank,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  }
}

export default function GoalProgress() {
  const [daysUntilHyrox, setDaysUntilHyrox] = useState(0)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const hyroxDate = new Date(GOALS.hyrox.date)
    const today = new Date()
    const diffTime = hyroxDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    setDaysUntilHyrox(diffDays)
  }, [])

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `€${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `€${(amount / 1000).toFixed(0)}K`
    }
    return `€${amount}`
  }

  const getProgress = (current, target) => {
    return Math.min((current / target) * 100, 100)
  }

  const hyroxProgress = Math.max(0, Math.min(100, (51 - daysUntilHyrox) / 51 * 100))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <Target size={20} className="text-yellow-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold">Ziele & Fortschritt</h3>
            <p className="text-xs text-[var(--text-secondary)]">Deine Vision 2026</p>
          </div>
        </div>
        <Trophy size={20} className="text-yellow-400" />
      </div>

      {/* Hyrox Goal */}
      <div className="mb-6 p-4 rounded-xl bg-[var(--bg-elevated)]">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${GOALS.hyrox.bgColor} flex items-center justify-center`}>
              <Dumbbell size={20} className={GOALS.hyrox.color} />
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)]">{GOALS.hyrox.title}</h4>
              <p className="text-xs text-[var(--text-secondary)]">{GOALS.hyrox.target}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${daysUntilHyrox <= 7 ? 'text-red-400' : GOALS.hyrox.color}`}>
              {daysUntilHyrox}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">Tage</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[var(--text-secondary)]">Countdown</span>
            <span className={GOALS.hyrox.color}>{Math.round(hyroxProgress)}%</span>
          </div>
          <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${hyroxProgress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            22. März 2026 • {GOALS.hyrox.current}
          </p>
        </div>
      </div>

      {/* Business Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PapaProtect Exit */}
        <div className="p-4 rounded-xl bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-lg ${GOALS.business.bgColor} flex items-center justify-center`}>
              <Briefcase size={16} className={GOALS.business.color} />
            </div>
            <div>
              <h4 className="font-medium text-sm">{GOALS.business.title}</h4>
              <p className="text-xs text-[var(--text-secondary)]">Exit-Ziel</p>
            </div>
          </div>
          
          <div className="mb-3">
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {formatCurrency(GOALS.business.targetAmount)}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              bei 8x EBITDA
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Monatsziel</span>
              <span className={GOALS.business.color}>{formatCurrency(GOALS.business.monthlyTarget)}/Monat</span>
            </div>
            <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
              <div className="h-full w-[5%] rounded-full bg-gradient-to-r from-primary-500 to-accent-cyan" />
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="p-4 rounded-xl bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-lg ${GOALS.revenue.bgColor} flex items-center justify-center`}>
              <TrendingUp size={16} className={GOALS.revenue.color} />
            </div>
            <div>
              <h4 className="font-medium text-sm">{GOALS.revenue.title}</h4>
              <p className="text-xs text-[var(--text-secondary)]">Aktueller Stand</p>
            </div>
          </div>
          
          <div className="mb-3">
            <p className="text-2xl font-bold text-green-400">
              {formatCurrency(GOALS.revenue.currentAmount)}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              von {formatCurrency(GOALS.revenue.targetAmount)}/Monat
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Fortschritt</span>
              <span className={GOALS.revenue.color}>
                {getProgress(GOALS.revenue.currentAmount, GOALS.revenue.targetAmount).toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getProgress(GOALS.revenue.currentAmount, GOALS.revenue.targetAmount)}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
              />
            </div>
          </div>

          {/* Breakdown */}
          <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Dogcare24</span>
              <span className="text-[var(--text-primary)]">€4.4K</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-[var(--text-secondary)]">Future-payments</span>
              <span className="text-[var(--text-primary)]">€1.2K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Motivation */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-accent-cyan/10 border border-primary-500/20">
        <p className="text-sm text-[var(--text-primary)]">
          🎯 <span className="font-medium">Fokus:</span> PapaProtect auf €100K/Monat skalieren für Exit bei €9.7M
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Strategie: Mo/Mi/Fr = Exit-Building | Di/Do = Cashflow sichern
        </p>
      </div>
    </motion.div>
  )
}
