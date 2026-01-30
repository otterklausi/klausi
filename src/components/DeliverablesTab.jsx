import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, FileText, FileSpreadsheet, Presentation, Link2, Plus } from 'lucide-react'
import { supabase } from '../supabaseClient'

const TYPE_CONFIG = {
  report: { icon: FileText, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  document: { icon: FileText, color: 'text-green-400', bgColor: 'bg-green-500/10' },
  spreadsheet: { icon: FileSpreadsheet, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  presentation: { icon: Presentation, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  link: { icon: Link2, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
}

const QUICK_LINKS = [
  { name: 'Google Drive', url: 'https://drive.google.com', icon: '📁', color: 'bg-blue-500/20 text-blue-400' },
  { name: 'Notion', url: 'https://notion.so', icon: '📝', color: 'bg-gray-500/20 text-gray-400' },
  { name: 'Dogcare24', url: 'https://dogcare24.de', icon: '🐕', color: 'bg-green-500/20 text-green-400' },
  { name: 'PapaProtect', url: 'https://papaprotect.de', icon: '🛡️', color: 'bg-purple-500/20 text-purple-400' },
]

export default function DeliverablesTab() {
  const [deliverables, setDeliverables] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeliverables()
    const subscription = supabase
      .channel('deliverables_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliverables' }, () => fetchDeliverables())
      .subscribe()
    return () => subscription.unsubscribe()
  }, [])

  async function fetchDeliverables() {
    try {
      const { data } = await supabase
        .from('deliverables')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      setDeliverables(data || [])
    } catch (error) {
      console.error('Failed to fetch deliverables:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <FileText size={20} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-xl">Deliverables</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Reports, Dokumente & Links
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4 uppercase tracking-wider">
          Quick Links
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-4 rounded-xl ${link.color} hover:scale-105 transition-transform`}
            >
              <span className="text-2xl">{link.icon}</span>
              <span className="font-medium">{link.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Deliverables Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-[var(--bg-elevated)] rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : deliverables.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-[var(--text-tertiary)]" />
          </div>
          <p className="text-[var(--text-secondary)]">Noch keine Deliverables</p>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Nutze die Scripts um Reports zu loggen
          </p>
          <code className="mt-4 inline-block px-4 py-2 bg-[var(--bg-elevated)] rounded-lg text-xs text-[var(--text-secondary)]">
            assistant-log.sh "Report erstellt"
          </code>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {deliverables.map((item, index) => {
            const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.link
            const Icon = config.icon

            return (
              <motion.a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group glass rounded-xl p-5 hover:border-primary-500/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={24} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-[var(--text-primary)] truncate group-hover:text-primary-400 transition-colors">
                        {item.title}
                      </h4>
                      <ExternalLink size={16} className="text-[var(--text-tertiary)] flex-shrink-0" />
                    </div>
                    {item.description && (
                      <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <p className="text-xs text-[var(--text-tertiary)] mt-3">
                      {new Date(item.created_at).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </motion.a>
            )
          })}
        </div>
      )}
    </div>
  )
}
