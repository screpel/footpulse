// src/components/SessionModal.jsx
import React, { useState, useEffect } from 'react'
import { X, CloudRain, Save, Loader2, Trash2 } from 'lucide-react'
import { supabase } from '../services/supabase'
import { getHistoricalWeather } from '../services/weather'

export default function SessionModal({ isOpen, onClose, onSessionSaved, sessionToEdit }) {
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [fetchingWeather, setFetchingWeather] = useState(false)

    const isEditMode = Boolean(sessionToEdit)

    const emptyForm = {
        date_seance: new Date().toISOString().split('T')[0],
        heure_debut: '18:00',
        type_seance: 'ENTRAINEMENT',
        lieu: 'Bondues',
        format_jeu: 'FOOT_8',
        surface: 'SYNTHETIQUE',
        equipe: 'U13F',
        adversaire: '',
        score_equipe: '',
        score_adversaire: '',
        buts_reels: 0,
        passes_d_reelles: 0,
        meteo_temps: '',
        temperature_c: '',
        distance_km: '',
        temps_activite_min: '',
        temps_activite_sec: '',
        sprint_max_kmh: '',
        tir_max_kmh: '',
        tirs: 0,
        passes: '',
        accelerations: '',
        decelerations: '',
        temps_balle_sec: ''
    }

    const [form, setForm] = useState(emptyForm)

    useEffect(() => {
        if (!isOpen) return

        if (sessionToEdit) {
            const min = Math.floor((sessionToEdit.temps_activite_sec || 0) / 60)
            const sec = (sessionToEdit.temps_activite_sec || 0) % 60

            setForm({
                date_seance: sessionToEdit.date_seance || '',
                heure_debut: sessionToEdit.heure_debut ? sessionToEdit.heure_debut.slice(0, 5) : '18:00',
                type_seance: sessionToEdit.type_seance || 'ENTRAINEMENT',
                lieu: sessionToEdit.lieu || 'Bondues',
                format_jeu: sessionToEdit.format_jeu || 'FOOT_8',
                surface: sessionToEdit.surface || 'SYNTHETIQUE',
                equipe: sessionToEdit.equipe || '',
                adversaire: sessionToEdit.adversaire || '',
                score_equipe: sessionToEdit.score_equipe ?? '',
                score_adversaire: sessionToEdit.score_adversaire ?? '',
                buts_reels: sessionToEdit.buts_reels || 0,
                passes_d_reelles: sessionToEdit.passes_d_reelles || 0,
                meteo_temps: sessionToEdit.meteo_temps || '',
                temperature_c: sessionToEdit.temperature_c ?? '',
                distance_km: sessionToEdit.distance_km ?? '',
                temps_activite_min: min,
                temps_activite_sec: sec,
                sprint_max_kmh: sessionToEdit.sprint_max_kmh ?? '',
                tir_max_kmh: sessionToEdit.tir_max_kmh ?? '',
                tirs: sessionToEdit.tirs ?? 0,
                passes: sessionToEdit.passes ?? '',
                accelerations: sessionToEdit.accelerations ?? '',
                decelerations: sessionToEdit.decelerations ?? '',
                temps_balle_sec: sessionToEdit.temps_balle_sec ?? ''
            })
        } else {
            setForm(emptyForm)
        }
    }, [isOpen, sessionToEdit])

    if (!isOpen) return null

    const isMatch = form.type_seance === 'MATCH'

    const handleFetchWeather = async () => {
        setFetchingWeather(true)
        const result = await getHistoricalWeather(form.date_seance, form.heure_debut, form.lieu)
        if (result) {
            setForm(prev => ({
                ...prev,
                temperature_c: result.temperature ?? '',
                meteo_temps: result.condition
            }))
        }
        setFetchingWeather(false)
    }

    const handleDelete = async () => {
        if (!window.confirm('Supprimer définitivement cette séance ?')) return

        setDeleting(true)
        const { error } = await supabase
            .from('sessions')
            .delete()
            .eq('id', sessionToEdit.id)

        setDeleting(false)
        if (error) {
            alert('Erreur lors de la suppression : ' + error.message)
        } else {
            onSessionSaved()
            onClose()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const totalTempsSec = (parseInt(form.temps_activite_min || 0, 10) * 60) + parseInt(form.temps_activite_sec || 0, 10)

        const payload = {
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
            distance_km: parseFloat(form.distance_km),
            temps_activite_sec: totalTempsSec,
            sprint_max_kmh: parseFloat(form.sprint_max_kmh),
            tir_max_kmh: parseFloat(form.tir_max_kmh || 0),
            tirs: parseInt(form.tirs || 0, 10),
            passes: parseInt(form.passes || 0, 10),
            accelerations: parseInt(form.accelerations || 0, 10),
            decelerations: parseInt(form.decelerations || 0, 10),
            temps_balle_sec: parseInt(form.temps_balle_sec || 0, 10)
        }

        const { error } = isEditMode
            ? await supabase.from('sessions').update(payload).eq('id', sessionToEdit.id)
            : await supabase.from('sessions').insert([payload])

        setLoading(false)

        if (error) {
            alert("Erreur lors de l'enregistrement : " + error.message)
        } else {
            onSessionSaved()
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <h2 className="text-lg font-bold text-white">
                        {isEditMode ? 'Modifier la séance' : 'Nouvelle séance'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {/* Contexte général */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-slate-400 block mb-1">Type de séance</label>
                            <select
                                value={form.type_seance}
                                onChange={e => setForm({...form, type_seance: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-medium"
                            >
                                <option value="ENTRAINEMENT">Entraînement</option>
                                <option value="MATCH">Match officiel</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-slate-400 block mb-1">Lieu</label>
                            <input
                                type="text"
                                value={form.lieu}
                                onChange={e => setForm({...form, lieu: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-slate-400 block mb-1">Date</label>
                            <input
                                type="date"
                                value={form.date_seance}
                                onChange={e => setForm({...form, date_seance: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-slate-400 block mb-1">Heure de début</label>
                            <input
                                type="time"
                                value={form.heure_debut}
                                onChange={e => setForm({...form, heure_debut: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                                required
                            />
                        </div>
                    </div>

                    {/* Météo */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                            <span className="text-slate-300 font-semibold block">Météo à l'horaire</span>
                            <span className="text-[10px] text-slate-500">
                {form.temperature_c !== '' ? `${form.temperature_c}°C — ${form.meteo_temps} (${form.lieu})` : 'Cliquer pour synchroniser'}
              </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleFetchWeather}
                            disabled={fetchingWeather}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
                        >
                            {fetchingWeather ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudRain className="w-3.5 h-3.5 text-sky-400" />}
                            {fetchingWeather ? 'Calcul...' : 'Météo'}
                        </button>
                    </div>

                    {/* Match stats */}
                    {isMatch && (
                        <div className="bg-slate-950/70 p-3 rounded-xl border border-emerald-500/20 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Bilan du Match
              </span>
                            <div>
                                <label className="text-slate-400 block mb-0.5">Adversaire</label>
                                <input
                                    type="text"
                                    placeholder="ex: Marcq-en-Barœul"
                                    value={form.adversaire}
                                    onChange={e => setForm({...form, adversaire: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-slate-400 block mb-0.5">Score équipe</label>
                                    <input
                                        type="number"
                                        value={form.score_equipe}
                                        onChange={e => setForm({...form, score_equipe: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-0.5">Score adv.</label>
                                    <input
                                        type="number"
                                        value={form.score_adversaire}
                                        onChange={e => setForm({...form, score_adversaire: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-slate-400 block mb-0.5">Buts marqués</label>
                                    <input
                                        type="number"
                                        value={form.buts_reels}
                                        onChange={e => setForm({...form, buts_reels: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-0.5">Passes décisives</label>
                                    <input
                                        type="number"
                                        value={form.passes_d_reelles}
                                        onChange={e => setForm({...form, passes_d_reelles: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footbar */}
                    <div className="space-y-2 pt-1">
                        <h3 className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px]">Chiffres Footbar</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-slate-400 block mb-0.5">Distance (km)</label>
                                <input type="number" step="0.1" value={form.distance_km} onChange={e => setForm({...form, distance_km: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" required />
                            </div>
                            <div>
                                <label className="text-slate-400 block mb-0.5">Temps d'activité</label>
                                <div className="flex gap-1 items-center">
                                    <input type="number" placeholder="Min" value={form.temps_activite_min} onChange={e => setForm({...form, temps_activite_min: e.target.value})} className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" required />
                                    <span className="text-slate-500">:</span>
                                    <input type="number" placeholder="Sec" value={form.temps_activite_sec} onChange={e => setForm({...form, temps_activite_sec: e.target.value})} className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" required />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-slate-400 block mb-0.5">Sprint max (km/h)</label>
                                <input type="number" step="0.1" value={form.sprint_max_kmh} onChange={e => setForm({...form, sprint_max_kmh: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" required />
                            </div>
                            <div>
                                <label className="text-slate-400 block mb-0.5">Tir max (km/h)</label>
                                <input type="number" step="0.1" value={form.tir_max_kmh} onChange={e => setForm({...form, tir_max_kmh: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-slate-400 block mb-0.5">Passes</label>
                                <input type="number" value={form.passes} onChange={e => setForm({...form, passes: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" required />
                            </div>
                            <div>
                                <label className="text-slate-400 block mb-0.5">Tirs Footbar</label>
                                <input type="number" value={form.tirs} onChange={e => setForm({...form, tirs: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="text-slate-400 block mb-0.5">Accélérations</label>
                                <input type="number" value={form.accelerations} onChange={e => setForm({...form, accelerations: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" required />
                            </div>
                            <div>
                                <label className="text-slate-400 block mb-0.5">Décélérations</label>
                                <input type="number" value={form.decelerations} onChange={e => setForm({...form, decelerations: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" required />
                            </div>
                            <div>
                                <label className="text-slate-400 block mb-0.5">Possession (sec)</label>
                                <input type="number" value={form.temps_balle_sec} onChange={e => setForm({...form, temps_balle_sec: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" required />
                            </div>
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex gap-2 pt-2">
                        {isEditMode && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting || loading}
                                className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 px-3 py-3 rounded-xl flex items-center justify-center transition-colors"
                                title="Supprimer la séance"
                            >
                                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={loading || deleting}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isEditMode ? 'Enregistrer les modifications' : 'Enregistrer la séance'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}