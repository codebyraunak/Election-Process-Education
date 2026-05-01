/**
 * googleService.js
 * Integrates Google Calendar, Maps (Places), and YouTube Data API.
 * Uses the Google Identity Services (GIS) for OAuth 2.0.
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY
const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const SCOPES = 'https://www.googleapis.com/auth/calendar.events'

let tokenClient = null
let accessToken = null

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Initializes the Google Identity Services token client.
 * Must be called after the GIS script is loaded.
 */
export function initGoogleAuth(onTokenReceived) {
  if (!CLIENT_ID || CLIENT_ID === 'your_google_oauth_client_id_here') return

  tokenClient = window.google?.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (resp) => {
      if (resp.error) { console.error('Google OAuth error:', resp.error); return }
      accessToken = resp.access_token
      onTokenReceived?.(resp.access_token)
    },
  })
}

export function requestGoogleAuth() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) { reject(new Error('Google auth not initialized')); return }
    tokenClient.callback = (resp) => {
      if (resp.error) { reject(new Error(resp.error)); return }
      accessToken = resp.access_token
      resolve(resp.access_token)
    }
    tokenClient.requestAccessToken({ prompt: '' })
  })
}

export function isGoogleConnected() { return !!accessToken }

export function signOutGoogle() { accessToken = null }

// ─── Google Calendar ──────────────────────────────────────────────────────────

/**
 * Adds an election-related event to the user's Google Calendar.
 * @param {Object} event - { title, date (ISO string), description, durationHours }
 */
export async function addCalendarEvent({ title, date, description = '', durationHours = 1 }) {
  if (!accessToken) throw new Error('NOT_AUTHENTICATED')

  const startDate = new Date(date)
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000)

  const event = {
    summary: title,
    description,
    start: { dateTime: startDate.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    end: { dateTime: endDate.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 * 24 },  // 1 day before
        { method: 'popup', minutes: 60 },         // 1 hour before
      ],
    },
  }

  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  )

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err?.error?.message || 'Calendar API error')
  }

  return await res.json()
}

// ─── Preset election reminders ─────────────────────────────────────────────────

export const ELECTION_REMINDERS = [
  {
    id: 'voter-reg',
    title: '🗳️ Voter Registration Deadline',
    description: 'Last day to register to vote in the upcoming election.',
    offsetDays: 30,   // days before election day
  },
  {
    id: 'election-day',
    title: '🏛️ Election Day — Go Vote!',
    description: 'Polls are open today. Check your polling station and bring your ID.',
    offsetDays: 0,
  },
  {
    id: 'early-voting',
    title: '📬 Early Voting Opens',
    description: 'Early voting begins today. You can vote before election day.',
    offsetDays: -14,  // 2 weeks before
  },
]

// ─── Google Maps — Polling Station Finder ─────────────────────────────────────

/**
 * Searches for polling stations near a given location using Places API.
 * @param {string} query - e.g. "polling station" or "election office"
 * @param {{ lat: number, lng: number }} location
 */
export async function findNearbyPollingStations(location, query = 'polling station') {
  const key = MAPS_API_KEY || GOOGLE_API_KEY
  if (!key || key.startsWith('your_')) throw new Error('Maps API key not configured')

  const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
  url.searchParams.set('location', `${location.lat},${location.lng}`)
  url.searchParams.set('radius', '5000')
  url.searchParams.set('keyword', query)
  url.searchParams.set('key', key)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Maps API error')
  const data = await res.json()
  return data.results?.slice(0, 5) ?? []
}

/**
 * Returns a Google Maps URL to show polling stations near a query location.
 * Safe for direct <a href> use even without API key.
 */
export function getMapsSearchUrl(locationQuery) {
  const q = encodeURIComponent(`polling station near ${locationQuery}`)
  return `https://www.google.com/maps/search/${q}`
}

/**
 * Geocodes a text address to lat/lng using the Geocoding API.
 */
export async function geocodeAddress(address) {
  const key = MAPS_API_KEY || GOOGLE_API_KEY
  if (!key || key.startsWith('your_')) throw new Error('API key not configured')

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('address', address)
  url.searchParams.set('key', key)

  const res = await fetch(url.toString())
  const data = await res.json()
  const loc = data.results?.[0]?.geometry?.location
  if (!loc) throw new Error('Location not found')
  return loc
}

// ─── Google YouTube Data API ──────────────────────────────────────────────────

/**
 * Searches YouTube for civic/election education videos.
 * @param {string} query
 * @param {number} maxResults
 */
export async function searchYouTubeVideos(query, maxResults = 4) {
  const key = GOOGLE_API_KEY
  if (!key || key.startsWith('your_')) throw new Error('YouTube API key not configured')

  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('q', `${query} election voting civic`)
  url.searchParams.set('type', 'video')
  url.searchParams.set('videoEmbeddable', 'true')
  url.searchParams.set('maxResults', String(maxResults))
  url.searchParams.set('relevanceLanguage', 'en')
  url.searchParams.set('safeSearch', 'strict')
  url.searchParams.set('key', key)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('YouTube API error')
  const data = await res.json()

  return (data.items ?? []).map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.medium?.url,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  }))
}

// ─── Google loader ────────────────────────────────────────────────────────────

/**
 * Dynamically loads the Google Identity Services script.
 */
export function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="accounts.google.com"]')) { resolve(); return }
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}
