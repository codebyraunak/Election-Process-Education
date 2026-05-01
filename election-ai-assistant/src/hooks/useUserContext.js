/**
 * useUserContext.js
 * Tracks user context (location, name, Google connection) to power
 * dynamic system prompts and personalized AI responses.
 */

import { useState, useCallback } from 'react'

const STORAGE_KEY = 'electionai_user_context'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveToStorage(ctx) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ctx)) } catch {}
}

export function useUserContext() {
  const [context, setContext] = useState(() => ({
    userName: '',
    userLocation: '',
    calendarConnected: false,
    ...loadFromStorage(),
  }))

  const updateContext = useCallback((updates) => {
    setContext(prev => {
      const next = { ...prev, ...updates }
      saveToStorage(next)
      return next
    })
  }, [])

  const setLocation = useCallback((loc) => updateContext({ userLocation: loc }), [updateContext])
  const setName = useCallback((name) => updateContext({ userName: name }), [updateContext])
  const setCalendarConnected = useCallback((v) => updateContext({ calendarConnected: v }), [updateContext])
  const clearContext = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setContext({ userName: '', userLocation: '', calendarConnected: false })
  }, [])

  return { context, setLocation, setName, setCalendarConnected, clearContext }
}
