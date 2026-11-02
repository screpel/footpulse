// src/domain/__tests__/sessionDomain.test.js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateFosterLoad,
  getRpeLevel,
  formatDuration,
  calculateSessionRatios,
  calculateSessionComparison,
  calculatePersonalRecords,
  evaluateSessionRecords,
  calculateMatchSummary,
  calculateWeeklySummary
} from '../sessionMetrics.js'
import {
  getSeasonFromDate,
  getAvailableSeasons,
  calculatePlayerProfile,
  calculateMatchVsTraining,
  calculateWeatherImpact,
  calculateSeasonTotalsAndGoals
} from '../performanceAnalytics.js'
import { toSessionFormState, toSessionPayload } from '../sessionMapper.js'

describe('Domain - sessionMetrics', () => {
  it('calcule la charge de Foster correctement et arrondit à l’entier', () => {
    assert.equal(calculateFosterLoad(3600, 7), 420)
    assert.equal(calculateFosterLoad(3330, 6), 333)
    assert.equal(calculateFosterLoad(0, 7), null)
    assert.equal(calculateFosterLoad(3600, null), null)
  })

  it('classifie correctement les paliers RPE de Borg (1 à 10)', () => {
    assert.equal(getRpeLevel(2)?.level, 'EASY')
    assert.equal(getRpeLevel(5)?.level, 'MODERATE')
    assert.equal(getRpeLevel(8)?.level, 'HARD')
    assert.equal(getRpeLevel(10)?.level, 'EXTREME')
    assert.equal(getRpeLevel(0), null)
    assert.equal(getRpeLevel(11), null)
  })

  it('formate la durée en minutes et secondes', () => {
    assert.equal(formatDuration(3605), "60'05\"")
    assert.equal(formatDuration(0), "0'00\"")
  })

  it('calcule les ratios techniques d’une séance', () => {
    const ratios = calculateSessionRatios({
      temps_activite_sec: 3000,
      passes: 75,
      temps_balle_sec: 45,
      rpe: 6
    })
    assert.equal(ratios.passesPerMin, '1.5')
    assert.equal(ratios.secPerBall, '0.60')
    assert.equal(ratios.fosterLoad, 300)
    assert.equal(ratios.rpeLevel?.level, 'MODERATE')
  })

  it('compare une séance à la moyenne des séances du même type (+/- %)', () => {
    const s1 = { type_seance: 'MATCH', distance_km: 6.0, sprint_max_kmh: 22.0, passes: 90, haute_intensite_m: 300 }
    const s2 = { type_seance: 'MATCH', distance_km: 4.0, sprint_max_kmh: 18.0, passes: 50, haute_intensite_m: 100 }
    // Moyenne MATCH : dist = 5.0, sprint = 20.0, passes = 70, hi = 200
    const comp = calculateSessionComparison(s1, [s1, s2])
    assert.equal(comp.distancePct, 20)
    assert.equal(comp.sprintPct, 10)
    assert.equal(comp.highIntensityPct, 50)
  })

  it('calcule les records personnels et détecte les records par séance', () => {
    const s1 = {
      type_seance: 'MATCH',
      sprint_max_kmh: 21.4,
      tir_max_kmh: 55.2,
      distance_km: 5.8,
      passes: 60,
      buts_reels: 2
    }
    const s2 = {
      type_seance: 'ENTRAINEMENT',
      sprint_max_kmh: 19.0,
      tir_max_kmh: 48.0,
      distance_km: 4.2,
      passes: 90,
      buts_reels: 5
    }
    const records = calculatePersonalRecords([s1, s2])
    assert.deepEqual(records, {
      sprintMax: 21.4,
      tirMax: 55.2,
      distMax: 5.8,
      passesMax: 90,
      butsEnMatch: 2
    })

    const evalS1 = evaluateSessionRecords(s1, records, 2)
    assert.equal(evalS1.isSprintRecord, true)
    assert.equal(evalS1.isPassesRecord, false)
    assert.equal(evalS1.hasAnyRecord, true)
  })

  it('calcule le bilan des matchs (V / N / D, bp, bc)', () => {
    const summary = calculateMatchSummary([
      { type_seance: 'MATCH', score_equipe: 3, score_adversaire: 1 },
      { type_seance: 'MATCH', score_equipe: 2, score_adversaire: 2 },
      { type_seance: 'MATCH', score_equipe: 0, score_adversaire: 1 },
      { type_seance: 'ENTRAINEMENT', score_equipe: null, score_adversaire: null }
    ])
    assert.deepEqual(summary, { joues: 3, v: 1, n: 1, d: 1, bp: 5, bc: 4 })
  })

  it('agrège la charge hebdomadaire du lundi au dimanche et l’historique sur 5 semaines', () => {
    const refSunday = new Date(2026, 10, 8, 15, 0, 0)
    const sessions = [
      {
        date_seance: '2026-11-02',
        type_seance: 'ENTRAINEMENT',
        distance_km: 4.2,
        haute_intensite_m: 120,
        temps_activite_sec: 3600,
        rpe: 5
      },
      {
        date_seance: '2026-11-07',
        type_seance: 'MATCH',
        distance_km: 5.3,
        haute_intensite_m: 280,
        temps_activite_sec: 3000,
        rpe: 8
      },
      {
        date_seance: '2026-10-28',
        type_seance: 'MATCH',
        distance_km: 6.0,
        haute_intensite_m: 300,
        temps_activite_sec: 3600,
        rpe: 10
      }
    ]

    const weekly = calculateWeeklySummary(sessions, refSunday)
    assert.equal(weekly.totalSessions, 2)
    assert.equal(weekly.matchCount, 1)
    assert.equal(weekly.trainCount, 1)
    assert.equal(Number(weekly.totalDistanceKm.toFixed(1)), 9.5)
    assert.equal(weekly.totalHighIntensityM, 400)
    assert.equal(weekly.totalCharge, 700)
    assert.equal(weekly.loadLevel, 'OPTIMAL')
    assert.equal(weekly.chronicCharge, 600)
    assert.equal(weekly.formStatus, 'MODERATE')
    assert.equal(weekly.weekHistory.length, 5)
  })
})

describe('Domain - performanceAnalytics (Saison, Radar, Météo)', () => {
  it('détermine correctement la saison sportive (Septembre -> Août)', () => {
    assert.equal(getSeasonFromDate('2026-09-05'), '2026-2027')
    assert.equal(getSeasonFromDate('2027-05-12'), '2026-2027')
    assert.equal(getSeasonFromDate('2026-06-10'), '2025-2026')

    const seasons = getAvailableSeasons([
      { date_seance: '2025-10-01' },
      { date_seance: '2026-11-02' }
    ])
    assert.deepEqual(seasons, ['2026-2027', '2025-2026'])
  })

  it('calcule le profil radar sur 100 et le comparatif Match vs Entraînement', () => {
    const sampleSessions = [
      {
        type_seance: 'MATCH',
        distance_km: 5.2,
        sprint_max_kmh: 22.0,
        haute_intensite_m: 260,
        accelerations: 35,
        decelerations: 45,
        temps_activite_sec: 3000,
        passes: 75,
        tir_max_kmh: 54.0,
        tirs: 4,
        buts_reels: 1,
        rpe: 8
      },
      {
        type_seance: 'ENTRAINEMENT',
        distance_km: 3.8,
        sprint_max_kmh: 19.0,
        haute_intensite_m: 110,
        accelerations: 25,
        decelerations: 30,
        temps_activite_sec: 3600,
        passes: 90,
        tir_max_kmh: 48.0,
        tirs: 6,
        buts_reels: 0,
        rpe: 5
      }
    ]

    const profile = calculatePlayerProfile(sampleSessions)
    assert.ok(profile.overall > 50 && profile.overall <= 100)
    assert.equal(profile.axes.length, 5)

    const mvt = calculateMatchVsTraining(sampleSessions)
    assert.equal(mvt.match.avgDistKm, 5.2)
    assert.equal(mvt.training.avgDistKm, 3.8)
    assert.equal(mvt.match.avgRpe, 8)
  })

  it('analyse l’impact des conditions climatiques et génère des insights', () => {
    const weatherSessions = [
      {
        meteo_temps: 'Ensoleillé',
        temperature_c: 15,
        temps_activite_sec: 3600,
        distance_km: 5.4,
        sprint_max_kmh: 22.4,
        passes: 90,
        haute_intensite_m: 250,
        rpe: 6
      },
      {
        meteo_temps: 'Pluie',
        temperature_c: 6,
        temps_activite_sec: 3600,
        distance_km: 4.4,
        sprint_max_kmh: 19.8,
        passes: 60,
        haute_intensite_m: 180,
        rpe: 8
      }
    ]

    const impact = calculateWeatherImpact(weatherSessions)
    assert.equal(impact.totalAnalyzed, 2)
    const sunny = impact.conditions.find(c => c.key === 'SUNNY')
    const rainy = impact.conditions.find(c => c.key === 'RAINY')
    assert.equal(sunny.stats.avgSprint, 22.4)
    assert.equal(rainy.stats.avgSprint, 19.8)
    assert.ok(impact.insights.length >= 2)
  })

  it('calcule les cumuls de saison et les paliers d’objectifs', () => {
    const totals = calculateSeasonTotalsAndGoals([
      {
        type_seance: 'MATCH',
        distance_km: 5.5,
        temps_activite_sec: 3000,
        passes: 80,
        haute_intensite_m: 240,
        tirs: 3,
        buts_reels: 2,
        passes_d_reelles: 1,
        rpe: 7
      }
    ])
    assert.equal(totals.totalDistanceKm, 5.5)
    assert.equal(totals.totalGoals, 2)
    assert.equal(totals.totalAssists, 1)
    assert.equal(totals.goals.length, 4)
  })
})

describe('Domain - sessionMapper', () => {
  it('convertit un formulaire MATCH et ENTRAINEMENT en payload normalisé', () => {
    const formState = toSessionFormState(null, { lieu: 'Stade A', equipe: 'Équipe A' })
    const trainingPayload = toSessionPayload({
      ...formState,
      type_seance: 'ENTRAINEMENT',
      adversaire: 'Ignoré',
      score_equipe: '3',
      temps_activite_min: '60',
      temps_activite_sec: '30',
      distance_km: '4.5',
      sprint_max_kmh: '20.1',
      rpe: 7
    })

    assert.equal(trainingPayload.adversaire, null)
    assert.equal(trainingPayload.score_equipe, null)
    assert.equal(trainingPayload.temps_activite_sec, 3630)
    assert.equal(trainingPayload.rpe, 7)
  })
})
