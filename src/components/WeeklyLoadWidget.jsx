// src/components/WeeklyLoadWidget.jsx
import { Calendar, Activity, Zap, Flame, Dumbbell } from 'lucide-react'
import { calculateWeeklySummary } from '../domain/sessionMetrics'
import { getWeeklyLoadBadgeStyle } from './rpeTheme'

export default function WeeklyLoadWidget({ sessions = [], showHistory = false }) {
  const {
    monday,
    sunday,
    totalSessions,
    matchCount,
    trainCount,
    totalDistanceKm,
    totalHighIntensityM,
    totalCharge,
    loadLevel,
    loadLabel,
    chronicCharge,
    formLabel,
    weekHistory
  } = calculateWeeklySummary(sessions)

  const formatShortDate = (date) =>
    date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  const badgeStyle = getWeeklyLoadBadgeStyle(loadLevel)
  const maxWeekCharge = Math.max(...weekHistory.map(w => w.totalCharge), 1)

  return (
    <section className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          Charge de la semaine
        </h2>
        <span className="text-[11px] text-slate-400">
          Lun. {formatShortDate(monday)} – Dim. {formatShortDate(sunday)}
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">
              {totalSessions} {totalSessions > 1 ? 'séances' : 'séance'}
            </span>
            <span className="text-[11px] text-slate-400">
              ({matchCount} {matchCount > 1 ? 'matchs' : 'match'} • {trainCount}{' '}
              {trainCount > 1 ? 'entraînements' : 'entraînement'})
            </span>
          </div>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badgeStyle}`}
          >
            {loadLabel}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Séances */}
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Dumbbell className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[10px] uppercase text-slate-400 font-medium">
                Séances
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-white">{totalSessions}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {matchCount}M / {trainCount}E
              </span>
            </div>
          </div>

          {/* Distance totale */}
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] uppercase text-slate-400 font-medium">
                Distance
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-emerald-400">
                {totalDistanceKm.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">km</span>
            </div>
          </div>

          {/* Haute intensité cumulée */}
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[10px] uppercase text-slate-400 font-medium">
                Haute int.
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-rose-400">
                {totalHighIntensityM}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">m</span>
            </div>
          </div>

          {/* Charge totale cumulée (Foster) */}
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] uppercase text-slate-400 font-medium">
                Charge
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-amber-400">
                {totalCharge}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">pts</span>
            </div>
          </div>
        </div>

        {/* Historique des 5 dernières semaines & Indice de forme (affiché en vue Performances) */}
        {showHistory && (
          <div className="pt-2.5 border-t border-slate-800/60 space-y-2">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">
                Indice de forme : <strong className="text-white">{formLabel}</strong>
              </span>
              {chronicCharge > 0 && (
                <span className="text-slate-500 font-mono">
                  Moy. 4 sem. : {chronicCharge} pts
                </span>
              )}
            </div>

            <div className="grid grid-cols-5 gap-1.5 pt-1 items-end">
              {weekHistory.map((w, idx) => {
                const isCurrent = idx === weekHistory.length - 1
                const barH = Math.max(6, Math.round((w.totalCharge / maxWeekCharge) * 44))
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-mono text-slate-400">
                      {w.totalCharge > 0 ? `${w.totalCharge}p` : '-'}
                    </span>
                    <div className="w-full h-12 bg-slate-950 rounded-md flex items-end p-1 border border-slate-800/60">
                      <div
                        className={`w-full rounded-xs transition-all ${
                          isCurrent ? 'bg-emerald-400' : 'bg-slate-700'
                        }`}
                        style={{ height: `${barH}px` }}
                      />
                    </div>
                    <span
                      className={`text-[9px] ${
                        isCurrent ? 'text-emerald-400 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {isCurrent ? 'Cette sem.' : `S-${4 - idx}`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
