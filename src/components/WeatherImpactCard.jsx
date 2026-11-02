// src/components/WeatherImpactCard.jsx
import { useState } from 'react'
import { Sun, Cloud, CloudRain, Thermometer, Sparkles } from 'lucide-react'

const CONDITION_ICONS = {
  SUNNY: { Icon: Sun, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  CLOUDY: { Icon: Cloud, color: 'text-slate-300', border: 'border-slate-700', bg: 'bg-slate-800/60' },
  RAINY: { Icon: CloudRain, color: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/10' }
}

const TEMP_STYLES = {
  COLD: { color: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/10' },
  MILD: { color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  WARM: { color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' }
}

export default function WeatherImpactCard({ weatherImpact }) {
  const [mode, setMode] = useState('CONDITIONS') // 'CONDITIONS' | 'TEMPERATURES'

  if (!weatherImpact || weatherImpact.totalAnalyzed === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5 text-sky-400" />
          Impact des conditions climatiques
        </h2>
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 text-center text-xs text-slate-500">
          Synchronise la météo dans tes séances pour analyser l&apos;impact de la pluie et de la température sur ses performances.
        </div>
      </section>
    )
  }

  const items =
    mode === 'CONDITIONS' ? weatherImpact.conditions : weatherImpact.temperatures

  return (
    <section className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5 text-sky-400" />
          Impact des conditions climatiques
        </h2>

        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-medium self-start sm:self-auto">
          <button
            onClick={() => setMode('CONDITIONS')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              mode === 'CONDITIONS'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ciel / Pluie
          </button>
          <button
            onClick={() => setMode('TEMPERATURES')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              mode === 'TEMPERATURES'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Température (°C)
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 space-y-3">
        {/* Synthèse automatique des insights climatiques */}
        {weatherImpact.insights.length > 0 && (
          <div className="bg-slate-950/80 border border-emerald-500/25 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              <Sparkles className="w-3 h-3" />
              Tendances observées ({weatherImpact.totalAnalyzed} séances avec météo)
            </div>
            <ul className="space-y-1 text-xs text-slate-300">
              {weatherImpact.insights.map((text, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-400">•</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Grille des 3 colonnes climatiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {items.map((bucket) => {
            const conf =
              mode === 'CONDITIONS'
                ? CONDITION_ICONS[bucket.key]
                : TEMP_STYLES[bucket.key]
            const Icon = conf?.Icon || Thermometer
            const st = bucket.stats

            return (
              <div
                key={bucket.key}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-2.5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/70">
                  <div className="flex items-center gap-1.5">
                    <span className={`p-1 rounded-md border ${conf.bg} ${conf.border}`}>
                      <Icon className={`w-3.5 h-3.5 ${conf.color}`} />
                    </span>
                    <span className="text-xs font-bold text-white">
                      {bucket.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {st ? `${st.count} séa.` : '0 séa.'}
                  </span>
                </div>

                {!st ? (
                  <div className="text-[11px] text-slate-500 py-4 text-center">
                    Aucune donnée
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-400">Rythme course</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {st.avgDistPerHour} km/h
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-400">Sprint max moy.</span>
                      <span className="font-mono font-bold text-amber-400">
                        {st.avgSprint} km/h
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-400">Cadence passes</span>
                      <span className="font-mono font-bold text-sky-400">
                        {st.avgPassesPerMin} /min
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-400">Haute intensité</span>
                      <span className="font-mono font-bold text-rose-400">
                        {st.avgHighIntensity} m
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-800/50">
                      <span className="text-[11px] text-slate-400">Effort (RPE moy.)</span>
                      <span className="font-mono font-bold text-slate-200">
                        {st.avgRpe !== null ? `${st.avgRpe} /10` : '-'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
