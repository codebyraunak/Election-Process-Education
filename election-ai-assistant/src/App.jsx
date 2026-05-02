/**
 * App.jsx
 * Root component. Wires together all hooks and components.
 * Handles Google action dispatch (calendar, maps, YouTube).
 * Includes accessibility improvements and demo mode support.
 */

import React, { useCallback } from 'react'
import { useChat } from './hooks/useChat.js'
import { useGoogleServices } from './hooks/useGoogleServices.js'
import { useUserContext } from './hooks/useUserContext.js'
import { isApiKeyConfigured } from './services/anthropicService.js'
import Sidebar from './components/Sidebar.jsx'
import ChatWindow from './components/ChatWindow.jsx'
import YouTubePanel from './components/YouTubePanel.jsx'
import ApiKeyBanner from './components/ApiKeyBanner.jsx'

export default function App() {
  const { context, setLocation, setName, setCalendarConnected } = useUserContext()

  const {
    googleConnected, googleReady, connectGoogle, disconnectGoogle,
    calendarLoading, calendarResult, clearCalendarResult, addToCalendar,
    youtubeResults, youtubeLoading, searchVideos, clearYouTubeResults,
    openMapsForPolling,
  } = useGoogleServices()

  const { messages, isLoading, error, sendUserMessage, clearChat, stopStreaming } = useChat({
    userContext: { ...context, calendarConnected: googleConnected },
  })

  const handleAction = useCallback(async (action) => {
    switch (action.type) {
      case 'CALENDAR': {
        if (!googleConnected) {
          const ok = await connectGoogle()
          if (!ok) return
          setCalendarConnected(true)
        }
        const electionDay = new Date()
        electionDay.setMonth(electionDay.getMonth() + 1)
        await addToCalendar({
          title: action.label.replace(/^Add\s+/i, '') || 'Election Reminder',
          date: electionDay.toISOString(),
          description: 'Added by ElectionAI',
        })
        break
      }
      case 'MAPS': {
        openMapsForPolling(context.userLocation || 'my location')
        break
      }
      case 'YOUTUBE': {
        const query = action.label.replace(/^Search:\s*/i, '') || 'election voting explained'
        await searchVideos(query)
        break
      }
      default: break
    }
  }, [googleConnected, connectGoogle, setCalendarConnected, addToCalendar, openMapsForPolling, searchVideos, context.userLocation])

  const handleAddReminder = useCallback(async (reminder) => {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + reminder.offsetDays + 30)
    await addToCalendar({ title: reminder.title, date: targetDate.toISOString(), description: reminder.description })
  }, [addToCalendar])

  const handleConnectGoogle = useCallback(async () => {
    const ok = await connectGoogle()
    if (ok) setCalendarConnected(true)
  }, [connectGoogle, setCalendarConnected])

  const apiConfigured = isApiKeyConfigured()

  return (
    <>
      {/* Skip to main content — accessibility */}
      <a
        href="#main-chat"
        style={{
          position: 'absolute', top: -40, left: 0, zIndex: 999,
          background: '#1D9E75', color: 'white', padding: '8px 16px',
          borderRadius: 4, fontSize: 13, fontWeight: 500,
          transition: 'top 0.1s',
        }}
        onFocus={e => e.target.style.top = '8px'}
        onBlur={e => e.target.style.top = '-40px'}
      >
        Skip to main content
      </a>

      <div
        style={{
          display: 'flex',
          height: '100vh',
          padding: 16,
          gap: 14,
          maxWidth: 1100,
          margin: '0 auto',
          boxSizing: 'border-box',
          flexDirection: 'column',
        }}
      >
        {/* Demo mode banner */}
        {!apiConfigured && <ApiKeyBanner />}

        <div style={{ display: 'flex', flex: 1, gap: 14, minHeight: 0 }}>
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

          <main id="main-chat" style={{ flex: 1, display: 'flex', minHeight: 0 }} aria-label="Election AI Chat">
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
              isDemoMode={!apiConfigured}
            />
          </main>
        </div>
      </div>

      {(youtubeResults.length > 0 || youtubeLoading) && (
        <YouTubePanel results={youtubeResults} loading={youtubeLoading} onClose={clearYouTubeResults} />
      )}

      {calendarResult?.success && (
        <Toast message={`Added "${calendarResult.eventTitle}" to Google Calendar`} onDone={clearCalendarResult} />
      )}
    </>
  )
}

function Toast({ message, onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        background: '#1D9E75', color: 'white', padding: '10px 20px',
        borderRadius: 12, fontSize: 13, fontWeight: 500,
        boxShadow: '0 4px 16px rgba(29,158,117,0.35)', zIndex: 100,
        whiteSpace: 'nowrap',
      }}
    >
      ✓ {message}
    </div>
  )
}
