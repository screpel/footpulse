// src/components/PlayerRadarCard.jsx
import { Sparkles } from 'lucide-react'

export default function PlayerRadarCard({ profile }) {
  if (!profile || profile.overall === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 text-center text-xs text-slate-500">
        Ajoute au moins une séance pour générer le profil radar et le score global.
      </div>
    )
  }

  const { overall, profileLabel, axes } = profile
  const size = 220
  const center = size / 2
  const radius = 72
  const levels = [0.25, 0.5, 0.75, 1]

  const getPoint = (index, ratio) => {
    const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2
    const x = center + radius * ratio * Math.cos(angle)
    const y = center + radius * ratio * Math.sin(angle)
    return { x, y }
  }

  const polygonPoints = axes
    .map((axis, idx) => {
      const p = getPoint(idx, Math.max(0.08, axis.value / 100))
      return `${p.x},${p.y}`
    })
    .join(' ')

  return (
    <section className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Score & Profil Joueuse
        </h2>
        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
          {profileLabel}
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
        {/* Badge Note Globale style Carte Pro */}
        <div className="flex sm:flex-col items-center justify-between w-full sm:w-32 bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center shrink-0">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              Score Global
            </span>
            <span className="text-4xl font-black text-emerald-400 tracking-tight">
              {overall}
            </span>
            <span className="text-[10px] text-slate-500 block">/ 100</span>
          </div>

          <div className="w-full space-y-1.5 mt-0 sm:mt-3 max-w-[160px] sm:max-w-none">
            {axes.map((a) => (
              <div key={a.key} className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">{a.label}</span>
                <span className="font-mono font-bold text-white">{a.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Radar SVG à 5 branches */}
        <div className="flex-1 flex justify-center w-full">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full max-w-[230px] h-auto overflow-visible"
          >
            {/* Polygones concentriques de repère */}
            {levels.map((lvl, lIdx) => {
              const pts = axes
                .map((_, i) => {
                  const p = getPoint(i, lvl)
                  return `${p.x},${p.y}`
                })
                .join(' ')
              return (
                <polygon
                  key={lIdx}
                  points={pts}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray={lvl === 1 ? 'none' : '2 2'}
                />
              )
            })}

            {/* Axes partant du centre */}
            {axes.map((_, i) => {
              const p = getPoint(i, 1)
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={p.x}
                  y2={p.y}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
              )
            })}

            {/* Polygone de performances de la joueuse */}
            <polygon
              points={polygonPoints}
              fill="rgba(16, 185, 129, 0.22)"
              stroke="#34d399"
              strokeWidth="2.2"
            />

            {/* Sommets et étiquettes */}
            {axes.map((axis, i) => {
              const valPt = getPoint(i, Math.max(0.08, axis.value / 100))
              const labelPt = getPoint(i, 1.24)
              return (
                <g key={axis.key}>
                  <circle
                    cx={valPt.x}
                    cy={valPt.y}
                    r="3.5"
                    fill="#34d399"
                    stroke="#020617"
                    strokeWidth="1.5"
                  />
                  <text
                    x={labelPt.x}
                    y={labelPt.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#cbd5e1"
                    fontSize="9.5"
                    fontWeight="bold"
                  >
                    {axis.label} ({axis.value})
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    </section>
  )
}
