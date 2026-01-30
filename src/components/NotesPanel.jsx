import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function NotesPanel() {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotes()
    
    const subscription = supabase
      .channel('notes_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notes' },
        () => fetchNotes()
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  async function fetchNotes() {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (error) throw error
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

    try {
      const { error } = await supabase
        .from('notes')
        .insert({
          content: newNote.trim(),
          status: 'unread',
          created_at: new Date().toISOString()
        })
      
      if (error) throw error
      setNewNote('')
    } catch (error) {
      console.error('Failed to add note:', error)
      alert('Fehler beim Speichern')
    }
  }

  async function markAsRead(id) {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ status: 'read', updated_at: new Date().toISOString() })
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }

  async function deleteNote(id) {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4">
      <h2 className="text-lg font-semibold text-white mb-4">📝 Notizen für Klausi</h2>
      
      <form onSubmit={addNote} className="mb-4">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Neue Notiz..."
          className="w-full bg-[#2a2a2a] text-white rounded-lg p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!newNote.trim()}
          className="mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Speichern
        </button>
      </form>

      {loading ? (
        <div className="text-gray-400 text-sm">Lade...</div>
      ) : notes.length === 0 ? (
        <div className="text-gray-500 text-sm italic">Noch keine Notizen</div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {notes.map((note) => (
            <div 
              key={note.id} 
              className={`p-3 rounded-lg text-sm ${note.status === 'unread' ? 'bg-blue-900/30 border border-blue-800' : 'bg-[#2a2a2a]'}`}
            >
              <p className="text-gray-300 whitespace-pre-wrap">{note.content}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-600">
                  {new Date(note.created_at).toLocaleString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </span>
                <div className="flex gap-2">
                  {note.status === 'unread' && (
                    <button
                      onClick={() => markAsRead(note.id)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Als gelesen markieren
                    </button>
                  )}
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
