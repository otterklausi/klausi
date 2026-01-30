import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Cpu, Clock, Zap } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function StatusPanel() {
  const [status, setStatus] = useState({
    state: 'idle',
    current_task: null,
    updated_at: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatus()
    const subscription = supabase
      .channel('ai_status_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_status' }, () => fetchStatus())
      .subscribe()
    return () => subscription.unsubscribe()
  }, [])

  async function fetchStatus() {
    try {
      const { data } = await supabase.from('ai_status').select('*').eq('id', 'klausi').single()
      if (data) setStatus(data)
    } catch (error) {
      console.error('Failed to fetch status:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (state) => {
    switch (state) {
      case 'working':
        return {
          icon: Zap,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30',
          pulse: true,
          label: 'Arbeitet'
        }
      case 'idle':
        return {
          icon: Clock,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/30',
          pulse: false,
          label: 'Bereit'
        }
      case 'offline':
        return {
          icon: Activity,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/30',
          pulse: false,
          label: 'Offline'
        }
      default:
        return {
          icon: Cpu,
          color: 'text-primary-400',
          bgColor: 'bg-primary-500/20',
          borderColor: 'border-primary-500/30',
          pulse: false,
          label: 'Unbekannt'
        }
    }
  }

  const config = getStatusConfig(status.state)
  const Icon = config.icon

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 animate-pulse">
        <div className="h-8 bg-[var(--bg-elevated)] rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-[var(--bg-elevated)] rounded w-3/4"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`glass rounded-2xl p-6 border ${config.borderColor}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center`}>
            <Icon size={24} className={config.color} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">Klausi Status</h3>
            <div className="flex items-center gap-2">
              {config.pulse && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
              <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
            </div>
          </div>
        </div>
      </div>

      {status.current_task && (
        <div className="mb-4 p-4 bg-[var(--bg-elevated)] rounded-xl">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Aktuelle Aufgabe</p>
          <p className="text-[var(--text-primary)] font-medium">{status.current_task}</p>
        </div>
      )}

      {status.updated_at && (
        <p className="text-xs text-[var(--text-tertiary)]">
          Letztes Update: {new Date(status.updated_at).toLocaleString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
          })}
        </p>
      )}
    </motion.div>
  )
}
