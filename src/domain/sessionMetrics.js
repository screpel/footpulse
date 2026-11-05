// src/domain/sessionMetrics.js

/**
 * Calcule le score de charge d'une séance selon la méthode de Foster :
 * Charge = (temps_activite_sec / 60) * rpe
 */
export function calculateFosterLoad(tempsActiviteSec, rpe) {
  const sec = Number(tempsActiviteSec || 0)
  const rpeVal = Number(rpe || 0)
  if (sec <= 0 || rpeVal <= 0) return null
  return Math.round((sec / 60) * rpeVal)
}

/**
 * Échelle de Borg (RPE 1 à 10) — Règle métier pure sans couplage CSS
 */
export function getRpeLevel(rpe) {
  const num = Number(rpe)
  if (!num || num < 1 || num > 10) return null

  if (num <= 3) {
    return { level: 'EASY', label: 'Facile / Récupération', shortLabel: 'Facile' }
  }
  if (num <= 6) {
    return { level: 'MODERATE', label: 'Modéré', shortLabel: 'Modéré' }
  }
  if (num <= 8) {
    return { level: 'HARD', label: 'Dur', shortLabel: 'Dur' }
  }
  return { level: 'EXTREME', label: 'Extrême', shortLabel: 'Extrême' }
}

/**
 * Formate une durée en secondes au format "MM'SS\""
 */
export function formatDuration(sec) {
  if (!sec || sec <= 0) return "0'00\""
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}'${s < 10 ? '0' : ''}${s}"`
}

/**
 * Calcule les ratios techniques et athlétiques d'une séance
 */
export function calculateSessionRatios(session) {
  const sec = Number(session?.temps_activite_sec || 0)
  const passes = Number(session?.passes || 0)
  const ballSec = Number(session?.temps_balle_sec || 0)

  const passesPerMin = sec > 0 ? (passes / (sec / 60)).toFixed(1) : '0'
  const secPerBall = passes > 0 ? (ballSec / passes).toFixed(2) : '0'
  const fosterLoad = calculateFosterLoad(sec, session?.rpe)
  const rpeLevel = getRpeLevel(session?.rpe)

  return {
    passesPerMin,
    secPerBall,
    fosterLoad,
    rpeLevel
  }
}

/**
 * Compare une séance à la moyenne des séances du même type (MATCH ou ENTRAINEMENT)
 * Retourne les écarts en pourcentage entier (ex: +14, -8)
 */
export function calculateSessionComparison(session, allSessions = []) {
  if (!session) return null
  const peers = allSessions.filter(
    s => s.type_seance === session.type_seance && Number(s.distance_km || 0) > 0
  )
  if (peers.length < 2) return null

  const avg = (getter) =>
    peers.reduce((sum, s) => sum + Number(getter(s) || 0), 0) / peers.length

  const pctDiff = (val, mean) => {
    const numVal = Number(val || 0)
    if (!mean || mean <= 0 || numVal <= 0) return null
    return Math.round(((numVal - mean) / mean) * 100)
  }

  const avgDist = avg(s => s.distance_km)
  const avgSprint = avg(s => s.sprint_max_kmh)
  const avgPasses = avg(s => s.passes)
  const avgHi = avg(s => s.haute_intensite_m)

  return {
    distancePct: pctDiff(session.distance_km, avgDist),
    sprintPct: pctDiff(session.sprint_max_kmh, avgSprint),
    passesPct: pctDiff(session.passes, avgPasses),
    highIntensityPct: pctDiff(session.haute_intensite_m, avgHi)
  }
}

/**
 * Calcule les records personnels sur l'ensemble des séances
 */
export function calculatePersonalRecords(sessions = []) {
  if (!sessions.length) {
    return { sprintMax: 0, tirMax: 0, distMax: 0, passesMax: 0, butsEnMatch: 0 }
  }

  const sprintMax = Math.max(...sessions.map(s => Number(s.sprint_max_kmh || 0)))
  const tirMax = Math.max(...sessions.map(s => Number(s.tir_max_kmh || 0)))
  const distMax = Math.max(...sessions.map(s => Number(s.distance_km || 0)))
  const passesMax = Math.max(...sessions.map(s => Number(s.passes || 0)))
  const butsEnMatch = sessions
    .filter(s => s.type_seance === 'MATCH')
    .reduce((acc, s) => acc + Number(s.buts_reels || 0), 0)

  return { sprintMax, tirMax, distMax, passesMax, butsEnMatch }
}

/**
 * Indique si une séance détient un ou plusieurs records personnels
 */
export function evaluateSessionRecords(session, records, totalSessionsCount) {
  if (!session || totalSessionsCount <= 1) {
    return {
      isSprintRecord: false,
      isTirRecord: false,
      isDistRecord: false,
      isPassesRecord: false,
      hasAnyRecord: false
    }
  }

  const isSprintRecord = records.sprintMax > 0 && Number(session.sprint_max_kmh) === records.sprintMax
  const isTirRecord = records.tirMax > 0 && Number(session.tir_max_kmh) === records.tirMax
  const isDistRecord = records.distMax > 0 && Number(session.distance_km) === records.distMax
  const isPassesRecord = records.passesMax > 0 && Number(session.passes) === records.passesMax

  return {
    isSprintRecord,
    isTirRecord,
    isDistRecord,
    isPassesRecord,
    hasAnyRecord: isSprintRecord || isTirRecord || isDistRecord || isPassesRecord
  }
}

/**
 * Calcule le bilan global des matchs (Victoires, Nuls, Défaites, Buts pour/contre)
 */
export function calculateMatchSummary(sessions = []) {
  return sessions
    .filter(s => s.type_seance === 'MATCH')
    .reduce(
      (acc, m) => {
        if (
          m.score_equipe !== null &&
          m.score_equipe !== undefined &&
          m.score_adversaire !== null &&
          m.score_adversaire !== undefined
        ) {
          const eq = Number(m.score_equipe)
          const adv = Number(m.score_adversaire)
          acc.joues += 1
          acc.bp += eq
          acc.bc += adv
          if (eq > adv) acc.v += 1
          else if (eq === adv) acc.n += 1
          else acc.d += 1
        }
        return acc
      },
      { joues: 0, v: 0, n: 0, d: 0, bp: 0, bc: 0 }
    )
}

/**
 * Parse une date YYYY-MM-DD en heure locale à midi (évite tout décalage UTC / DST)
 */
export function parseLocalDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d, 12, 0, 0)
}

/**
 * Retourne les bornes Lundi 00:00:00 -> Dimanche 23:59:59.999 de la semaine d'une date de référence
 */
export function getWeekBounds(referenceDate = new Date()) {
  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  )
  const dayOfWeek = today.getDay() // 0 = Dimanche, 1 = Lundi, ...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const monday = new Date(today)
  monday.setDate(today.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  return { monday, sunday }
}

/**
 * Calcule le bilan de charge de la semaine en cours + historique des 4 dernières semaines & indice de forme
 */
export function calculateWeeklySummary(sessions = [], referenceDate = new Date()) {
  const { monday, sunday } = getWeekBounds(referenceDate)

  const sumWeek = (start, end) => {
    const inWeek = sessions.filter((s) => {
      const d = parseLocalDate(s.date_seance)
      return d && d >= start && d <= end
    })
    const totalSessions = inWeek.length
    const matchCount = inWeek.filter(s => s.type_seance === 'MATCH').length
    const trainCount = inWeek.filter(s => s.type_seance === 'ENTRAINEMENT').length
    const totalDistanceKm = inWeek.reduce((acc, s) => acc + Number(s.distance_km || 0), 0)
    const totalHighIntensityM = inWeek.reduce((acc, s) => acc + Number(s.haute_intensite_m || 0), 0)
    const totalCharge = inWeek.reduce((acc, s) => {
      const load = calculateFosterLoad(s.temps_activite_sec, s.rpe)
      return acc + (load || 0)
    }, 0)

    return {
      monday: start,
      sunday: end,
      totalSessions,
      matchCount,
      trainCount,
      totalDistanceKm,
      totalHighIntensityM,
      totalCharge
    }
  }

  const current = sumWeek(monday, sunday)

  // Historique des 4 semaines précédentes (S-4 à S-1)
  const previousWeeks = []
  for (let i = 4; i >= 1; i--) {
    const prevMon = new Date(monday)
    prevMon.setDate(monday.getDate() - i * 7)
    prevMon.setHours(0, 0, 0, 0)

    const prevSun = new Date(prevMon)
    prevSun.setDate(prevMon.getDate() + 6)
    prevSun.setHours(23, 59, 59, 999)

    previousWeeks.push(sumWeek(prevMon, prevSun))
  }

  const activePrevWeeks = previousWeeks.filter(w => w.totalCharge > 0)
  const chronicCharge = activePrevWeeks.length > 0
    ? Math.round(activePrevWeeks.reduce((acc, w) => acc + w.totalCharge, 0) / activePrevWeeks.length)
    : 0

  let loadLevel = 'INTENSIVE'
  let loadLabel = 'Charge intensive'
  if (current.totalCharge === 0) {
    loadLevel = 'REST'
    loadLabel = 'Repos'
  } else if (current.totalCharge < 400) {
    loadLevel = 'LIGHT'
    loadLabel = 'Charge légère'
  } else if (current.totalCharge < 900) {
    loadLevel = 'OPTIMAL'
    loadLabel = 'Charge optimale'
  } else if (current.totalCharge < 1400) {
    loadLevel = 'HIGH'
    loadLabel = 'Charge élevée'
  }

  // Indice de forme / fraîcheur (comparaison charge semaine vs moyenne chronique)
  let formStatus = 'NEUTRAL'
  let formLabel = 'Rythme régulier'
  if (chronicCharge > 0 && current.totalCharge > 0) {
    const ratio = current.totalCharge / chronicCharge
    if (ratio < 0.75) {
      formStatus = 'EASY'
      formLabel = 'Semaine de fraîcheur'
    } else if (ratio <= 1.25) {
      formStatus = 'MODERATE'
      formLabel = 'Zone de forme optimale'
    } else if (ratio <= 1.5) {
      formStatus = 'HARD'
      formLabel = 'Charge en hausse'
    } else {
      formStatus = 'EXTREME'
      formLabel = 'Attention surcharge'
    }
  }

  return {
    ...current,
    loadLevel,
    loadLabel,
    chronicCharge,
    formStatus,
    formLabel,
    weekHistory: [...previousWeeks, current]
  }
}

/**
 * Filtre les suggestions de clubs par nom de club ou par ville associée
 */
export function filterClubSuggestions(query, teamNames = [], clubCityMap = {}, limit = 25) {
  const uniqueTeams = Array.from(new Set(teamNames.filter(Boolean)))
  const cleanQuery = (query || '').trim().toLowerCase()

  if (!cleanQuery) {
    return uniqueTeams.slice(0, limit)
  }

  return uniqueTeams
    .filter((club) => {
      const nameLower = club.toLowerCase()
      if (nameLower === cleanQuery) return false
      const cityLower = (clubCityMap[club] || '').toLowerCase()
      return nameLower.includes(cleanQuery) || cityLower.includes(cleanQuery)
    })
    .slice(0, limit)
}

/**
 * Résout automatiquement la ville associée à un nom de club (exact ou avec suffixe ex: "(U13F)")
 */
export function resolveCityForClub(clubName, clubCityMap = {}) {
  if (!clubName || typeof clubName !== 'string') return null
  const clean = clubName.trim()
  if (!clean) return null

  if (clubCityMap[clean]) return clubCityMap[clean]

  const lower = clean.toLowerCase()
  const entries = Object.entries(clubCityMap)

  for (const [nom, ville] of entries) {
    if (nom.toLowerCase() === lower) return ville
  }

  for (const [nom, ville] of entries) {
    const nomLower = nom.toLowerCase()
    if (nomLower.length >= 4 && (lower.includes(nomLower) || nomLower.includes(lower))) {
      return ville
    }
  }

  return null
}


