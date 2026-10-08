import React from 'react'
import { Zap, Flame, Trophy, Activity } from 'lucide-react'

export default function App() {
  const records = [
    { label: 'Sprint max', value: '16.4', unit: 'km/h', icon: Zap, color: 'text-amber-400' },
    { label: 'Frappe max', value: '55.3', unit: 'km/h', icon: Flame, color: 'text-rose-500' },
    { label: 'Distance max', value: '5.0', unit: 'km', icon: Activity, color: 'text-emerald-400' },
    { label: 'Buts marqués', value: '2', unit: 'buts', icon: Trophy, color: 'text-sky-400' },
  ]

  return (
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* En-tête */}
        <header className="pt-4 pb-2 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              FOOT<span className="text-emerald-400">PULSE</span>
            </h1>
            <p className="text-xs text-slate-400">Suivi des performances U13F</p>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-medium">
          Saison 2026-2027
        </span>
        </header>

        {/* Cartes Records */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Records personnels
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {records.map((r, i) => {
              const Icon = r.icon
              return (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${r.color}`} />
                      <span className="text-xs text-slate-400 truncate">{r.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">{r.value}</span>
                      <span className="text-xs text-slate-400">{r.unit}</span>
                    </div>
                  </div>
              )
            })}
          </div>
        </section>

        {/* Dernières séances */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Dernières séances
          </h2>
          <div className="space-y-2">
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm text-white">Entraînement — Bondues</p>
                <p className="text-xs text-slate-400">8 oct. 2026 • 28' d'activité • 2 buts</p>
              </div>
              <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">
              5.0 km
            </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm text-white">Entraînement — Bondues</p>
                <p className="text-xs text-slate-400">7 oct. 2026 • 20' d'activité • 125 passes</p>
              </div>
              <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded">
              4.1 km
            </span>
            </div>
          </div>
        </section>
      </div>
  )
}