import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function DeliverablesTab() {
  const [deliverables, setDeliverables] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeliverables()
    
    const subscription = supabase
      .channel('deliverables_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'deliverables' },
        () => fetchDeliverables()
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  async function fetchDeliverables() {
    try {
      const { data, error } = await supabase
        .from('deliverables')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (error) throw error
      setDeliverables(data || [])
    } catch (error) {
      console.error('Failed to fetch deliverables:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'report': return '📊'
      case 'document': return '📄'
      case 'spreadsheet': return '📈'
      case 'presentation': return '📽️'
      case 'link': return '🔗'
      default: return '📎'
    }
  }

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4">
      <h2 className="text-lg font-semibold text-white mb-4">📁 Deliverables & Dokumente</h2>
      
      <div className="mb-4 p-3 bg-[#2a2a2a] rounded-lg">
        <h3 className="text-sm font-medium text-gray-300 mb-2">🔗 Quick Links</h3>
        <div className="space-y-1">
          <a 
            href="https://drive.google.com/drive/u/0/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
          >
            📂 Google Drive
          </a>
          <a 
            href="https://www.notion.so/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
          >
            📝 Notion Workspace
          </a>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Lade...</div>
      ) : deliverables.length === 0 ? (
        <div className="text-gray-500 text-sm italic">
          Noch keine Deliverables
          <br />
          <span className="text-xs">
            Nutze die Scripts um Reports zu loggen
          </span>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {deliverables.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-[#2a2a2a] rounded-lg">
              <span className="text-xl">{getTypeIcon(item.type)}</span>
              <div className="flex-1 min-w-0">
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 truncate block"
                >
                  {item.title}
                </a>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <span className="text-xs text-gray-600">
                {new Date(item.created_at).toLocaleDateString('de-DE')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
