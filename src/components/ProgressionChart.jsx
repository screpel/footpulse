// src/components/ProgressionChart.jsx
import { useState } from 'react'
import { TrendingUp } from 'lucide-react'

const METRICS = [
    { key: 'sprint_max_kmh', label: 'Sprint', unit: 'km/h', color: '#fbbf24', stroke: 'stroke-amber-400', text: 'text-amber-400', bg: 'bg-amber-400/10' },
    { key: 'distance_km', label: 'Distance', unit: 'km', color: '#34d399', stroke: 'stroke-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { key: 'haute_intensite_m', label: 'Haute int.', unit: 'm', color: '#fb7185', stroke: 'stroke-rose-400', text: 'text-rose-400', bg: 'bg-rose-400/10' },
    { key: 'passes', label: 'Passes', unit: '', color: '#38bdf8', stroke: 'stroke-sky-400', text: 'text-sky-400', bg: 'bg-sky-400/10' },
    { key: 'tir_max_kmh', label: 'Frappe', unit: 'km/h', color: '#f43f5e', stroke: 'stroke-rose-500', text: 'text-rose-500', bg: 'bg-rose-500/10' }
]

export default function ProgressionChart({ sessions }) {
    const [activeMetric, setActiveMetric] = useState(METRICS[0])

    // Tri chronologique (du plus ancien au plus récent) et prise des 10 dernières séances
    const chronological = [...sessions]
        .sort((a, b) => new Date(a.date_seance) - new Date(b.date_seance))
        .slice(-10)

    if (chronological.length < 2) {
        return null // Le graphique s'affiche dès qu'il y a au moins 2 séances
    }

    const values = chronological.map(s => Number(s[activeMetric.key] || 0))
    const maxVal = Math.max(...values, 1)
    const minVal = Math.min(...values)
    const avgVal = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)

    // Dimensions du canevas SVG
    const width = 360
    const height = 130
    const padX = 28
    const padY = 26

    const getCoordinates = (val, idx) => {
        const x = padX + (idx * (width - padX * 2)) / (chronological.length - 1)
        const range = maxVal - minVal === 0 ? 1 : maxVal - minVal
        const y = height - padY - ((val - minVal) / range) * (height - padY * 2)
        return { x, y }
    }

    const points = values.map((val, idx) => getCoordinates(val, idx))
    const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ')
    const areaPoints = `${points[0].x},${height - padY} ${polylinePoints} ${points[points.length - 1].x},${height - padY}`

    return (
        <section className="space-y-3">
            <div className="flex justify-between items-center">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    Courbe de progression
                </h2>
                <span className="text-[11px] text-slate-400">
          Moyenne : <strong className="text-white">{avgVal} {activeMetric.unit}</strong>
        </span>
            </div>

            <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 space-y-3">
                {/* Sélecteur de métrique */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {METRICS.map((m) => {
                        const isSelected = activeMetric.key === m.key
                        return (
                            <button
                                key={m.key}
                                onClick={() => setActiveMetric(m)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                                    isSelected
                                        ? `${m.bg}${m.text} border border-current/20 font-bold`
                                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                                }`}
                            >
                                {m.label}
                            </button>
                        )
                    })}
                </div>

                {/* Graphique SVG */}
                <div className="w-full overflow-hidden">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                        <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={activeMetric.color} stopOpacity="0.3" />
                                <stop offset="100%" stopColor={activeMetric.color} stopOpacity="0.0" />
                            </linearGradient>
                        </defs>

                        {/* Ligne de repère basse */}
                        <line
                            x1={padX}
                            y1={height - padY}
                            x2={width - padX}
                            y2={height - padY}
                            stroke="#1e293b"
                            strokeDasharray="3 3"
                            strokeWidth="1"
                        />

                        {/* Zone sous la courbe */}
                        <polygon points={areaPoints} fill="url(#chartGrad)" />

                        {/* Courbe principale */}
                        <polyline
                            fill="none"
                            stroke={activeMetric.color}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={polylinePoints}
                        />

                        {/* Points et valeurs */}
                        {points.map((p, i) => {
                            const dateLabel = new Date(chronological[i].date_seance).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit'
                            })
                            const isMatch = chronological[i].type_seance === 'MATCH'

                            return (
                                <g key={i}>
                                    {/* Point */}
                                    <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r={isMatch ? 4.5 : 3.5}
                                        fill={isMatch ? activeMetric.color : '#0f172a'}
                                        stroke={activeMetric.color}
                                        strokeWidth="2"
                                    />
                                    {/* Valeur au-dessus du point */}
                                    <text
                                        x={p.x}
                                        y={p.y - 8}
                                        textAnchor="middle"
                                        fill="#f8fafc"
                                        fontSize="9"
                                        fontWeight="bold"
                                    >
                                        {values[i]}
                                    </text>
                                    {/* Date en bas */}
                                    <text
                                        x={p.x}
                                        y={height - 8}
                                        textAnchor="middle"
                                        fill={isMatch ? '#34d399' : '#64748b'}
                                        fontSize="8.5"
                                        fontWeight={isMatch ? 'bold' : 'normal'}
                                    >
                                        {dateLabel}
                                    </text>
                                </g>
                            )
                        })}
                    </svg>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                    <span>Points pleins / dates vertes = Matchs officiels</span>
                    <span>{chronological.length} dernières séances</span>
                </div>
            </div>
        </section>
    )
}
