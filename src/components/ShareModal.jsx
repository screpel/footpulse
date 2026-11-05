// src/components/ShareModal.jsx
import { useEffect, useRef } from 'react'
import { X, Download, Share2 } from 'lucide-react'
import { formatDuration, summarizeTournamentMatches } from '../domain/sessionMetrics'

export default function ShareModal({ isOpen, onClose, session }) {
    const canvasRef = useRef(null)
    const canNativeShare = typeof navigator !== 'undefined' && Boolean(navigator.share && navigator.canShare)

    useEffect(() => {
        if (!isOpen || !session || !canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const W = 800
        const H = 920
        canvas.width = W
        canvas.height = H

        // Fonction utilitaire pour les rectangles arrondis
        const roundRect = (x, y, w, h, r, fill, stroke) => {
            ctx.beginPath()
            ctx.roundRect(x, y, w, h, r)
            if (fill) {
                ctx.fillStyle = fill
                ctx.fill()
            }
            if (stroke) {
                ctx.strokeStyle = stroke
                ctx.lineWidth = 2
                ctx.stroke()
            }
        }

        // 1. Fond général avec dégradé sombre
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
        bgGrad.addColorStop(0, '#0f172a')
        bgGrad.addColorStop(1, '#020617')
        ctx.fillStyle = bgGrad
        ctx.fillRect(0, 0, W, H)

        // Bordure extérieure subtile
        roundRect(24, 24, W - 48, H - 48, 32, '#0f172a', '#1e293b')

        // 2. En-tête : Logo FOOT PULSE
        ctx.font = '900 42px system-ui, -apple-system, sans-serif'
        ctx.fillStyle = '#ffffff'
        ctx.fillText('FOOT', 64, 96)
        const footWidth = ctx.measureText('FOOT ').width
        ctx.fillStyle = '#34d399'
        ctx.fillText('PULSE', 64 + footWidth, 96)

        // Badge Type de séance
        const isMatch = session.type_seance === 'MATCH'
        const isTournoi = session.type_seance === 'TOURNOI'
        const isCompetition = isMatch || isTournoi
        const badgeLabel = isTournoi
            ? 'TOURNOI'
            : isMatch
            ? 'MATCH OFFICIEL'
            : 'ENTRAÎNEMENT'
        ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
        const badgeW = ctx.measureText(badgeLabel).width + 36
        const badgeFill = isTournoi
            ? 'rgba(245, 158, 11, 0.15)'
            : isMatch
            ? 'rgba(16, 185, 129, 0.15)'
            : '#1e293b'
        const badgeStroke = isTournoi ? '#f59e0b' : isMatch ? '#10b981' : '#334155'
        const badgeText = isTournoi ? '#fbbf24' : isMatch ? '#34d399' : '#e2e8f0'
        roundRect(W - 64 - badgeW, 62, badgeW, 42, 12, badgeFill, badgeStroke)
        ctx.fillStyle = badgeText
        ctx.fillText(badgeLabel, W - 64 - badgeW + 18, 89)

        // Date, Lieu et Météo
        const dateStr = new Date(session.date_seance).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
        const meteoStr = session.temperature_c !== null && session.temperature_c !== undefined
            ? ` • ${session.temperature_c}°C ${session.meteo_temps || ''}`
            : ''
        ctx.font = '500 22px system-ui, -apple-system, sans-serif'
        ctx.fillStyle = '#94a3b8'
        ctx.fillText(`${dateStr} • ${session.lieu}${meteoStr}`, 64, 140)

        let currentY = 180
        const dureeStr = formatDuration(session.temps_activite_sec)

        // 3. Bloc Score (Match), Bilan Tournoi (Tournoi) ou Résumé activité (Entraînement)
        if (isMatch) {
            roundRect(64, currentY, W - 128, 130, 24, '#020617', '#1e293b')

            // Équipe locale
            ctx.font = 'bold 26px system-ui, -apple-system, sans-serif'
            ctx.fillStyle = '#f8fafc'
            ctx.textAlign = 'right'
            ctx.fillText((session.equipe || 'Notre équipe').slice(0, 18), W / 2 - 90, currentY + 75)

            // Score
            const scoreText = `${session.score_equipe ?? '-'}   :   ${session.score_adversaire ?? '-'}`
            roundRect(W / 2 - 70, currentY + 35, 140, 60, 16, '#0f172a', '#10b981')
            ctx.font = '900 34px monospace'
            ctx.fillStyle = '#34d399'
            ctx.textAlign = 'center'
            ctx.fillText(scoreText, W / 2, currentY + 77)

            // Adversaire
            ctx.font = 'bold 26px system-ui, -apple-system, sans-serif'
            ctx.fillStyle = '#f8fafc'
            ctx.textAlign = 'left'
            ctx.fillText((session.adversaire || 'Adversaire').slice(0, 18), W / 2 + 90, currentY + 75)

            ctx.textAlign = 'left'
            currentY += 160
        } else if (isTournoi) {
            const tStats = summarizeTournamentMatches(session.matchs_tournoi)
            roundRect(64, currentY, W - 128, 130, 24, '#020617', '#f59e0b')

            ctx.font = '900 28px system-ui, -apple-system, sans-serif'
            ctx.fillStyle = '#fbbf24'
            ctx.fillText((session.nom_tournoi || 'Tournoi').slice(0, 28), 92, currentY + 52)

            ctx.textAlign = 'right'
            ctx.font = 'bold 24px monospace'
            ctx.fillStyle = '#34d399'
            ctx.fillText(
                `${tStats.totalMatches}M • ${tStats.v}V ${tStats.n}N ${tStats.d}D (${tStats.bp}-${tStats.bc})`,
                W - 92,
                currentY + 52
            )

            ctx.textAlign = 'left'
            const matchesLine = (session.matchs_tournoi || [])
                .slice(0, 4)
                .map(m => `${(m.adversaire || 'Adv.').slice(0, 12)} (${m.score_equipe ?? 0}-${m.score_adversaire ?? 0})`)
                .join('  •  ')
            ctx.font = '500 18px system-ui, -apple-system, sans-serif'
            ctx.fillStyle = '#cbd5e1'
            ctx.fillText(matchesLine || `${dureeStr} d'activité`, 92, currentY + 95)

            currentY += 160
        } else {
            roundRect(64, currentY, W - 128, 90, 20, '#020617', '#1e293b')
            ctx.font = 'bold 26px system-ui, -apple-system, sans-serif'
            ctx.fillStyle = '#34d399'
            ctx.fillText(`Séance à ${session.lieu}`, 92, currentY + 55)

            ctx.textAlign = 'right'
            ctx.fillStyle = '#e2e8f0'
            ctx.fillText(`${dureeStr} d'activité`, W - 92, currentY + 55)
            ctx.textAlign = 'left'
            currentY += 120
        }

        // 4. Grille des 6 statistiques clés (2 colonnes x 3 lignes)
        const stats = [
            { label: 'DISTANCE PARCOURUE', value: `${session.distance_km} km`, color: '#34d399' },
            { label: 'SPRINT MAX', value: `${session.sprint_max_kmh} km/h`, color: '#fbbf24' },
            { label: 'PASSES RÉUSSIES', value: `${session.passes}`, color: '#38bdf8' },
            { label: 'HAUTE INTENSITÉ', value: `${session.haute_intensite_m || 0} m`, color: '#fb7185' },
            { label: 'ACCÉL. / DÉCÉL.', value: `${session.accelerations} / ${session.decelerations}`, color: '#e2e8f0' },
            {
                label: isCompetition ? 'BUTS / PASSES DÉC.' : 'FRAPPE MAX',
                value: isCompetition ? `${session.buts_reels || 0} / ${session.passes_d_reelles || 0}` : (session.tir_max_kmh > 0 ? `${session.tir_max_kmh} km/h` : `${dureeStr}`),
                color: '#f43f5e'
            }
        ]

        const cardW = (W - 128 - 24) / 2
        const cardH = 130

        stats.forEach((st, i) => {
            const col = i % 2
            const row = Math.floor(i / 2)
            const x = 64 + col * (cardW + 24)
            const y = currentY + row * (cardH + 20)

            roundRect(x, y, cardW, cardH, 20, '#020617', '#1e293b')

            ctx.font = 'bold 16px system-ui, -apple-system, sans-serif'
            ctx.fillStyle = '#64748b'
            ctx.fillText(st.label, x + 28, y + 44)

            ctx.font = '900 40px system-ui, -apple-system, sans-serif'
            ctx.fillStyle = st.color
            ctx.fillText(st.value, x + 28, y + 98)
        })

        currentY += 3 * (cardH + 20) + 10

        // 5. Notes / Poste si renseigné
        if (session.notes) {
            roundRect(64, currentY, W - 128, 64, 16, 'rgba(16, 185, 129, 0.08)', 'rgba(16, 185, 129, 0.25)')
            ctx.font = 'italic 20px system-ui, -apple-system, sans-serif'
            ctx.fillStyle = '#cbd5e1'
            ctx.fillText(`« ${session.notes.slice(0, 55)} »`, 88, currentY + 40)
        }

        // 6. Pied de page
        ctx.font = '600 16px system-ui, -apple-system, sans-serif'
        ctx.fillStyle = '#475569'
        ctx.textAlign = 'center'
        ctx.fillText('FOOTPULSE • SUIVI DES PERFORMANCES U13F', W / 2, H - 48)
        ctx.textAlign = 'left'
    }, [isOpen, session])

    if (!isOpen || !session) return null

    const handleDownload = () => {
        const canvas = canvasRef.current
        const url = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = `footpulse-${session.date_seance}.png`
        link.href = url
        link.click()
    }

    const handleNativeShare = async () => {
        const canvas = canvasRef.current
        canvas.toBlob(async (blob) => {
            if (!blob) return
            const file = new File([blob], `footpulse-${session.date_seance}.png`, { type: 'image/png' })
            try {
                await navigator.share({
                    title: 'FootPulse — Bilan de la séance',
                    files: [file]
                })
            } catch {
                // Fallback téléchargement si annulation ou non supporté
                handleDownload()
            }
        }, 'image/png')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-4 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <h2 className="text-sm font-bold text-white">Carte de partage</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Aperçu du Canvas */}
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    <canvas ref={canvasRef} className="w-full h-auto block" />
                </div>

                {/* Boutons d'export */}
                <div className="flex gap-2">
                    {canNativeShare && (
                        <button
                            onClick={handleNativeShare}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                        >
                            <Share2 className="w-4 h-4" />
                            Partager (WhatsApp / iOS)
                        </button>
                    )}
                    <button
                        onClick={handleDownload}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                        <Download className="w-4 h-4 text-emerald-400" />
                        Télécharger PNG
                    </button>
                </div>
            </div>
        </div>
    )
}
