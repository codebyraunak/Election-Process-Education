/**
 * App.jsx
 * Root component. Wires together all hooks and components.
 * Handles Google action dispatch (calendar, maps, YouTube).
 */

import React, { useCallback } from 'react'
import { useChat } from './hooks/useChat.js'
import { useGoogleServices } from './hooks/useGoogleServices.js'
import { useUserContext } from './hooks/useUserContext.js'
import Sidebar from './components/Sidebar.jsx'
import ChatWindow from './components/ChatWindow.jsx'
import YouTubePanel from './components/YouTubePanel.jsx'

export default function App() {
  // ─── User context (location, name, calendar state) ──────────────────────────
  const {
    context,
    setLocation,
    setName,
    setCalendarConnected,
  } = useUserContext()

  // ─── Google services ─────────────────────────────────────────────────────────
  const {
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
  } = useGoogleServices()

  // ─── Chat ─────────────────────────────────────────────────────────────────────
  const {
    messages,
    isLoading,
    error,
    sendUserMessage,
    clearChat,
    stopStreaming,
  } = useChat({
    userContext: {
      ...context,
      calendarConnected: googleConnected,
    },
  })

  // ─── Handle Google actions from AI suggestions ────────────────────────────────
  const handleAction = useCallback(async (action) => {
    switch (action.type) {
      case 'CALENDAR': {
        if (!googleConnected) {
          const ok = await connectGoogle()
          if (!ok) return
          setCalendarConnected(true)
        }
        // Default: add a generic election day reminder
        const electionDay = new Date()
        electionDay.setMonth(electionDay.getMonth() + 1) // placeholder
        await addToCalendar({
          title: action.label.replace(/^Add\s+/i, '') || 'Election Reminder',
          date: electionDay.toISOString(),
          description: 'Added by ElectionAI',
        })
        break
      }

      case 'MAPS': {
        const loc = context.userLocation || 'my location'
        openMapsForPolling(loc)
        break
      }

      case 'YOUTUBE': {
        // Extract search query from action label (e.g. "Search: civic education explained")
        const query = action.label.replace(/^Search:\s*/i, '') || 'election voting explained'
        await searchVideos(query)
        break
      }

      default:
        break
    }
  }, [
    googleConnected,
    connectGoogle,
    setCalendarConnected,
    addToCalendar,
    openMapsForPolling,
    searchVideos,
    context.userLocation,
  ])

  // ─── Calendar reminder from sidebar ─────────────────────────────────────────
  const handleAddReminder = useCallback(async (reminder) => {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + reminder.offsetDays + 30)
    await addToCalendar({
      title: reminder.title,
      date: targetDate.toISOString(),
      description: reminder.description,
    })
  }, [addToCalendar])

  // ─── Connect Google from sidebar ─────────────────────────────────────────────
  const handleConnectGoogle = useCallback(async () => {
    const ok = await connectGoogle()
    if (ok) setCalendarConnected(true)
  }, [connectGoogle, setCalendarConnected])

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        padding: 16,
        gap: 14,
        maxWidth: 1100,
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      {/* Sidebar */}
      <Sidebar
        googleConnected={googleConnected}
        googleReady={googleReady}
        onConnectGoogle={handleConnectGoogle}
        onDisconnectGoogle={disconnectGoogle}
        onSendMessage={sendUserMessage}
        onAddReminder={handleAddReminder}
        calendarLoading={calendarLoading}
        context={context}
        onSetLocation={setLocation}
        onSetName={setName}
      />

      {/* Main chat area */}
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        error={error}
        onSend={sendUserMessage}
        onStop={stopStreaming}
        onClear={clearChat}
        onAction={handleAction}
        calendarLoading={calendarLoading}
        calendarResult={calendarResult}
      />

      {/* YouTube results panel (floating) */}
      {(youtubeResults.length > 0 || youtubeLoading) && (
        <YouTubePanel
          results={youtubeResults}
          loading={youtubeLoading}
          onClose={clearYouTubeResults}
        />
      )}

      {/* Calendar success toast */}
      {calendarResult?.success && (
        <Toast
          message={`Added "${calendarResult.eventTitle}" to your Google Calendar`}
          onDone={clearCalendarResult}
        />
      )}
    </div>
  )
}

// ─── Toast notification ───────────────────────────────────────────────────────

function Toast({ message, onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#1D9E75',
        color: 'white',
        padding: '10px 20px',
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 500,
        boxShadow: '0 4px 16px rgba(29,158,117,0.35)',
        zIndex: 100,
        animation: 'fadeUp 0.25s ease',
        whiteSpace: 'nowrap',
      }}
    >
      ✓ {message}
    </div>
  )
}
