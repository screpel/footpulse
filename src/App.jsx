// src/App.jsx
import React, { useEffect, useState } from 'react'
import { supabase } from './services/supabase'
import SessionModal from './components/SessionModal'
import { Zap, Flame, Trophy, Activity, Plus, Pencil, Cloud, CloudRain, Sun } from 'lucide-react'

export default function App() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sessionToEdit, setSessionToEdit] = useState(null)

  const fetchSessions = async () => {
    setLoading(true)
    const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('date_seance', { ascending: false })

    if (!error && data) {
      setSessions(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const handleOpenCreate = () => {
    setSessionToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (session) => {
    setSessionToEdit(session)
    setIsModalOpen(true)
  }

  // Records dynamiques
  const sprintMax = sessions.length ? Math.max(...sessions.map(s => Number(s.sprint_max_kmh))) : 0
  const tirMax = sessions.length ? Math.max(...sessions.map(s => Number(s.tir_max_kmh))) : 0
  const distMax = sessions.length ? Math.max(...sessions.map(s => Number(s.distance_km))) : 0
  const butsEnMatch = sessions
      .filter(s => s.type_seance === 'MATCH')
      .reduce((acc, s) => acc + (s.buts_reels || 0), 0)

  const records = [
    { label: 'Sprint max', value: sprintMax.toFixed(1), unit: 'km/h', icon: Zap, color: 'text-amber-400' },
    { label: 'Frappe max', value: tirMax > 0 ? tirMax.toFixed(1) : '-', unit: 'km/h', icon: Flame, color: 'text-rose-500' },
    { label: 'Distance max', value: distMax.toFixed(1), unit: 'km', icon: Activity, color: 'text-emerald-400' },
    { label: 'Buts en match', value: butsEnMatch, unit: 'buts', icon: Trophy, color: 'text-sky-400' },
  ]

  const formatTemps = (sec) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}'${s < 10 ? '0' : ''}${s}"`
  }

  const renderMeteoBadge = (temp, condition) => {
    if (!temp && !condition) return null

    const isRain = condition?.toLowerCase().includes('pluie') || condition?.toLowerCase().includes('averses')
    const isSun = condition?.toLowerCase().includes('soleil') || condition?.toLowerCase().includes('ensoleillé')

    const Icon = isRain ? CloudRain : isSun ? Sun : Cloud
    const iconColor = isRain ? 'text-sky-400' : isSun ? 'text-amber-400' : 'text-slate-400'

    return (
        <span className="text-[10px] bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1.5 border border-slate-700/50">
      <Icon className={`w-3 h-3 ${iconColor}`} />
      <span>{temp ? `${temp}°C` : ''}</span>
          {condition && <span className="text-slate-400">• {condition}</span>}
    </span>
    )
  }

  return (
      <div className="max-w-lg mx-auto p-4 sm:p-6 space-y-6">
        {/* En-tête */}
        <header className="pt-2 pb-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              FOOT<span className="text-emerald-400">PULSE</span>
            </h1>
            <p className="text-xs text-slate-400">Suivi des performances</p>
          </div>
          <button
              onClick={handleOpenCreate}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Séance
          </button>
        </header>

        {/* Records */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Records personnels</h2>
          <div className="grid grid-cols-2 gap-3">
            {records.map((r, i) => {
              const Icon = r.icon
              return (
                  <div key={i} className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${r.color}`} />
                      <span className="text-xs text-slate-400 truncate">{r.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-white">{r.value}</span>
                      <span className="text-xs text-slate-500 font-medium">{r.unit}</span>
                    </div>
                  </div>
              )
            })}
          </div>
        </section>

        {/* Liste des séances */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Historique des séances</h2>
            <span className="text-xs text-slate-500">{sessions.length} séances</span>
          </div>

          {loading ? (
              <div className="text-center py-8 text-xs text-slate-500">Chargement des données...</div>
          ) : (
              <div className="space-y-3">
                {sessions.map((s) => (
                    <div key={s.id} className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 space-y-3 group">
                      <div className="flex justify-between items-start">
                        <div>
                          {/* Remplacer cette partie : */}
                          <div className="flex items-center gap-2">
  <span className="font-bold text-sm text-white">
    {s.type_seance === 'ENTRAINEMENT' ? 'Entraînement' : 'Match'}
  </span>
                            <span className="text-xs text-slate-500">• {s.lieu}</span>
                            {renderMeteoBadge(s.temperature_c, s.meteo_temps)}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(s.date_seance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} — {formatTemps(s.temps_activite_sec)} d'activité
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md">
                      {s.distance_km} km
                    </span>
                          <button
                              onClick={() => handleOpenEdit(s)}
                              className="text-slate-500 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
                              title="Modifier la séance"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-center">
                        <div className="bg-slate-950/50 rounded-lg p-2">
                          <span className="block text-[10px] text-slate-500 uppercase">Sprint max</span>
                          <span className="text-xs font-semibold text-slate-200">{s.sprint_max_kmh} <span className="text-[10px] text-slate-500">km/h</span></span>
                        </div>
                        <div className="bg-slate-950/50 rounded-lg p-2">
                          <span className="block text-[10px] text-slate-500 uppercase">Frappe</span>
                          <span className="text-xs font-semibold text-rose-400">
                      {s.tir_max_kmh > 0 ? `${s.tir_max_kmh} km/h` : '-'}
                    </span>
                        </div>
                        <div className="bg-slate-950/50 rounded-lg p-2">
                          <span className="block text-[10px] text-slate-500 uppercase">Passes</span>
                          <span className="text-xs font-semibold text-sky-400">{s.passes}</span>
                        </div>
                        <div className="bg-slate-950/50 rounded-lg p-2">
                    <span className="block text-[10px] text-slate-500 uppercase">
                      {s.type_seance === 'MATCH' ? 'Buts' : 'Tirs'}
                    </span>
                          <span className="text-xs font-semibold text-amber-400">
                      {s.type_seance === 'MATCH' ? (s.buts_reels || 0) : (s.tirs || 0)}
                    </span>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </section>

        <SessionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSessionSaved={fetchSessions}
            sessionToEdit={sessionToEdit}
        />
      </div>
  )
}