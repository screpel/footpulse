// src/components/TeamInput.jsx
import { useState, useRef, useEffect } from 'react'
import { filterClubSuggestions } from '../domain/sessionMetrics'

export default function TeamInput({
    value,
    onChange,
    placeholder,
    existingTeams = [],
    clubCityMap = {}
}) {
    const [open, setOpen] = useState(false)
    const containerRef = useRef(null)

    const filtered = filterClubSuggestions(value, existingTeams, clubCityMap)

    // Fermer la liste au clic extérieur
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={containerRef}>
            <input
                type="text"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value)
                    setOpen(true)
                }}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:border-emerald-500 focus:outline-none transition-colors"
            />

            {open && filtered.length > 0 && (
                <ul className="absolute z-50 left-0 right-0 mt-1 max-h-44 overflow-y-auto bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 text-xs divide-y divide-slate-800/50">
                    {filtered.map((club, idx) => {
                        const city = clubCityMap[club]
                        return (
                            <li
                                key={idx}
                                onClick={() => {
                                    onChange(club, city)
                                    setOpen(false)
                                }}
                                className="px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-emerald-400 cursor-pointer transition-colors flex items-center justify-between gap-2"
                            >
                                <span className="truncate font-medium">{club}</span>
                                {city && (
                                    <span className="text-[10px] text-slate-500 shrink-0">
                                        {city}
                                    </span>
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
