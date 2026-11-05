// src/App.jsx
import { useState } from 'react'
import { Plus, LogOut, Loader2, ListFilter, Activity, Trophy } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { useSessions } from './hooks/useSessions'
import AuthPage from './components/AuthPage'
import PersonalRecords from './components/PersonalRecords'
import ProgressionChart from './components/ProgressionChart'
import WeeklyLoadWidget from './components/WeeklyLoadWidget'
import MatchSummaryBanner from './components/MatchSummaryBanner'
import SessionCard from './components/SessionCard'
import SessionModal from './components/SessionModal'
import ShareModal from './components/ShareModal'
import PlayerRadarCard from './components/PlayerRadarCard'
import MatchVsTrainingCard from './components/MatchVsTrainingCard'
import WeatherImpactCard from './components/WeatherImpactCard'
import SeasonGoalsTab from './components/SeasonGoalsTab'

const TABS = [
  { id: 'SEANCES', label: 'Séances', icon: ListFilter },
  { id: 'PERF', label: 'Perf & Météo', icon: Activity },
  { id: 'SAISON', label: 'Saison & Objectifs', icon: Trophy }
]

export default function App() {
  const {
    sessions,
    seasonSessions,
    loading,
    filterType,
    setFilterType,
    selectedSeason,
    setSelectedSeason,
    availableSeasons,
    filteredSessions,
    knownTeams,
    clubCityMap,
    defaultLieu,
    defaultEquipe,
    records,
    bilanMatchs,
    playerProfile,
    matchVsTraining,
    weatherImpact,
    seasonTotals,
    matchCount,
    tournoiCount,
    trainCount,
    refreshSessions,
    clearSessions
  } = useSessions()

  const { authSession, authChecking, signOut } = useAuth({
    onAuthenticated: refreshSessions,
    onUnauthenticated: clearSessions
  })

  const [activeTab, setActiveTab] = useState('SEANCES')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sessionToEdit, setSessionToEdit] = useState(null)
  const [sessionToShare, setSessionToShare] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    )
  }

  if (!authSession) {
    return <AuthPage />
  }

  const handleOpenCreate = () => {
    setSessionToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (e, session) => {
    e.stopPropagation()
    setSessionToEdit(session)
    setIsModalOpen(true)
  }

  const handleOpenShare = (e, session) => {
    e.stopPropagation()
    setSessionToShare(session)
  }

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6 space-y-5">
      {/* En-tête */}
      <header className="pt-2 pb-4 border-b border-slate-800 flex justify-between items-center gap-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            FOOT<span className="text-emerald-400">PULSE</span>
          </h1>
          <p className="text-xs text-slate-400">Suivi des performances U13F</p>
        </div>

        <div className="flex items-center gap-2">
          {availableSeasons.length > 0 && (
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
              title="Filtrer par saison sportive"
            >
              <option value="ALL">Toutes saisons</option>
              {availableSeasons.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleOpenCreate}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Séance
          </button>
          <button
            onClick={signOut}
            className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 p-1.5 rounded-xl transition-colors"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Navigation à 3 onglets */}
      <nav className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
        {TABS.map((t) => {
          const Icon = t.icon
          const isActive = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t.label}</span>
            </button>
          )
        })}
      </nav>

      {/* ONGLET 1 : SÉANCES */}
      {activeTab === 'SEANCES' && (
        <div className="space-y-6">
          <PersonalRecords records={records} />
          <ProgressionChart sessions={seasonSessions} />
          <WeeklyLoadWidget sessions={sessions} />

          {filterType !== 'ENTRAINEMENT' && (
            <MatchSummaryBanner bilanMatchs={bilanMatchs} />
          )}

          {/* Historique des séances */}
          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Historique des séances
              </h2>

              <div className="flex flex-wrap bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-medium self-start sm:self-auto">
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    filterType === 'ALL'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tout ({seasonSessions.length})
                </button>
                <button
                  onClick={() => setFilterType('MATCH')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    filterType === 'MATCH'
                      ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Matchs ({matchCount})
                </button>
                <button
                  onClick={() => setFilterType('TOURNOI')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    filterType === 'TOURNOI'
                      ? 'bg-amber-500/20 text-amber-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tournois ({tournoiCount})
                </button>
                <button
                  onClick={() => setFilterType('ENTRAINEMENT')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    filterType === 'ENTRAINEMENT'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Entraînements ({trainCount})
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Chargement des données...
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800/50">
                Aucune séance dans cette catégorie.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSessions.map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    allSessions={seasonSessions}
                    records={records}
                    totalSessionsCount={seasonSessions.length}
                    isExpanded={expandedId === s.id}
                    onToggleExpand={toggleExpand}
                    onEdit={handleOpenEdit}
                    onShare={handleOpenShare}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ONGLET 2 : PERFORMANCES, CHARGE & MÉTÉO */}
      {activeTab === 'PERF' && (
        <div className="space-y-6">
          <PlayerRadarCard profile={playerProfile} />
          <WeeklyLoadWidget sessions={sessions} showHistory />
          <MatchVsTrainingCard matchVsTraining={matchVsTraining} />
          <WeatherImpactCard weatherImpact={weatherImpact} />
        </div>
      )}

      {/* ONGLET 3 : SAISON & OBJECTIFS */}
      {activeTab === 'SAISON' && (
        <SeasonGoalsTab
          seasonTotals={seasonTotals}
          selectedSeason={selectedSeason}
        />
      )}

      {isModalOpen && (
        <SessionModal
          key={sessionToEdit?.id || 'create'}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSessionSaved={refreshSessions}
          sessionToEdit={sessionToEdit}
          knownTeams={knownTeams}
          clubCityMap={clubCityMap}
          defaultLieu={defaultLieu}
          defaultEquipe={defaultEquipe}
        />
      )}
      <ShareModal
        isOpen={Boolean(sessionToShare)}
        onClose={() => setSessionToShare(null)}
        session={sessionToShare}
      />
    </div>
  )
}
