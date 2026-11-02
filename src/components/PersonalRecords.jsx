// src/components/PersonalRecords.jsx
import { Zap, Flame, Activity, Trophy } from 'lucide-react'

export default function PersonalRecords({ records }) {
  const items = [
    {
      label: 'Sprint max',
      value: records.sprintMax.toFixed(1),
      unit: 'km/h',
      icon: Zap,
      color: 'text-amber-400'
    },
    {
      label: 'Frappe max',
      value: records.tirMax > 0 ? records.tirMax.toFixed(1) : '-',
      unit: 'km/h',
      icon: Flame,
      color: 'text-rose-500'
    },
    {
      label: 'Distance max',
      value: records.distMax.toFixed(1),
      unit: 'km',
      icon: Activity,
      color: 'text-emerald-400'
    },
    {
      label: 'Buts en match',
      value: records.butsEnMatch,
      unit: 'buts',
      icon: Trophy,
      color: 'text-sky-400'
    }
  ]

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Records personnels
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {items.map((r, i) => {
          const Icon = r.icon
          return (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 shadow-sm"
            >
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
  )
}
