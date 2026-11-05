// src/components/SessionCard.jsx
import {
  Pencil,
  Cloud,
  CloudRain,
  Sun,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Award,
  Share2,
  Trophy
} from 'lucide-react'
import {
  calculateSessionRatios,
  calculateSessionComparison,
  evaluateSessionRecords,
  summarizeTournamentMatches,
  formatDuration
} from '../domain/sessionMetrics'
import { getRpeTheme, getScoreBadgeStyle } from './rpeTheme'

function MeteoBadge({ temp, condition }) {
  if (temp === null && !condition) return null

  const isRain =
    condition?.toLowerCase().includes('pluie') ||
    condition?.toLowerCase().includes('averses')
  const isSun =
    condition?.toLowerCase().includes('soleil') ||
    condition?.toLowerCase().includes('ensoleillé')

  const Icon = isRain ? CloudRain : isSun ? Sun : Cloud
  const iconColor = isRain
    ? 'text-sky-400'
    : isSun
    ? 'text-amber-400'
    : 'text-slate-400'

  return (
    <span className="text-[10px] bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1.5 border border-slate-700/50">
      <Icon className={`w-3 h-3 ${iconColor}`} />
      <span>{temp !== null && temp !== undefined ? `${temp}°C` : ''}</span>
      {condition && <span className="text-slate-400">• {condition}</span>}
    </span>
  )
}

function DeltaBadge({ pct }) {
  if (pct === null || pct === undefined || pct === 0) return null
  const isPositive = pct > 0
  return (
    <span
      className={`text-[9px] font-mono font-bold ml-1 ${
        isPositive ? 'text-emerald-400' : 'text-rose-400'
      }`}
      title="Écart par rapport à ta moyenne"
    >
      {isPositive ? `+${pct}%` : `${pct}%`}
    </span>
  )
}

export default function SessionCard({
  session,
  allSessions,
  records,
  totalSessionsCount,
  isExpanded,
  onToggleExpand,
  onEdit,
  onShare
}) {
  const { passesPerMin, secPerBall, fosterLoad } = calculateSessionRatios(session)
  const comparison = calculateSessionComparison(session, allSessions)
  const rpeTheme = getRpeTheme(session.rpe)
  const {
    isSprintRecord,
    isTirRecord,
    isDistRecord,
    isPassesRecord,
    hasAnyRecord
  } = evaluateSessionRecords(session, records, totalSessionsCount)

  const isMatch = session.type_seance === 'MATCH'
  const isTournoi = session.type_seance === 'TOURNOI'
  const isCompetition = isMatch || isTournoi
  const tournoiStats = isTournoi
    ? summarizeTournamentMatches(session.matchs_tournoi)
    : null

  return (
    <div
      onClick={() => onToggleExpand(session.id)}
      className="bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-4 space-y-3 cursor-pointer transition-all"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {isMatch ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-emerald-400">
                  Match vs {session.adversaire || 'Adversaire'}
                </span>
                {session.score_equipe !== null &&
                  session.score_adversaire !== null && (
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getScoreBadgeStyle(
                        session.score_equipe,
                        session.score_adversaire
                      )}`}
                    >
                      {session.score_equipe} - {session.score_adversaire}
                    </span>
                  )}
              </div>
            ) : isTournoi ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 shrink-0" />
                  {session.nom_tournoi || 'Tournoi'}
                </span>
                {tournoiStats && tournoiStats.totalMatches > 0 && (
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border bg-amber-500/15 text-amber-300 border-amber-500/30">
                    {tournoiStats.totalMatches}M • {tournoiStats.v}V {tournoiStats.n}N{' '}
                    {tournoiStats.d}D
                  </span>
                )}
              </div>
            ) : (
              <span className="font-bold text-sm text-white">Entraînement</span>
            )}

            <span className="text-xs text-slate-500">• {session.lieu}</span>
            <MeteoBadge temp={session.temperature_c} condition={session.meteo_temps} />

            {hasAnyRecord && (
              <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-md flex items-center gap-1 font-semibold">
                <Award className="w-2.5 h-2.5 text-amber-400" /> Record
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400">
            {new Date(session.date_seance).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short'
            })}{' '}
            — {formatDuration(session.temps_activite_sec)} d&apos;activité
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${
              isDistRecord
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-400'
            }`}
          >
            {session.distance_km} km
            {isExpanded && <DeltaBadge pct={comparison?.distancePct} />}
          </span>
          <button
            onClick={(e) => onEdit(e, session)}
            className="text-slate-500 hover:text-white p-1.5 rounded-md hover:bg-slate-800 transition-colors"
            title="Modifier la séance"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => onShare(e, session)}
            className="text-slate-500 hover:text-emerald-400 p-1.5 rounded-md hover:bg-slate-800 transition-colors"
            title="Partager la fiche"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <div className="text-slate-500 p-0.5">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* 4 métriques principales avec mise en valeur des records */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-center">
        <div
          className={`rounded-lg p-2 ${
            isSprintRecord
              ? 'bg-amber-500/10 border border-amber-500/30'
              : 'bg-slate-950/50'
          }`}
        >
          <span className="block text-[10px] text-slate-500 uppercase">
            Sprint max
          </span>
          <span className="text-xs font-semibold text-slate-200">
            {session.sprint_max_kmh}{' '}
            <span className="text-[10px] text-slate-500">km/h</span>
            {isExpanded && <DeltaBadge pct={comparison?.sprintPct} />}
          </span>
        </div>
        <div
          className={`rounded-lg p-2 ${
            isTirRecord
              ? 'bg-amber-500/10 border border-amber-500/30'
              : 'bg-slate-950/50'
          }`}
        >
          <span className="block text-[10px] text-slate-500 uppercase">
            Frappe
          </span>
          <span className="text-xs font-semibold text-rose-400">
            {session.tir_max_kmh > 0 ? `${session.tir_max_kmh} km/h` : '-'}
          </span>
        </div>
        <div
          className={`rounded-lg p-2 ${
            isPassesRecord
              ? 'bg-amber-500/10 border border-amber-500/30'
              : 'bg-slate-950/50'
          }`}
        >
          <span className="block text-[10px] text-slate-500 uppercase">
            Passes
          </span>
          <span className="text-xs font-semibold text-sky-400">
            {session.passes}
            {isExpanded && <DeltaBadge pct={comparison?.passesPct} />}
          </span>
        </div>
        <div className="bg-slate-950/50 rounded-lg p-2">
          <span className="block text-[10px] text-slate-500 uppercase">
            {isCompetition ? 'Buts' : 'Tirs'}
          </span>
          <span className="text-xs font-semibold text-amber-400">
            {isCompetition
              ? session.buts_reels || 0
              : session.tirs || 0}
          </span>
        </div>
      </div>

      {/* Accordéon : Détails complets au clic */}
      {isExpanded && (
        <div className="pt-3 border-t border-slate-800/60 space-y-2.5">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-950/80 border border-slate-800/60 rounded-lg p-2">
              <span className="block text-[9px] text-slate-500 uppercase">
                Haute intensité
              </span>
              <span className="text-xs font-semibold text-emerald-400">
                {session.haute_intensite_m
                  ? `${session.haute_intensite_m} m`
                  : '-'}
                <DeltaBadge pct={comparison?.highIntensityPct} />
              </span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800/60 rounded-lg p-2">
              <span className="block text-[9px] text-slate-500 uppercase">
                Accél. / Décél.
              </span>
              <span className="text-xs font-semibold text-slate-200">
                {session.accelerations} <span className="text-slate-500">/</span>{' '}
                {session.decelerations}
              </span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800/60 rounded-lg p-2">
              <span className="block text-[9px] text-slate-500 uppercase">
                Balle au pied
              </span>
              <span className="text-xs font-semibold text-slate-200">
                {session.temps_balle_sec}s
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-950/40 rounded-lg p-1.5 flex justify-between items-center px-3">
              <span className="text-[10px] text-slate-400">Cadence passes</span>
              <span className="text-xs font-mono font-semibold text-sky-400">
                {passesPerMin} / min
              </span>
            </div>
            <div className="bg-slate-950/40 rounded-lg p-1.5 flex justify-between items-center px-3">
              <span className="text-[10px] text-slate-400">Temps / ballon</span>
              <span className="text-xs font-mono font-semibold text-slate-200">
                {secPerBall}s
              </span>
            </div>
          </div>

          {/* Effort ressenti (RPE) & Score de charge (Foster) */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-950/40 rounded-lg p-1.5 flex justify-between items-center px-3">
              <span className="text-[10px] text-slate-400">Effort (RPE)</span>
              {rpeTheme ? (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${rpeTheme.badge}`}
                >
                  RPE {session.rpe}/10 • {rpeTheme.shortLabel}
                </span>
              ) : (
                <span className="text-xs font-mono text-slate-500">-</span>
              )}
            </div>
            <div className="bg-slate-950/40 rounded-lg p-1.5 flex justify-between items-center px-3">
              <span className="text-[10px] text-slate-400">Score de charge</span>
              <span className="text-xs font-mono font-semibold text-amber-400">
                {fosterLoad !== null ? `${fosterLoad} pts` : '-'}
              </span>
            </div>
          </div>

          {isTournoi &&
            Array.isArray(session.matchs_tournoi) &&
            session.matchs_tournoi.length > 0 && (
              <div className="bg-slate-950/60 border border-amber-500/20 rounded-xl p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-amber-400 pb-1 border-b border-slate-800/80">
                  <span>Rencontres du tournoi</span>
                  {tournoiStats && (
                    <span className="font-mono text-slate-400">
                      {tournoiStats.bp} bp - {tournoiStats.bc} bc
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {session.matchs_tournoi.map((m, idx) => {
                    const eqScore = Number(m.score_equipe ?? 0)
                    const advScore = Number(m.score_adversaire ?? 0)
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs bg-slate-900/80 rounded-lg px-2.5 py-1.5 border border-slate-800/60"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-mono text-slate-500">
                            #{idx + 1}
                          </span>
                          <span className="font-medium text-slate-200 truncate">
                            vs {m.adversaire || 'Adversaire'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {(Number(m.buts || 0) > 0 || Number(m.passes_d || 0) > 0) && (
                            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                              {Number(m.buts || 0) > 0 ? `${m.buts}B` : ''}
                              {Number(m.buts || 0) > 0 && Number(m.passes_d || 0) > 0
                                ? ' • '
                                : ''}
                              {Number(m.passes_d || 0) > 0 ? `${m.passes_d}PD` : ''}
                            </span>
                          )}
                          <span
                            className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${getScoreBadgeStyle(
                              eqScore,
                              advScore
                            )}`}
                          >
                            {eqScore} - {advScore}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

          {isCompetition && (
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-950/40 rounded-lg p-1.5 flex justify-between items-center px-3">
                <span className="text-[10px] text-slate-400">
                  Passes décisives
                </span>
                <span className="text-xs font-mono font-semibold text-emerald-400">
                  {session.passes_d_reelles || 0}
                </span>
              </div>
              <div className="bg-slate-950/40 rounded-lg p-1.5 flex justify-between items-center px-3">
                <span className="text-[10px] text-slate-400">Tirs détectés</span>
                <span className="text-xs font-mono font-semibold text-amber-400">
                  {session.tirs || 0}
                </span>
              </div>
            </div>
          )}

          {session.notes && (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 flex items-start gap-2 text-xs text-slate-300">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{session.notes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
