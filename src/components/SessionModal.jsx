// src/components/SessionModal.jsx
import { useState } from 'react'
import { X, CloudRain, Save, Loader2, Trash2, Flame } from 'lucide-react'
import { sessionRepository } from '../services/sessionRepository'
import { clubRepository } from '../services/clubRepository'
import { getHistoricalWeather } from '../services/weather'
import { calculateFosterLoad, resolveCityForClub } from '../domain/sessionMetrics'
import { toSessionFormState, toSessionPayload } from '../domain/sessionMapper'
import { getRpeTheme } from './rpeTheme'
import TeamInput from './TeamInput'

export default function SessionModal({
    isOpen,
    onClose,
    onSessionSaved,
    sessionToEdit,
    knownTeams = [],
    clubCityMap = {},
    defaultLieu = '',
    defaultEquipe = ''
}) {
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [fetchingWeather, setFetchingWeather] = useState(false)
    const [matchVenue, setMatchVenue] = useState('DOMICILE') // 'DOMICILE' | 'EXTERIEUR'
    const [form, setForm] = useState(() =>
        toSessionFormState(sessionToEdit, { lieu: defaultLieu, equipe: defaultEquipe })
    )

    if (!isOpen) return null

    const isEditMode = Boolean(sessionToEdit)
    const isMatch = form.type_seance === 'MATCH'

    const handleEquipeChange = (val, explicitCity) => {
        const matchedCity = explicitCity || resolveCityForClub(val, clubCityMap)
        setForm(prev => ({
            ...prev,
            equipe: val,
            lieu: matchedCity || prev.lieu
        }))
    }

    const handleAdversaireChange = (val, explicitCity) => {
        const matchedCity = explicitCity || resolveCityForClub(val, clubCityMap)
        setForm(prev => ({
            ...prev,
            adversaire: val,
            lieu: matchVenue === 'EXTERIEUR' && matchedCity ? matchedCity : prev.lieu
        }))
    }

    const handleVenueSwitch = (venue) => {
        setMatchVenue(venue)
        const targetClub = venue === 'EXTERIEUR' ? form.adversaire : form.equipe
        const matchedCity = resolveCityForClub(targetClub, clubCityMap)
        if (matchedCity) {
            setForm(prev => ({ ...prev, lieu: matchedCity }))
        }
    }

    const totalTempsSecPreview =
        (parseInt(form.temps_activite_min || 0, 10) * 60) + parseInt(form.temps_activite_sec || 0, 10)
    const chargeFosterPreview = calculateFosterLoad(totalTempsSecPreview, form.rpe)
    const currentRpeTheme = getRpeTheme(form.rpe)

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
        const { error } = await sessionRepository.remove(sessionToEdit.id)
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

        const payload = toSessionPayload(form)
        const { error } = isEditMode
            ? await sessionRepository.update(sessionToEdit.id, payload)
            : await sessionRepository.create(payload)

        setLoading(false)

        if (error) {
            alert("Erreur lors de l'enregistrement : " + error.message)
        } else {
            await clubRepository.ensureClubsExist([
                { nom: payload.equipe, ville: null },
                { nom: payload.adversaire, ville: null }
            ])
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
                    {/* Type et Lieu */}
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
                            <label className="text-slate-400 block mb-1">Lieu (Ville / Stade)</label>
                            <input
                                type="text"
                                value={form.lieu}
                                onChange={e => setForm({...form, lieu: e.target.value})}
                                placeholder="Ville ou stade..."
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
                            <span className="text-slate-300 font-semibold block">Météo à l&apos;horaire</span>
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

                    {/* Section Match */}
                    {isMatch && (
                        <div className="bg-slate-950/70 p-3 rounded-xl border border-emerald-500/30 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                                    Rencontre & Score
                                </span>
                                <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-semibold">
                                    <button
                                        type="button"
                                        onClick={() => handleVenueSwitch('DOMICILE')}
                                        className={`px-2 py-0.5 rounded-md transition-colors ${
                                            matchVenue === 'DOMICILE'
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        Domicile
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleVenueSwitch('EXTERIEUR')}
                                        className={`px-2 py-0.5 rounded-md transition-colors ${
                                            matchVenue === 'EXTERIEUR'
                                                ? 'bg-sky-500/20 text-sky-400'
                                                : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        Extérieur
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-slate-400 block mb-1">Notre équipe</label>
                                    <TeamInput
                                        value={form.equipe}
                                        onChange={handleEquipeChange}
                                        placeholder="Notre équipe..."
                                        existingTeams={knownTeams}
                                        clubCityMap={clubCityMap}
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1">Adversaire</label>
                                    <TeamInput
                                        value={form.adversaire}
                                        onChange={handleAdversaireChange}
                                        placeholder="Nom du club..."
                                        existingTeams={knownTeams}
                                        clubCityMap={clubCityMap}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-1">Score final</label>
                                <div className="flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2">
                                    <div className="flex-1 text-center font-bold text-slate-200 truncate px-1">
                                        {form.equipe || 'Équipe'}
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={form.score_equipe}
                                        onChange={e => setForm({...form, score_equipe: e.target.value})}
                                        className="w-12 bg-slate-950 border border-slate-700 rounded-md py-1.5 text-center text-sm font-bold text-emerald-400"
                                    />
                                    <span className="text-slate-500 font-bold">-</span>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={form.score_adversaire}
                                        onChange={e => setForm({...form, score_adversaire: e.target.value})}
                                        className="w-12 bg-slate-950 border border-slate-700 rounded-md py-1.5 text-center text-sm font-bold text-white"
                                    />
                                    <div className="flex-1 text-center font-bold text-slate-200 truncate px-1">
                                        {form.adversaire || 'Adversaire'}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                                <div>
                                    <label className="text-slate-400 block mb-0.5">Buts marqués</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={form.buts_reels}
                                        onChange={e => setForm({...form, buts_reels: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-0.5">Passes décisives</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={form.passes_d_reelles}
                                        onChange={e => setForm({...form, passes_d_reelles: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chiffres Footbar (Ordre exact de l'écran Footbar) */}
                    <div className="space-y-2.5 pt-1">
                        <h3 className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px]">
                            Chiffres Footbar
                        </h3>

                        {/* Ligne 1 : Distance & Haute intensité */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-slate-400 block mb-0.5">Distance (km)</label>
                                <input type="number" step="0.1" placeholder="ex: 4.0" value={form.distance_km} onChange={e => setForm({...form, distance_km: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" required />
                            </div>
                            <div>
                                <label className="text-slate-400 block mb-0.5">Haute intensité (m)</label>
                                <input type="number" placeholder="ex: 76" value={form.haute_intensite_m} onChange={e => setForm({...form, haute_intensite_m: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
                            </div>
                        </div>

                        {/* Ligne 2 : Temps d'activité & Sprint max */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-slate-400 block mb-0.5">Temps d&apos;activité</label>
                                <div className="flex gap-1 items-center">
                                    <input type="number" placeholder="Min" value={form.temps_activite_min} onChange={e => setForm({...form, temps_activite_min: e.target.value})} className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" required />
                                    <span className="text-slate-500">:</span>
                                    <input type="number" placeholder="Sec" value={form.temps_activite_sec} onChange={e => setForm({...form, temps_activite_sec: e.target.value})} className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-slate-400 block mb-0.5">Sprint max (km/h)</label>
                                <input type="number" step="0.1" placeholder="ex: 16.7" value={form.sprint_max_kmh} onChange={e => setForm({...form, sprint_max_kmh: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" required />
                            </div>
                        </div>

                        {/* Ligne 3 : Accélérations & Décélérations */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-slate-400 block mb-0.5">Accélérations</label>
                                <input type="number" placeholder="ex: 26" value={form.accelerations} onChange={e => setForm({...form, accelerations: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" required />
                            </div>
                            <div>
                                <label className="text-slate-400 block mb-0.5">Décélérations</label>
                                <input type="number" placeholder="ex: 50" value={form.decelerations} onChange={e => setForm({...form, decelerations: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" required />
                            </div>
                        </div>

                        {/* Ligne 4 : Tirs & Tir max */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-slate-400 block mb-0.5">Tirs</label>
                                <input type="number" placeholder="ex: 2" value={form.tirs} onChange={e => setForm({...form, tirs: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
                            </div>
                            <div>
                                <label className="text-slate-400 block mb-0.5">Tir max (km/h)</label>
                                <input type="number" step="0.1" placeholder="ex: 48.1" value={form.tir_max_kmh} onChange={e => setForm({...form, tir_max_kmh: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
                            </div>
                        </div>

                        {/* Ligne 5 : Passes & Temps balle au pied */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-slate-400 block mb-0.5">Passes</label>
                                <input type="number" placeholder="ex: 84" value={form.passes} onChange={e => setForm({...form, passes: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" required />
                            </div>
                            <div>
                                <label className="text-slate-400 block mb-0.5">Temps balle au pied (sec)</label>
                                <input type="number" placeholder="ex: 34" value={form.temps_balle_sec} onChange={e => setForm({...form, temps_balle_sec: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" required />
                            </div>
                        </div>
                    </div>

                    {/* Sélecteur Charge ressentie (RPE - Échelle de Borg 1 à 10) */}
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                                <Flame className="w-3.5 h-3.5 text-amber-400" />
                                Charge ressentie (RPE)
                            </label>
                            {currentRpeTheme ? (
                                <div className="flex items-center gap-1.5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${currentRpeTheme.badge}`}>
                                        RPE {form.rpe}/10 • {currentRpeTheme.label}
                                    </span>
                                    {chargeFosterPreview !== null && (
                                        <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded-md">
                                            {chargeFosterPreview} pts
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <span className="text-[10px] text-slate-500">Échelle de 1 à 10</span>
                            )}
                        </div>

                        <div className="grid grid-cols-10 gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
                                const zone = getRpeTheme(val)
                                const isSelected = Number(form.rpe) === val
                                return (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() =>
                                            setForm(prev => ({
                                                ...prev,
                                                rpe: Number(prev.rpe) === val ? null : val
                                            }))
                                        }
                                        className={`py-2 rounded-lg font-mono font-bold text-xs border transition-all ${
                                            isSelected ? zone.activeBtn : zone.inactiveBtn
                                        }`}
                                    >
                                        {val}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="grid grid-cols-4 gap-1 text-[9px] text-center pt-0.5">
                            <span className="text-emerald-400/90 bg-emerald-500/10 rounded py-0.5">
                                1-3 Facile
                            </span>
                            <span className="text-sky-400/90 bg-sky-500/10 rounded py-0.5">
                                4-6 Modéré
                            </span>
                            <span className="text-amber-400/90 bg-amber-500/10 rounded py-0.5">
                                7-8 Dur
                            </span>
                            <span className="text-rose-400/90 bg-rose-500/10 rounded py-0.5">
                                9-10 Extrême
                            </span>
                        </div>
                    </div>

                    {/* Poste & Notes */}
                    <div>
                        <label className="text-slate-400 block mb-1">Poste joué / Notes sur la séance</label>
                        <input
                            type="text"
                            placeholder="ex: Milieu central • Belle frappe en fin de match..."
                            value={form.notes}
                            onChange={e => setForm({...form, notes: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                        />
                    </div>

                    {/* Actions */}
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
