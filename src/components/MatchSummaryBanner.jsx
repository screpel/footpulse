// src/components/MatchSummaryBanner.jsx
import { Shield } from 'lucide-react'

export default function MatchSummaryBanner({ bilanMatchs }) {
  if (!bilanMatchs || bilanMatchs.joues === 0) return null

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-emerald-400" />
        <span className="font-bold text-slate-200">Bilan Matchs</span>
      </div>
      <div className="flex items-center gap-3 font-mono">
        <span className="text-emerald-400 font-bold">{bilanMatchs.v}V</span>
        <span className="text-amber-400 font-bold">{bilanMatchs.n}N</span>
        <span className="text-rose-400 font-bold">{bilanMatchs.d}D</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-300 text-[11px]">
          {bilanMatchs.bp} <span className="text-slate-500">bp</span> - {bilanMatchs.bc}{' '}
          <span className="text-slate-500">bc</span>
        </span>
      </div>
    </section>
  )
}
