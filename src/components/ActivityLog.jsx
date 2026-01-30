import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function ActivityLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
    
    const subscription = supabase
      .channel('activity_logs_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'activity_logs' },
        (payload) => {
          setLogs(prev => [payload.new, ...prev].slice(0, 50))
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  async function fetchLogs() {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'task_created': return '➕'
      case 'task_updated': return '✏️'
      case 'task_completed': return '✅'
      case 'status_changed': return '🔄'
      case 'note_added': return '📝'
      default: return '•'
    }
  }

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4 h-full">
      <h2 className="text-lg font-semibold text-white mb-4">📋 Aktivitäts-Log</h2>
      
      {loading ? (
        <div className="text-gray-400 text-sm">Lade...</div>
      ) : logs.length === 0 ? (
        <div className="text-gray-500 text-sm italic">Noch keine Aktivitäten</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 text-sm border-b border-gray-800 pb-2">
              <span className="text-lg">{getActionIcon(log.action)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-300 truncate">{log.description}</p>
                <p className="text-xs text-gray-600">
                  {new Date(log.created_at).toLocaleString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
