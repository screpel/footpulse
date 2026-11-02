// src/hooks/useSessions.js
import { useState, useCallback, useMemo } from 'react'
import { sessionRepository } from '../services/sessionRepository'
import { calculatePersonalRecords, calculateMatchSummary } from '../domain/sessionMetrics'
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
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('ALL')
  const [selectedSeason, setSelectedSeason] = useState('ALL')

  const refreshSessions = useCallback(async () => {
    setLoading(true)
    const { data, error } = await sessionRepository.findAll()
    if (!error && data) {
      setSessions(data)
    }
    setLoading(false)
  }, [])

  const clearSessions = useCallback(() => {
    setSessions([])
  }, [])

  const availableSeasons = useMemo(() => getAvailableSeasons(sessions), [sessions])

  // Séances filtrées par saison sportive sélectionnée
  const seasonSessions = useMemo(() => {
    if (selectedSeason === 'ALL') return sessions
    return sessions.filter(s => getSeasonFromDate(s.date_seance) === selectedSeason)
  }, [sessions, selectedSeason])

  // Séances filtrées par type (Match / Entraînement) au sein de la saison active
  const filteredSessions = useMemo(() => {
    return seasonSessions.filter((s) => {
      if (filterType === 'MATCH') return s.type_seance === 'MATCH'
      if (filterType === 'ENTRAINEMENT') return s.type_seance === 'ENTRAINEMENT'
      return true
    })
  }, [seasonSessions, filterType])

  const knownTeams = useMemo(
    () => Array.from(new Set(sessions.flatMap(s => [s.equipe, s.adversaire]).filter(Boolean))),
    [sessions]
  )

  const defaultLieu = useMemo(
    () => sessions.find(s => s.lieu)?.lieu || '',
    [sessions]
  )

  const defaultEquipe = useMemo(
    () => sessions.find(s => s.equipe)?.equipe || '',
    [sessions]
  )

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
    defaultLieu,
    defaultEquipe,
    records,
    bilanMatchs,
    playerProfile,
    matchVsTraining,
    weatherImpact,
    seasonTotals,
    matchCount,
    trainCount,
    refreshSessions,
    clearSessions
  }
}
