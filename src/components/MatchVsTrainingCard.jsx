// src/components/MatchVsTrainingCard.jsx
import { Swords } from 'lucide-react'

export default function MatchVsTrainingCard({ matchVsTraining }) {
  if (!matchVsTraining) return null
  const { match, training } = matchVsTraining

  if (match.count === 0 && training.count === 0) return null

  const rows = [
    {
      label: 'Distance moyenne',
      matchVal: `${match.avgDistKm} km`,
      trainVal: `${training.avgDistKm} km`,
      rawM: match.avgDistKm,
      rawT: training.avgDistKm
    },
    {
      label: 'Sprint max moyen',
      matchVal: `${match.avgSprintMax} km/h`,
      trainVal: `${training.avgSprintMax} km/h`,
      rawM: match.avgSprintMax,
      rawT: training.avgSprintMax
    },
    {
      label: 'Haute intensité',
      matchVal: `${match.avgHighIntensityM} m`,
      trainVal: `${training.avgHighIntensityM} m`,
      rawM: match.avgHighIntensityM,
      rawT: training.avgHighIntensityM
    },
    {
      label: 'Cadence de passes',
      matchVal: `${match.avgPassesPerMin} /min`,
      trainVal: `${training.avgPassesPerMin} /min`,
      rawM: match.avgPassesPerMin,
      rawT: training.avgPassesPerMin
    },
    {
      label: 'Effort ressenti (RPE)',
      matchVal: match.avgRpe > 0 ? `${match.avgRpe} /10` : '-',
      trainVal: training.avgRpe > 0 ? `${training.avgRpe} /10` : '-',
      rawM: match.avgRpe,
      rawT: training.avgRpe
    }
  ]

  return (
    <section className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Swords className="w-3.5 h-3.5 text-sky-400" />
          Comparatif Match vs Entraînement
        </h2>
        <span className="text-[10px] text-slate-500">
          {match.count}M vs {training.count}E
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
        <div className="grid grid-cols-3 text-[10px] font-bold uppercase tracking-wider pb-2 border-b border-slate-800">
          <span className="text-emerald-400">Match ({match.count})</span>
          <span className="text-center text-slate-400">Indicateur</span>
          <span className="text-right text-sky-400">
            Entraîn. ({training.count})
          </span>
        </div>

        <div className="space-y-2">
          {rows.map((r, i) => {
            const total = (r.rawM || 0) + (r.rawT || 0)
            const matchRatio = total > 0 ? Math.round((r.rawM / total) * 100) : 50

            return (
              <div key={i} className="space-y-1">
                <div className="grid grid-cols-3 items-center text-xs">
                  <span className="font-mono font-bold text-emerald-400">
                    {match.count > 0 ? r.matchVal : '-'}
                  </span>
                  <span className="text-[11px] text-center text-slate-300 truncate">
                    {r.label}
                  </span>
                  <span className="font-mono font-bold text-right text-sky-400">
                    {training.count > 0 ? r.trainVal : '-'}
                  </span>
                </div>

                {match.count > 0 && training.count > 0 && total > 0 && (
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500/80 h-full transition-all"
                      style={{ width: `${matchRatio}%` }}
                    />
                    <div
                      className="bg-sky-500/80 h-full transition-all"
                      style={{ width: `${100 - matchRatio}%` }}
                    />
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
