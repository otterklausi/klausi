import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Check, Trash2, MessageSquare, Sparkles } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function NotesPanel() {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchNotes()
    const subscription = supabase
      .channel('notes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => fetchNotes())
      .subscribe()
    return () => subscription.unsubscribe()
  }, [])

  async function fetchNotes() {
    try {
      const { data } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      setNotes(data || [])
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function addNote(e) {
    e.preventDefault()
    if (!newNote.trim()) return

    setSending(true)
    try {
      const { error } = await supabase.from('notes').insert({
        content: newNote.trim(),
        status: 'unread',
        created_at: new Date().toISOString()
      })
      if (error) throw error
      setNewNote('')
    } catch (error) {
      console.error('Failed to add note:', error)
    } finally {
      setSending(false)
    }
  }

  async function markAsRead(id) {
    try {
      await supabase.from('notes').update({ 
        status: 'read', 
        updated_at: new Date().toISOString() 
      }).eq('id', id)
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }

  async function deleteNote(id) {
    try {
      await supabase.from('notes').delete().eq('id', id)
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const unreadCount = notes.filter(n => n.status === 'unread').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <MessageSquare size={20} className="text-purple-400" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-xl">Notizen</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {unreadCount > 0 ? `${unreadCount} ungelesen` : 'Alles gelesen'}
            </p>
          </div>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={addNote} className="glass rounded-2xl p-4">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Schreibe eine Notiz für Klausi..."
          className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none resize-none min-h-[100px]"
        />
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <Sparkles size={14} />
            <span>Klausi wird benachrichtigt</span>
          </div>
          <button
            type="submit"
            disabled={!newNote.trim() || sending}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-tertiary)] text-white rounded-lg transition-all"
          >
            {sending ? 'Senden...' : <><Send size={16} /> Senden</>}
          </button>
        </div>
      </form>

      {/* Notes List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-[var(--bg-elevated)] rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={24} className="text-[var(--text-tertiary)]" />
          </div>
          <p className="text-[var(--text-secondary)]">Noch keine Notizen</p>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Schreibe etwas, ich werde es beim nächsten Check lesen
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`p-4 rounded-xl border transition-all ${
                  note.status === 'unread' 
                    ? 'bg-purple-500/5 border-purple-500/20' 
                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
                }`}
              >
                <p className="text-[var(--text-primary)] whitespace-pre-wrap">{note.content}</p>
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {new Date(note.created_at).toLocaleString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {note.status === 'unread' && (
                      <button
                        onClick={() => markAsRead(note.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg transition-colors"
                      >
                        <Check size={14} /> Gelesen
                      </button>
                    )}
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 text-[var(--text-tertiary)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
