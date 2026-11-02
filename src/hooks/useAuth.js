// src/hooks/useAuth.js
import { useState, useEffect } from 'react'
import { authService } from '../services/authService'

export function useAuth({ onAuthenticated, onUnauthenticated } = {}) {
  const [authSession, setAuthSession] = useState(null)
  const [authChecking, setAuthChecking] = useState(true)

  useEffect(() => {
    let isMounted = true

    authService
      .getSession()
      .then((session) => {
        if (!isMounted) return
        setAuthSession(session)
        setAuthChecking(false)
        if (session && onAuthenticated) {
          onAuthenticated(session)
        }
      })
      .catch(() => {
        if (isMounted) setAuthChecking(false)
      })

    const unsubscribe = authService.onAuthStateChange((session) => {
      if (!isMounted) return
      setAuthSession(session)
      if (session) {
        if (onAuthenticated) onAuthenticated(session)
      } else {
        if (onUnauthenticated) onUnauthenticated()
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [onAuthenticated, onUnauthenticated])

  const signOut = async () => {
    await authService.signOut()
  }

  return {
    authSession,
    authChecking,
    signOut
  }
}
