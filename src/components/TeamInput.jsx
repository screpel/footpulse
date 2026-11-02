// src/components/TeamInput.jsx
import { useState, useRef, useEffect } from 'react'

export default function TeamInput({ value, onChange, placeholder, existingTeams = [] }) {
    const [open, setOpen] = useState(false)
    const containerRef = useRef(null)

    const allClubs = Array.from(new Set(existingTeams)).filter(Boolean)
    const query = (value || '').trim().toLowerCase()

    const filtered = query.length > 0
        ? allClubs.filter(
            c => c.toLowerCase().includes(query) && c.toLowerCase() !== query
        )
        : allClubs

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
                <ul className="absolute z-50 left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 text-xs divide-y divide-slate-800/50">
                    {filtered.map((club, idx) => (
                        <li
                            key={idx}
                            onClick={() => {
                                onChange(club)
                                setOpen(false)
                            }}
                            className="px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-emerald-400 cursor-pointer transition-colors"
                        >
                            {club}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
