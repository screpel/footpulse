// src/components/SeasonGoalsTab.jsx
import { Trophy, Target, Activity, Zap, Flame, Clock } from 'lucide-react'
import { formatDuration } from '../domain/sessionMetrics'

export default function SeasonGoalsTab({ seasonTotals, selectedSeason }) {
  if (!seasonTotals) return null

  const {
    totalSessions,
    totalMatches,
    totalTournaments = 0,
    totalTrainings,
    totalDistanceKm,
    totalDurationSec,
    totalPasses,
    totalHighIntensityM,
    totalShots,
    totalGoals,
    totalAssists,
    totalCharge,
    goals
  } = seasonTotals

  const hoursPlayed = (totalDurationSec / 3600).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Cumul Global de la Saison */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Cumul de la saison ({selectedSeason === 'ALL' ? 'Toutes saisons' : selectedSeason})
          </h2>
          <span className="text-[11px] text-slate-400">
            {totalSessions} séances ({totalMatches}M • {totalTournaments}T • {totalTrainings}E)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] uppercase text-slate-400">Distance cumulée</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-emerald-400">{totalDistanceKm}</span>
              <span className="text-xs text-slate-500">km</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[10px] uppercase text-slate-400">Temps d&apos;activité</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-white">{hoursPlayed}</span>
              <span className="text-xs text-slate-500">h ({formatDuration(totalDurationSec)})</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[10px] uppercase text-slate-400">Haute intensité</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-rose-400">{totalHighIntensityM}</span>
              <span className="text-xs text-slate-500">m</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] uppercase text-slate-400">Passes totales</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-sky-400">{totalPasses}</span>
              <span className="text-xs text-slate-500">passes</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] uppercase text-slate-400">Buts / Passes D.</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-amber-400">
                {totalGoals} <span className="text-slate-500 text-sm">/</span> {totalAssists}
              </span>
              <span className="text-xs text-slate-500">({totalShots} tirs)</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] uppercase text-slate-400">Charge cumulée</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-white">{totalCharge}</span>
              <span className="text-xs text-slate-500">pts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Paliers & Objectifs de Saison */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-emerald-400" />
          Objectifs & Paliers de progression
        </h2>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 space-y-4">
          {goals.map((g) => (
            <div key={g.key} className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs">
                <span className="font-semibold text-slate-200">{g.label}</span>
                <span className="font-mono text-slate-400">
                  <strong className="text-emerald-400">{g.current}</strong> / {g.target} {g.unit} ({g.progressPct}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${g.progressPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
