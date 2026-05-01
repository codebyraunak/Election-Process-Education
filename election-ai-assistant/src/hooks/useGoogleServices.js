/**
 * useGoogleServices.js
 * Manages Google auth state, Calendar events, Maps lookups, and YouTube search.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  loadGoogleScript,
  initGoogleAuth,
  requestGoogleAuth,
  isGoogleConnected,
  signOutGoogle,
  addCalendarEvent,
  searchYouTubeVideos,
  getMapsSearchUrl,
} from '../services/googleService'

export function useGoogleServices() {
  const [googleConnected, setGoogleConnected] = useState(false)
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [calendarResult, setCalendarResult] = useState(null)  // { success, eventTitle }
  const [youtubeResults, setYoutubeResults] = useState([])
  const [youtubeLoading, setYoutubeLoading] = useState(false)
  const [googleReady, setGoogleReady] = useState(false)

  // Load Google Identity Services on mount
  useEffect(() => {
    loadGoogleScript()
      .then(() => {
        initGoogleAuth((token) => {
          if (token) setGoogleConnected(true)
        })
        setGoogleReady(true)
      })
      .catch(() => console.warn('Google script failed to load'))
  }, [])

  const connectGoogle = useCallback(async () => {
    try {
      await requestGoogleAuth()
      setGoogleConnected(true)
      return true
    } catch (err) {
      console.error('Google connect failed:', err)
      return false
    }
  }, [])

  const disconnectGoogle = useCallback(() => {
    signOutGoogle()
    setGoogleConnected(false)
  }, [])

  /**
   * Add an event to Google Calendar (auto-connects if needed)
   */
  const addToCalendar = useCallback(async (eventData) => {
    setCalendarLoading(true)
    setCalendarResult(null)
    try {
      if (!isGoogleConnected()) await requestGoogleAuth()
      await addCalendarEvent(eventData)
      setCalendarResult({ success: true, eventTitle: eventData.title })
      setGoogleConnected(true)
    } catch (err) {
      setCalendarResult({ success: false, error: err.message })
    } finally {
      setCalendarLoading(false)
    }
  }, [])

  const clearCalendarResult = useCallback(() => setCalendarResult(null), [])

  /**
   * Search YouTube for civic education videos
   */
  const searchVideos = useCallback(async (query) => {
    setYoutubeLoading(true)
    setYoutubeResults([])
    try {
      const results = await searchYouTubeVideos(query)
      setYoutubeResults(results)
    } catch (err) {
      console.warn('YouTube search failed:', err.message)
      setYoutubeResults([])
    } finally {
      setYoutubeLoading(false)
    }
  }, [])

  const clearYouTubeResults = useCallback(() => setYoutubeResults([]), [])

  /**
   * Open Google Maps in a new tab for polling stations
   */
  const openMapsForPolling = useCallback((locationQuery) => {
    const url = getMapsSearchUrl(locationQuery)
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  return {
    googleConnected,
    googleReady,
    connectGoogle,
    disconnectGoogle,
    calendarLoading,
    calendarResult,
    clearCalendarResult,
    addToCalendar,
    youtubeResults,
    youtubeLoading,
    searchVideos,
    clearYouTubeResults,
    openMapsForPolling,
  }
}
