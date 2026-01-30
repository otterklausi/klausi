import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  FileText, 
  Upload,
  Wand2,
  Send,
  Image as ImageIcon,
  Tag
} from 'lucide-react'
import { supabase } from '../supabaseClient'

const STATUS_BADGES = {
  draft: { label: 'Entwurf', color: 'bg-yellow-500/20 text-yellow-400' },
  ready: { label: 'Bereit', color: 'bg-blue-500/20 text-blue-400' },
  published: { label: 'Veröffentlicht', color: 'bg-green-500/20 text-green-400' }
}

// Mock functions for AI features
const generateMetaWithAI = async (content) => {
  // TODO: Replace with real AI API
  await new Promise(resolve => setTimeout(resolve, 1500))
  const title = content.slice(0, 60).split('.')[0] || 'Blog Post'
  const description = content.slice(0, 160) || 'Beschreibung...'
  const keywords = 'hundekrankenversicherung, dogcare24, hund'
  return { title, description, keywords }
}

const generateImageWithAI = async (prompt) => {
  // TODO: Replace with Gemini Pro 3
  await new Promise(resolve => setTimeout(resolve, 2000))
  return { 
    url: `https://picsum.photos/seed/${Date.now()}/800/400`,
    prompt 
  }
}

const exportToWordPress = async (post) => {
  // TODO: Replace with real WordPress API
  await new Promise(resolve => setTimeout(resolve, 1500))
  console.log('Exporting to WordPress:', post)
  return { 
    success: true, 
    wordpress_id: Math.floor(Math.random() * 10000) + 1000,
    url: 'https://dogcare24.de/wp-admin/post.php?post=123&action=edit'
  }
}

export default function BlogPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingPost, setEditingPost] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [generatingMeta, setGeneratingMeta] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Form state
  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    meta_title: '',
    meta_description: '',
    keywords: '',
    featured_image: '',
    status: 'draft'
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  function startNewPost() {
    setForm({
      title: '',
      content: '',
      excerpt: '',
      meta_title: '',
      meta_description: '',
      keywords: '',
      featured_image: '',
      status: 'draft'
    })
    setIsCreating(true)
    setEditingPost(null)
  }

  function startEdit(post) {
    setForm({ ...post })
    setEditingPost(post)
    setIsCreating(false)
  }

  async function savePost() {
    try {
      const postData = {
        ...form,
        updated_at: new Date().toISOString()
      }

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert({ ...postData, created_at: new Date().toISOString() })
        if (error) throw error
      }

      setIsCreating(false)
      setEditingPost(null)
      fetchPosts()
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Fehler beim Speichern')
    }
  }

  async function deletePost(id) {
    if (!confirm('Wirklich löschen?')) return
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id)
      if (error) throw error
      fetchPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  async function handleGenerateMeta() {
    if (!form.content) return
    setGeneratinMeta(true)
    try {
      const meta = await generateMetaWithAI(form.content)
      setForm(prev => ({
        ...prev,
        meta_title: meta.title,
        meta_description: meta.description,
        keywords: meta.keywords
      }))
    } finally {
      setGeneratingMeta(false)
    }
  }

  async function handleGenerateImage() {
    const prompt = form.title || 'Blog post featured image'
    setGeneratingImage(true)
    try {
      const image = await generateImageWithAI(prompt)
      setForm(prev => ({ ...prev, featured_image: image.url }))
    } finally {
      setGeneratingImage(false)
    }
  }

  async function handleExportToWordPress() {
    setExporting(true)
    try {
      const result = await exportToWordPress(form)
      if (result.success) {
        // Update post with WordPress ID
        await supabase
          .from('blog_posts')
          .update({ 
            wordpress_id: result.wordpress_id, 
            status: 'published',
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPost?.id || form.id)
        
        alert(`Erfolgreich als Draft in WordPress gespeichert! ID: ${result.wordpress_id}`)
        fetchPosts()
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Fehler beim Export')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="h-8 bg-[var(--bg-elevated)] rounded w-1/3 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-[var(--bg-elevated)] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // Editor View
  if (isCreating || editingPost) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-semibold text-xl">
            {isCreating ? 'Neuer Blog Post' : 'Blog Post bearbeiten'}
          </h2>
          <button
            onClick={() => { setIsCreating(false); setEditingPost(null); }}
            className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Titel
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-xl px-4 py-3 border border-[var(--border-color)] focus:border-primary-500 focus:outline-none"
                placeholder="Titel des Blog Posts..."
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Inhalt
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-xl px-4 py-3 border border-[var(--border-color)] focus:border-primary-500 focus:outline-none resize-none"
                placeholder="Schreibe hier deinen Blog Post..."
                rows={12}
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Zusammenfassung (Excerpt)
              </label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="w-full bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-xl px-4 py-3 border border-[var(--border-color)] focus:border-primary-500 focus:outline-none resize-none"
                placeholder="Kurze Zusammenfassung..."
                rows={3}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Featured Image */}
            <div className="p-4 rounded-xl bg-[var(--bg-elevated)]">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                <ImageIcon size={16} className="inline mr-1" />
                Featured Image
              </label>
              
              {form.featured_image ? (
                <div className="relative mb-3">
                  <img 
                    src={form.featured_image} 
                    alt="Featured" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setForm({ ...form, featured_image: '' })}
                    className="absolute top-2 right-2 p-1 bg-red-500/80 text-white rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="h-32 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center mb-3 text-[var(--text-tertiary)]">
                  Kein Bild
                </div>
              )}
              
              <button
                onClick={handleGenerateImage}
                disabled={generatingImage}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg transition-colors text-sm"
              >
                <Wand2 size={16} />
                {generatingImage ? 'Generiere...' : 'Mit KI generieren'}
              </button>
            </div>

            {/* SEO / Meta Tags */}
            <div className="p-4 rounded-xl bg-[var(--bg-elevated)]">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-[var(--text-secondary)]">
                  <Tag size={16} className="inline mr-1" />
                  SEO Meta Tags
                </label>
                <button
                  onClick={handleGenerateMeta}
                  disabled={generatingMeta || !form.content}
                  className="text-xs flex items-center gap-1 px-2 py-1 bg-primary-500/20 text-primary-400 rounded hover:bg-primary-500/30"
                >
                  <Wand2 size={12} />
                  {generatingMeta ? '...' : 'KI'}
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[var(--text-tertiary)]">Meta Title</label>
                  <input
                    type="text"
                    value={form.meta_title}
                    onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                    className="w-full text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg px-3 py-2 border border-[var(--border-color)]"
                    placeholder="SEO Titel..."
                  />
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">
                    {form.meta_title?.length || 0}/60 Zeichen
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-[var(--text-tertiary)]">Meta Description</label>
                  <textarea
                    value={form.meta_description}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                    className="w-full text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg px-3 py-2 border border-[var(--border-color)] resize-none"
                    placeholder="SEO Beschreibung..."
                    rows={3}
                  />
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">
                    {form.meta_description?.length || 0}/160 Zeichen
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-[var(--text-tertiary)]">Keywords (komma-getrennt)</label>
                  <input
                    type="text"
                    value={form.keywords}
                    onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                    className="w-full text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg px-3 py-2 border border-[var(--border-color)]"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="p-4 rounded-xl bg-[var(--bg-elevated)]">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg px-3 py-2 border border-[var(--border-color)]"
              >
                <option value="draft">Entwurf</option>
                <option value="ready">Bereit</option>
                <option value="published">Veröffentlicht</option>
              </select>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={savePost}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors font-medium"
              >
                <Save size={18} />
                Speichern
              </button>
              
              {editingPost && (
                <button
                  onClick={handleExportToWordPress}
                  disabled={exporting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-xl transition-colors font-medium"
                >
                  <Send size={18} />
                  {exporting ? 'Exportiere...' : 'Zu WordPress pushen'}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // List View
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-xl">Blog Posts</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {posts.length} Posts gesamt
          </p>
        </div>
        <button
          onClick={startNewPost}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          Neuer Post
        </button>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-[var(--text-tertiary)]" />
          </div>
          <p className="text-[var(--text-secondary)]">Noch keine Blog Posts</p>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Erstelle deinen ersten Post
          </p>
          <button
            onClick={startNewPost}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg"
          >
            Post erstellen
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => {
            const statusBadge = STATUS_BADGES[post.status]
            return (
              <motion.div
                key={post.id}
                layout
                className="glass rounded-xl p-5 hover:border-primary-500/30 transition-all group"
              >
                {/* Featured Image */}
                {post.featured_image ? (
                  <img 
                    src={post.featured_image} 
                    alt={post.title}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full h-32 bg-[var(--bg-elevated)] rounded-lg mb-4 flex items-center justify-center text-[var(--text-tertiary)]">
                    <ImageIcon size={32} />
                  </div>
                )}

                {/* Status Badge */}
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-3 ${statusBadge.color}`}>
                  {statusBadge.label}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-[var(--text-primary)] mb-2 line-clamp-2">
                  {post.title || 'Untitled'}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">
                  {post.excerpt || post.content?.slice(0, 100) + '...' || 'Kein Inhalt'}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)] mb-4">
                  <span>{new Date(post.created_at).toLocaleDateString('de-DE')}</span>
                  {post.wordpress_id && (
                    <span className="text-green-400">WP: {post.wordpress_id}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(post)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[var(--bg-elevated)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg transition-colors text-sm"
                  >
                    <Edit2 size={14} />
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
