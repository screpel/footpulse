// src/components/rpeTheme.js
import { getRpeLevel } from '../domain/sessionMetrics'

const RPE_THEME_BY_LEVEL = {
  EASY: {
    activeBtn: 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm',
    inactiveBtn: 'bg-slate-950 text-emerald-400/80 border-slate-800 hover:border-emerald-500/40',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  },
  MODERATE: {
    activeBtn: 'bg-sky-400 text-slate-950 border-sky-300 shadow-sm',
    inactiveBtn: 'bg-slate-950 text-sky-400/80 border-slate-800 hover:border-sky-500/40',
    badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30'
  },
  HARD: {
    activeBtn: 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm',
    inactiveBtn: 'bg-slate-950 text-amber-400/80 border-slate-800 hover:border-amber-500/40',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  },
  EXTREME: {
    activeBtn: 'bg-rose-500 text-white border-rose-400 shadow-sm',
    inactiveBtn: 'bg-slate-950 text-rose-400/80 border-slate-800 hover:border-rose-500/40',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
  }
}

const WEEKLY_LOAD_THEME_BY_LEVEL = {
  REST: 'bg-slate-800 text-slate-400 border-slate-700/60',
  LIGHT: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  OPTIMAL: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  HIGH: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  INTENSIVE: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
}

export function getRpeTheme(rpe) {
  const domainInfo = getRpeLevel(rpe)
  if (!domainInfo) return null
  const styles = RPE_THEME_BY_LEVEL[domainInfo.level]
  return {
    ...domainInfo,
    ...styles
  }
}

export function getWeeklyLoadBadgeStyle(loadLevel) {
  return WEEKLY_LOAD_THEME_BY_LEVEL[loadLevel] || WEEKLY_LOAD_THEME_BY_LEVEL.REST
}

export function getScoreBadgeStyle(scoreEq, scoreAdv) {
  if (scoreEq > scoreAdv) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  if (scoreEq < scoreAdv) return 'bg-rose-500/20 text-rose-300 border-rose-500/40'
  return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
}
