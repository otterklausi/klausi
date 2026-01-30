import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Zap, Moon, Activity, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function WhoopWidget() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchWhoopData = async () => {
    try {
      setLoading(true)
      
      // Fetch from Supabase (data is synced via backend script)
      const { data: whoopData, error: dbError } = await supabase
        .from('whoop_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (dbError && dbError.code !== 'PGRST116') {
        throw dbError
      }

      if (whoopData) {
        setData(whoopData)
        setLastUpdated(new Date(whoopData.created_at))
      } else {
        // No data yet - show placeholder
        setError('Whoop Daten werden synchronisiert...')
      }
    } catch (err) {
      console.error('Error fetching Whoop data:', err)
      setError('Whoop Daten konnten nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWhoopData()
    // Refresh every 5 minutes
    const interval = setInterval(fetchWhoopData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500/10'
    if (score >= 60) return 'bg-yellow-500/10'
    return 'bg-red-500/10'
  }

  const formatTimeAgo = (date) => {
    if (!date) return ''
    const minutes = Math.floor((new Date() - date) / 60000)
    if (minutes < 1) return 'Gerade eben'
    if (minutes < 60) return `Vor ${minutes} Min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Vor ${hours} Std`
    return `Vor ${Math.floor(hours / 24)} Tagen`
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 animate-pulse" />
          <div className="h-6 w-24 bg-[var(--bg-elevated)] rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-[var(--bg-elevated)] rounded-xl animate-pulse" />
          ))}
        </div>
      </motion.div>
    )
  }

  if (error || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Heart size={20} className="text-red-400" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Whoop</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
          <button 
            onClick={fetchWhoopData}
            className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-4">
            <Activity size={24} className="text-[var(--text-tertiary)]" />
          </div>
          <p className="text-sm text-[var(--text-secondary)]">{error || 'Keine Whoop Daten verfügbar'}</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Die Synchronisation läuft im Hintergrund
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <Heart size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold">Whoop</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {lastUpdated ? formatTimeAgo(lastUpdated) : 'Aktuell'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getScoreBg(data.recovery)} ${getScoreColor(data.recovery)}`}>
            Recovery: {data.recovery}%
          </div>
          <button 
            onClick={fetchWhoopData}
            className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Recovery */}
        <div className="p-4 rounded-xl bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className={getScoreColor(data.recovery)} />
            <span className="text-xs text-[var(--text-secondary)]">Recovery</span>
          </div>
          <div className="flex items-end gap-2">
            <span className={`text-2xl font-bold ${getScoreColor(data.recovery)}`}>
              {data.recovery}%
            </span>
          </div>
          <div className="mt-2 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                data.recovery >= 80 ? 'bg-green-500' : 
                data.recovery >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${data.recovery}%` }}
            />
          </div>
        </div>

        {/* Sleep */}
        <div className="p-4 rounded-xl bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2 mb-2">
            <Moon size={16} className="text-indigo-400" />
            <span className="text-xs text-[var(--text-secondary)]">Schlaf</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-indigo-400">
              {data.sleep_hours ? `${data.sleep_hours}h` : '--'}
            </span>
          </div>
          {data.sleep_score && (
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Score: {data.sleep_score}%
            </p>
          )}
        </div>

        {/* Strain */}
        <div className="p-4 rounded-xl bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-orange-400" />
            <span className="text-xs text-[var(--text-secondary)]">Strain</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-orange-400">
              {data.strain || '--'}
            </span>
          </div>
          {data.strain && (
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {data.strain < 10 ? 'Leicht' : data.strain < 15 ? 'Moderat' : 'Hoch'}
            </p>
          )}
        </div>

        {/* HRV & RHR */}
        <div className="p-4 rounded-xl bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={16} className="text-pink-400" />
            <span className="text-xs text-[var(--text-secondary)]">HRV / RHR</span>
          </div>
          <div className="flex items-end gap-3">
            {data.hrv && (
              <div>
                <span className="text-lg font-bold text-pink-400">{data.hrv}</span>
                <span className="text-xs text-[var(--text-secondary)] ml-1">ms</span>
              </div>
            )}
            {data.hrv && data.resting_hr && <div className="w-px h-6 bg-[var(--border-color)]" />}
            {data.resting_hr && (
              <div>
                <span className="text-lg font-bold text-cyan-400">{data.resting_hr}</span>
                <span className="text-xs text-[var(--text-secondary)] ml-1">bpm</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workout Data */}
      {data.calories && (
        <div className="mb-4 p-4 rounded-xl bg-[var(--bg-elevated)]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)]">Kalorien (heute)</span>
            <span className="text-lg font-bold text-[var(--text-primary)]">{data.calories.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div className={`p-4 rounded-xl ${getScoreBg(data.recovery)} border ${
        data.recovery >= 80 ? 'border-green-500/30' : 
        data.recovery >= 60 ? 'border-yellow-500/30' : 'border-red-500/30'
      }`}>
        <p className="text-sm font-medium text-[var(--text-primary)]">
          💡 Empfehlung:
        </p>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {data.recommendation || (
            data.recovery >= 80 
              ? 'Super Recovery! Heute ist ein guter Tag für intensives Training.'
              : data.recovery >= 60
              ? 'Mäßige Recovery. Moderates Training oder aktive Erholung empfohlen.'
              : 'Niedrige Recovery. Focus auf Schlaf und leichte Bewegung.'
          )}
        </p>
      </div>
    </motion.div>
  )
}
