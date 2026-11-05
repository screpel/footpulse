// src/hooks/useSessions.js
import { useState, useCallback, useMemo } from 'react'
import { sessionRepository } from '../services/sessionRepository'
import { clubRepository } from '../services/clubRepository'
import {
  calculatePersonalRecords,
  calculateMatchSummary,
  resolveCityForClub
} from '../domain/sessionMetrics'
import {
  getSeasonFromDate,
  getAvailableSeasons,
  calculatePlayerProfile,
  calculateMatchVsTraining,
  calculateWeatherImpact,
  calculateSeasonTotalsAndGoals
} from '../domain/performanceAnalytics'

export function useSessions() {
  const [sessions, setSessions] = useState([])
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('ALL')
  const [selectedSeason, setSelectedSeason] = useState('ALL')

  const refreshSessions = useCallback(async () => {
    setLoading(true)
    const [sessionsRes, clubsRes] = await Promise.all([
      sessionRepository.findAll(),
      clubRepository.findAll()
    ])

    if (!sessionsRes.error && sessionsRes.data) {
      setSessions(sessionsRes.data)
    }
    if (!clubsRes.error && clubsRes.data) {
      setClubs(clubsRes.data)
    }
    setLoading(false)
  }, [])

  const clearSessions = useCallback(() => {
    setSessions([])
    setClubs([])
  }, [])

  const availableSeasons = useMemo(() => getAvailableSeasons(sessions), [sessions])

  // Séances filtrées par saison sportive sélectionnée
  const seasonSessions = useMemo(() => {
    if (selectedSeason === 'ALL') return sessions
    return sessions.filter(s => getSeasonFromDate(s.date_seance) === selectedSeason)
  }, [sessions, selectedSeason])

  // Séances filtrées par type (Match / Tournoi / Entraînement) au sein de la saison active
  const filteredSessions = useMemo(() => {
    return seasonSessions.filter((s) => {
      if (filterType === 'MATCH') return s.type_seance === 'MATCH'
      if (filterType === 'TOURNOI') return s.type_seance === 'TOURNOI'
      if (filterType === 'ENTRAINEMENT') return s.type_seance === 'ENTRAINEMENT'
      return true
    })
  }, [seasonSessions, filterType])

  // Fusion des clubs de l'historique (y compris adversaires de tournoi) et du référentiel public.clubs
  const knownTeams = useMemo(() => {
    const historyTeams = sessions
      .flatMap(s => [
        s.equipe,
        s.adversaire,
        ...(Array.isArray(s.matchs_tournoi) ? s.matchs_tournoi.map(m => m.adversaire) : [])
      ])
      .filter(Boolean)
    const refTeams = clubs.map(c => c.nom).filter(Boolean)
    return Array.from(new Set([...historyTeams, ...refTeams]))
  }, [sessions, clubs])

  // Dictionnaire { [nomClub]: ville } issu de la table clubs
  const clubCityMap = useMemo(() => {
    const map = {}
    clubs.forEach((c) => {
      if (c.nom && c.ville) {
        map[c.nom] = c.ville
      }
    })
    return map
  }, [clubs])

  const defaultEquipe = useMemo(
    () => sessions.find(s => s.equipe)?.equipe || '',
    [sessions]
  )

  const defaultLieu = useMemo(() => {
    const cityFromHomeClub = resolveCityForClub(defaultEquipe, clubCityMap)
    if (cityFromHomeClub) return cityFromHomeClub
    const trainingLieu = sessions.find(
      s => s.type_seance === 'ENTRAINEMENT' && s.lieu
    )?.lieu
    if (trainingLieu) return trainingLieu
    return ''
  }, [sessions, defaultEquipe, clubCityMap])

  const records = useMemo(() => calculatePersonalRecords(seasonSessions), [seasonSessions])
  const bilanMatchs = useMemo(() => calculateMatchSummary(seasonSessions), [seasonSessions])
  const playerProfile = useMemo(() => calculatePlayerProfile(seasonSessions), [seasonSessions])
  const matchVsTraining = useMemo(() => calculateMatchVsTraining(seasonSessions), [seasonSessions])
  const weatherImpact = useMemo(() => calculateWeatherImpact(seasonSessions), [seasonSessions])
  const seasonTotals = useMemo(() => calculateSeasonTotalsAndGoals(seasonSessions), [seasonSessions])

  const matchCount = useMemo(
    () => seasonSessions.filter(s => s.type_seance === 'MATCH').length,
    [seasonSessions]
  )
  const tournoiCount = useMemo(
    () => seasonSessions.filter(s => s.type_seance === 'TOURNOI').length,
    [seasonSessions]
  )
  const trainCount = useMemo(
    () => seasonSessions.filter(s => s.type_seance === 'ENTRAINEMENT').length,
    [seasonSessions]
  )

  return {
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
  }
}
