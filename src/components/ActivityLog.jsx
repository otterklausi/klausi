import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Move, 
  MessageSquare,
  FileText,
  MoreHorizontal
} from 'lucide-react'
import { supabase } from '../supabaseClient'

const ACTION_ICONS = {
  task_created: Plus,
  task_updated: Edit3,
  task_completed: CheckCircle2,
  task_deleted: Trash2,
  task_moved: Move,
  note_added: MessageSquare,
  status_changed: MoreHorizontal,
  default: FileText
}

const ACTION_COLORS = {
  task_created: 'text-green-400 bg-green-500/20',
  task_updated: 'text-blue-400 bg-blue-500/20',
  task_completed: 'text-green-400 bg-green-500/20',
  task_deleted: 'text-red-400 bg-red-500/20',
  task_moved: 'text-yellow-400 bg-yellow-500/20',
  note_added: 'text-purple-400 bg-purple-500/20',
  status_changed: 'text-cyan-400 bg-cyan-500/20',
  default: 'text-gray-400 bg-gray-500/20'
}

export default function ActivityLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
    const subscription = supabase
      .channel('activity_logs_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, 
        (payload) => setLogs(prev => [payload.new, ...prev].slice(0, 50))
      )
      .subscribe()
    return () => subscription.unsubscribe()
  }, [])

  async function fetchLogs() {
    try {
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      setLogs(data || [])
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (date) => {
    const d = new Date(date)
    const now = new Date()
    const diff = (now - d) / 1000 // seconds

    if (diff < 60) return 'Gerade eben'
    if (diff < 3600) return `Vor ${Math.floor(diff / 60)} Min`
    if (diff < 86400) return `Vor ${Math.floor(diff / 3600)} Std`
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="h-6 bg-[var(--bg-elevated)] rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-12 bg-[var(--bg-elevated)] rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-lg">Aktivitäts-Log</h3>
        <span className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-elevated)] px-2 py-1 rounded-full">
          Live
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          <p className="text-sm">Noch keine Aktivitäten</p>
          <p className="text-xs mt-1">Hier erscheinen automatisch alle Aktionen</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          <AnimatePresence>
            {logs.map((log, index) => {
              const Icon = ACTION_ICONS[log.action] || ACTION_ICONS.default
              const colorClass = ACTION_COLORS[log.action] || ACTION_COLORS.default

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-secondary)] transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] truncate">{log.description}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{formatTime(log.created_at)}</p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
