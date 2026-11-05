// src/domain/performanceAnalytics.js
import { calculateFosterLoad, parseLocalDate } from './sessionMetrics.js'

/**
 * Détermine la saison sportive (Septembre N -> Août N+1) d'une date YYYY-MM-DD
 */
export function getSeasonFromDate(dateStr) {
  const d = parseLocalDate(dateStr)
  if (!d) return null
  const year = d.getFullYear()
  const month = d.getMonth() // 0 = Janvier, ..., 8 = Septembre
  if (month >= 8) {
    return `${year}-${year + 1}`
  }
  return `${year - 1}-${year}`
}

/**
 * Liste toutes les saisons sportives présentes dans les séances (triées de la plus récente à la plus ancienne)
 */
export function getAvailableSeasons(sessions = []) {
  const set = new Set()
  sessions.forEach((s) => {
    const season = getSeasonFromDate(s.date_seance)
    if (season) set.add(season)
  })
  return Array.from(set).sort().reverse()
}

const clampScore = (val) => Math.max(0, Math.min(100, Math.round(val)))

/**
 * Calcule le profil sur 100 (style carte Footbar+ / Radar 5 axes) adapté au calibre U13F
 */
export function calculatePlayerProfile(sessions = []) {
  if (!sessions.length) {
    return {
      overall: 0,
      profileLabel: 'En attente de séances',
      axes: [
        { key: 'endurance', label: 'Volume', value: 0 },
        { key: 'vitesse', label: 'Vitesse', value: 0 },
        { key: 'explosivite', label: 'Explosivité', value: 0 },
        { key: 'technique', label: 'Ballon & Passes', value: 0 },
        { key: 'puissance', label: 'Frappe', value: 0 }
      ]
    }
  }

  const maxSprint = Math.max(...sessions.map(s => Number(s.sprint_max_kmh || 0)))
  const avgSprint =
    sessions.reduce((sum, s) => sum + Number(s.sprint_max_kmh || 0), 0) / sessions.length

  const maxDist = Math.max(...sessions.map(s => Number(s.distance_km || 0)))
  const avgDist =
    sessions.reduce((sum, s) => sum + Number(s.distance_km || 0), 0) / sessions.length

  const avgActionsExplosives =
    sessions.reduce(
      (sum, s) =>
        sum +
        Number(s.accelerations || 0) +
        Number(s.decelerations || 0) +
        Number(s.haute_intensite_m || 0) / 5,
      0
    ) / sessions.length

  const avgPassesPerMin =
    sessions.reduce((sum, s) => {
      const min = Number(s.temps_activite_sec || 0) / 60
      return sum + (min > 0 ? Number(s.passes || 0) / min : 0)
    }, 0) / sessions.length

  const maxShot = Math.max(...sessions.map(s => Number(s.tir_max_kmh || 0)))
  const avgShots =
    sessions.reduce((sum, s) => sum + Number(s.tirs || 0) + Number(s.buts_reels || 0) * 2, 0) /
    sessions.length

  // Barèmes calibrés U13F foot à 8 (plafonds 100 atteints pour ~6km, ~24km/h sprint, ~65km/h frappe, ~2 passes/min)
  const endurance = clampScore((avgDist / 4.5) * 60 + (maxDist / 6.0) * 40)
  const vitesse = clampScore((maxSprint / 24.0) * 65 + (avgSprint / 20.0) * 35)
  const explosivite = clampScore((avgActionsExplosives / 110) * 100)
  const technique = clampScore((avgPassesPerMin / 1.8) * 100)
  const puissance = clampScore((maxShot / 62.0) * 75 + Math.min(25, avgShots * 5))

  const axes = [
    { key: 'endurance', label: 'Volume', value: endurance },
    { key: 'vitesse', label: 'Vitesse', value: vitesse },
    { key: 'explosivite', label: 'Explosivité', value: explosivite },
    { key: 'technique', label: 'Passes', value: technique },
    { key: 'puissance', label: 'Frappe', value: puissance }
  ]

  const overall = Math.round(
    axes.reduce((sum, a) => sum + a.value, 0) / axes.length
  )

  const bestAxis = [...axes].sort((a, b) => b.value - a.value)[0]
  const profileTitles = {
    endurance: 'Box-to-Box Infatigable',
    vitesse: 'Flèche de Couloir',
    explosivite: 'Dynamite Athlétique',
    technique: 'Métronome du Jeu',
    puissance: 'Artilleuse'
  }

  return {
    overall,
    profileLabel: profileTitles[bestAxis.key] || 'Joueuse Complète',
    axes
  }
}

/**
 * Compare les performances moyennes en Compétition (Match officiel / Tournoi) vs Entraînement
 */
export function calculateMatchVsTraining(sessions = []) {
  const matches = sessions.filter(
    s => s.type_seance === 'MATCH' || s.type_seance === 'TOURNOI'
  )
  const trainings = sessions.filter(s => s.type_seance === 'ENTRAINEMENT')

  const computeGroupStats = (list) => {
    if (!list.length) {
      return {
        count: 0,
        avgDistKm: 0,
        avgSprintMax: 0,
        avgHighIntensityM: 0,
        avgPassesPerMin: 0,
        avgRpe: 0
      }
    }
    const count = list.length
    const avgDistKm = list.reduce((a, s) => a + Number(s.distance_km || 0), 0) / count
    const avgSprintMax = list.reduce((a, s) => a + Number(s.sprint_max_kmh || 0), 0) / count
    const avgHighIntensityM = list.reduce((a, s) => a + Number(s.haute_intensite_m || 0), 0) / count
    const avgPassesPerMin =
      list.reduce((a, s) => {
        const min = Number(s.temps_activite_sec || 0) / 60
        return a + (min > 0 ? Number(s.passes || 0) / min : 0)
      }, 0) / count

    const withRpe = list.filter(s => Number(s.rpe || 0) > 0)
    const avgRpe = withRpe.length
      ? withRpe.reduce((a, s) => a + Number(s.rpe), 0) / withRpe.length
      : 0

    return {
      count,
      avgDistKm: Number(avgDistKm.toFixed(1)),
      avgSprintMax: Number(avgSprintMax.toFixed(1)),
      avgHighIntensityM: Math.round(avgHighIntensityM),
      avgPassesPerMin: Number(avgPassesPerMin.toFixed(2)),
      avgRpe: Number(avgRpe.toFixed(1))
    }
  }

  return {
    match: computeGroupStats(matches),
    training: computeGroupStats(trainings)
  }
}

/**
 * Catégorise une condition météo texte en famille climatique
 */
export function categorizeWeatherCondition(condition) {
  if (!condition || typeof condition !== 'string') return null
  const c = condition.toLowerCase()
  if (c.includes('pluie') || c.includes('averse') || c.includes('neige') || c.includes('orage')) {
    return 'RAINY'
  }
  if (c.includes('soleil') || c.includes('ensoleillé') || c.includes('clair')) {
    return 'SUNNY'
  }
  return 'CLOUDY'
}

/**
 * Catégorise une température (°C) en tranche thermique
 */
export function categorizeTemperature(tempC) {
  if (tempC === null || tempC === undefined || tempC === '') return null
  const t = Number(tempC)
  if (Number.isNaN(t)) return null
  if (t < 10) return 'COLD'
  if (t <= 18) return 'MILD'
  return 'WARM'
}

/**
 * Analyse l'impact des conditions climatiques (Météo & Température) sur les performances
 */
export function calculateWeatherImpact(sessions = []) {
  const summarizeBucket = (list) => {
    if (!list.length) return null
    const count = list.length

    // Distance ramenée à 60 min d'activité pour comparer équitablement les séances de durées différentes
    const avgDistPerHour =
      list.reduce((acc, s) => {
        const hours = Number(s.temps_activite_sec || 0) / 3600
        return acc + (hours > 0 ? Number(s.distance_km || 0) / hours : Number(s.distance_km || 0))
      }, 0) / count

    const avgSprint =
      list.reduce((acc, s) => acc + Number(s.sprint_max_kmh || 0), 0) / count

    const avgPassesPerMin =
      list.reduce((acc, s) => {
        const min = Number(s.temps_activite_sec || 0) / 60
        return acc + (min > 0 ? Number(s.passes || 0) / min : 0)
      }, 0) / count

    const avgHighIntensity =
      list.reduce((acc, s) => acc + Number(s.haute_intensite_m || 0), 0) / count

    const withRpe = list.filter(s => Number(s.rpe || 0) > 0)
    const avgRpe = withRpe.length
      ? withRpe.reduce((acc, s) => acc + Number(s.rpe), 0) / withRpe.length
      : null

    return {
      count,
      avgDistPerHour: Number(avgDistPerHour.toFixed(1)),
      avgSprint: Number(avgSprint.toFixed(1)),
      avgPassesPerMin: Number(avgPassesPerMin.toFixed(2)),
      avgHighIntensity: Math.round(avgHighIntensity),
      avgRpe: avgRpe !== null ? Number(avgRpe.toFixed(1)) : null
    }
  }

  const byCondition = {
    SUNNY: {
      key: 'SUNNY',
      label: 'Ensoleillé / Sec',
      stats: summarizeBucket(sessions.filter(s => categorizeWeatherCondition(s.meteo_temps) === 'SUNNY'))
    },
    CLOUDY: {
      key: 'CLOUDY',
      label: 'Éclaircies / Nuageux',
      stats: summarizeBucket(sessions.filter(s => categorizeWeatherCondition(s.meteo_temps) === 'CLOUDY'))
    },
    RAINY: {
      key: 'RAINY',
      label: 'Pluie / Humide',
      stats: summarizeBucket(sessions.filter(s => categorizeWeatherCondition(s.meteo_temps) === 'RAINY'))
    }
  }

  const byTemperature = {
    COLD: {
      key: 'COLD',
      label: 'Froid (< 10°C)',
      stats: summarizeBucket(sessions.filter(s => categorizeTemperature(s.temperature_c) === 'COLD'))
    },
    MILD: {
      key: 'MILD',
      label: 'Tempéré (10–18°C)',
      stats: summarizeBucket(sessions.filter(s => categorizeTemperature(s.temperature_c) === 'MILD'))
    },
    WARM: {
      key: 'WARM',
      label: 'Chaud (> 18°C)',
      stats: summarizeBucket(sessions.filter(s => categorizeTemperature(s.temperature_c) === 'WARM'))
    }
  }

  // Génération automatique d'enseignements (insights) basés sur les données observées
  const insights = []
  const activeConditions = Object.values(byCondition).filter(c => c.stats && c.stats.count > 0)
  const activeTemps = Object.values(byTemperature).filter(t => t.stats && t.stats.count > 0)

  if (activeConditions.length >= 2) {
    const bestSprintCond = [...activeConditions].sort((a, b) => b.stats.avgSprint - a.stats.avgSprint)[0]
    const bestPassCond = [...activeConditions].sort((a, b) => b.stats.avgPassesPerMin - a.stats.avgPassesPerMin)[0]

    insights.push(
      `Vitesse de pointe supérieure par temps ${bestSprintCond.label.toLowerCase()} (${bestSprintCond.stats.avgSprint} km/h en moyenne).`
    )
    if (bestPassCond.stats.avgPassesPerMin > 0) {
      insights.push(
        `Meilleure cadence technique (${bestPassCond.stats.avgPassesPerMin} passes/min) sous condition "${bestPassCond.label}".`
      )
    }
  }

  if (activeTemps.length >= 2) {
    const bestVolTemp = [...activeTemps].sort((a, b) => b.stats.avgDistPerHour - a.stats.avgDistPerHour)[0]
    insights.push(
      `Volume de course optimal par temps ${bestVolTemp.label.toLowerCase()} (${bestVolTemp.stats.avgDistPerHour} km/h d'activité).`
    )
  }

  const totalAnalyzed = sessions.filter(
    s => s.meteo_temps || (s.temperature_c !== null && s.temperature_c !== undefined && s.temperature_c !== '')
  ).length

  return {
    totalAnalyzed,
    conditions: Object.values(byCondition),
    temperatures: Object.values(byTemperature),
    insights
  }
}

/**
 * Calcule les totaux de saison et la progression vers les objectifs (Gamification)
 */
export function calculateSeasonTotalsAndGoals(sessions = []) {
  const totalSessions = sessions.length
  const totalMatches = sessions.filter(s => s.type_seance === 'MATCH').length
  const totalTournaments = sessions.filter(s => s.type_seance === 'TOURNOI').length
  const totalTrainings = sessions.filter(s => s.type_seance === 'ENTRAINEMENT').length

  const totalDistanceKm = Number(
    sessions.reduce((sum, s) => sum + Number(s.distance_km || 0), 0).toFixed(1)
  )
  const totalDurationSec = sessions.reduce((sum, s) => sum + Number(s.temps_activite_sec || 0), 0)
  const totalPasses = sessions.reduce((sum, s) => sum + Number(s.passes || 0), 0)
  const totalHighIntensityM = sessions.reduce((sum, s) => sum + Number(s.haute_intensite_m || 0), 0)
  const totalShots = sessions.reduce((sum, s) => sum + Number(s.tirs || 0), 0)
  const totalGoals = sessions
    .filter(s => s.type_seance === 'MATCH' || s.type_seance === 'TOURNOI')
    .reduce((sum, s) => sum + Number(s.buts_reels || 0), 0)
  const totalAssists = sessions
    .filter(s => s.type_seance === 'MATCH' || s.type_seance === 'TOURNOI')
    .reduce((sum, s) => sum + Number(s.passes_d_reelles || 0), 0)
  const totalCharge = sessions.reduce((sum, s) => {
    const load = calculateFosterLoad(s.temps_activite_sec, s.rpe)
    return sum + (load || 0)
  }, 0)

  const pickNextTier = (current, tiers) => {
    const next = tiers.find(t => current < t) || tiers[tiers.length - 1]
    const pct = Math.min(100, Math.round((current / next) * 100))
    return { current, target: next, progressPct: pct }
  }

  const goals = [
    {
      key: 'distance',
      label: 'Cap kilométrique saison',
      unit: 'km',
      ...pickNextTier(totalDistanceKm, [25, 50, 100, 150, 250])
    },
    {
      key: 'passes',
      label: 'Volume de passes distribuées',
      unit: 'passes',
      ...pickNextTier(totalPasses, [250, 500, 1000, 2000, 3500])
    },
    {
      key: 'high_intensity',
      label: 'Distance à haute intensité',
      unit: 'm',
      ...pickNextTier(totalHighIntensityM, [500, 1500, 3000, 5000, 10000])
    },
    {
      key: 'decisive',
      label: 'Actions décisives en match (Buts + Passes D.)',
      unit: 'actions',
      ...pickNextTier(totalGoals + totalAssists, [5, 10, 20, 35, 50])
    }
  ]

  return {
    totalSessions,
    totalMatches,
    totalTournaments,
    totalTrainings,
    totalDistanceKm,
    totalDurationSec,
    totalPasses,
    totalHighIntensityM,
    totalShots,
    totalGoals,
    totalAssists,
    totalCharge,
    goals
  }
}
