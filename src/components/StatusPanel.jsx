import { useState, useEffect } from 'react'
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
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ai_status' },
        () => fetchStatus()
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  async function fetchStatus() {
    try {
      const { data, error } = await supabase
        .from('ai_status')
        .select('*')
        .eq('id', 'klausi')
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch status:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (state) => {
    switch (state) {
      case 'working': return 'bg-green-500'
      case 'idle': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (state) => {
    switch (state) {
      case 'working': return 'Arbeitet'
      case 'idle': return 'Bereit'
      case 'offline': return 'Offline'
      default: return 'Unbekannt'
    }
  }

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6">
        <div className="text-gray-400">Lade Status...</div>
      </div>
    )
  }

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">🤖 Klausi Status</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(status.state)} animate-pulse`} />
          <span className="text-sm text-gray-300">{getStatusText(status.state)}</span>
        </div>
      </div>
      
      {status.current_task && (
        <div className="mb-3">
          <span className="text-xs text-gray-500 uppercase">Aktuelle Aufgabe</span>
          <p className="text-white text-sm mt-1">{status.current_task}</p>
        </div>
      )}
      
      {status.updated_at && (
        <div className="text-xs text-gray-600">
          Letztes Update: {new Date(status.updated_at).toLocaleString('de-DE')}
        </div>
      )}
    </div>
  )
}
