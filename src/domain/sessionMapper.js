// src/domain/sessionMapper.js

/**
 * Convertit une entité Session (ou null en création) vers l'état du formulaire UI
 */
export function toSessionFormState(sessionToEdit, defaults = {}) {
  const defaultLieu = defaults.lieu || ''
  const defaultEquipe = defaults.equipe || ''

  if (sessionToEdit) {
    const totalSec = Number(sessionToEdit.temps_activite_sec || 0)
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60

    return {
      date_seance: sessionToEdit.date_seance || '',
      heure_debut: sessionToEdit.heure_debut ? sessionToEdit.heure_debut.slice(0, 5) : '18:00',
      type_seance: sessionToEdit.type_seance || 'ENTRAINEMENT',
      lieu: sessionToEdit.lieu || defaultLieu,
      format_jeu: sessionToEdit.format_jeu || 'FOOT_8',
      surface: sessionToEdit.surface || 'SYNTHETIQUE',
      equipe: sessionToEdit.equipe || defaultEquipe,
      adversaire: sessionToEdit.adversaire || '',
      score_equipe: sessionToEdit.score_equipe ?? '',
      score_adversaire: sessionToEdit.score_adversaire ?? '',
      buts_reels: sessionToEdit.buts_reels || 0,
      passes_d_reelles: sessionToEdit.passes_d_reelles || 0,
      meteo_temps: sessionToEdit.meteo_temps || '',
      temperature_c: sessionToEdit.temperature_c ?? '',
      notes: sessionToEdit.notes || '',
      rpe: sessionToEdit.rpe ?? null,
      distance_km: sessionToEdit.distance_km ?? '',
      haute_intensite_m: sessionToEdit.haute_intensite_m ?? 0,
      temps_activite_min: min,
      temps_activite_sec: sec,
      sprint_max_kmh: sessionToEdit.sprint_max_kmh ?? '',
      accelerations: sessionToEdit.accelerations ?? '',
      decelerations: sessionToEdit.decelerations ?? '',
      tirs: sessionToEdit.tirs ?? 0,
      tir_max_kmh: sessionToEdit.tir_max_kmh ?? '',
      passes: sessionToEdit.passes ?? '',
      temps_balle_sec: sessionToEdit.temps_balle_sec ?? ''
    }
  }

  return {
    date_seance: new Date().toISOString().split('T')[0],
    heure_debut: '18:00',
    type_seance: 'ENTRAINEMENT',
    lieu: defaultLieu,
    format_jeu: 'FOOT_8',
    surface: 'SYNTHETIQUE',
    equipe: defaultEquipe,
    adversaire: '',
    score_equipe: '',
    score_adversaire: '',
    buts_reels: 0,
    passes_d_reelles: 0,
    meteo_temps: '',
    temperature_c: '',
    notes: '',
    rpe: null,
    distance_km: '',
    haute_intensite_m: '',
    temps_activite_min: '',
    temps_activite_sec: '',
    sprint_max_kmh: '',
    accelerations: '',
    decelerations: '',
    tirs: 0,
    tir_max_kmh: '',
    passes: '',
    temps_balle_sec: ''
  }
}

/**
 * Convertit l'état du formulaire UI en payload normalisé pour la persistance
 */
export function toSessionPayload(form) {
  const isMatch = form.type_seance === 'MATCH'
  const totalTempsSec =
    parseInt(form.temps_activite_min || 0, 10) * 60 +
    parseInt(form.temps_activite_sec || 0, 10)

  return {
    date_seance: form.date_seance,
    heure_debut: form.heure_debut,
    type_seance: form.type_seance,
    lieu: form.lieu,
    format_jeu: form.format_jeu,
    surface: form.surface,
    equipe: form.equipe || null,
    adversaire: isMatch ? (form.adversaire || null) : null,
    score_equipe: isMatch && form.score_equipe !== '' ? parseInt(form.score_equipe, 10) : null,
    score_adversaire: isMatch && form.score_adversaire !== '' ? parseInt(form.score_adversaire, 10) : null,
    buts_reels: isMatch ? parseInt(form.buts_reels || 0, 10) : 0,
    passes_d_reelles: isMatch ? parseInt(form.passes_d_reelles || 0, 10) : 0,
    meteo_temps: form.meteo_temps || null,
    temperature_c: form.temperature_c !== '' ? parseFloat(form.temperature_c) : null,
    notes: (form.notes || '').trim() || null,
    rpe: form.rpe ? parseInt(form.rpe, 10) : null,
    distance_km: parseFloat(form.distance_km),
    haute_intensite_m: parseInt(form.haute_intensite_m || 0, 10),
    temps_activite_sec: totalTempsSec,
    sprint_max_kmh: parseFloat(form.sprint_max_kmh),
    accelerations: parseInt(form.accelerations || 0, 10),
    decelerations: parseInt(form.decelerations || 0, 10),
    tirs: parseInt(form.tirs || 0, 10),
    tir_max_kmh: parseFloat(form.tir_max_kmh || 0),
    passes: parseInt(form.passes || 0, 10),
    temps_balle_sec: parseInt(form.temps_balle_sec || 0, 10)
  }
}
