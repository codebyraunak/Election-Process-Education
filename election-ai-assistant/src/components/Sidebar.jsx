/**
 * Sidebar.jsx
 * Left-side panel showing Google connection status, user context settings,
 * quick topic buttons, and election date reminders.
 */

import React, { useState } from 'react'
import {
  Calendar, MapPin, User, Globe, Zap,
  CheckCircle, Circle, LogOut, ChevronDown, ChevronUp,
} from 'lucide-react'
import { ELECTION_REMINDERS } from '../services/googleService'

const QUICK_TOPICS = [
  { label: 'How do I register?', emoji: '📋' },
  { label: 'What happens on election day?', emoji: '🗳️' },
  { label: 'How are votes counted?', emoji: '📊' },
  { label: 'Types of voting systems', emoji: '⚖️' },
  { label: 'What is gerrymandering?', emoji: '🗺️' },
  { label: 'How do I vote by mail?', emoji: '📬' },
  { label: 'Find my polling station', emoji: '📍' },
  { label: 'Election timeline and deadlines', emoji: '📅' },
]

export default function Sidebar({
  googleConnected,
  googleReady,
  onConnectGoogle,
  onDisconnectGoogle,
  onSendMessage,
  onAddReminder,
  calendarLoading,
  context,
  onSetLocation,
  onSetName,
}) {
  const [locationInput, setLocationInput] = useState(context.userLocation || '')
  const [nameInput, setNameInput] = useState(context.userName || '')
  const [remindersOpen, setRemindersOpen] = useState(false)
  const [contextOpen, setContextOpen] = useState(true)

  function handleLocationSubmit(e) {
    e.preventDefault()
    if (locationInput.trim()) onSetLocation(locationInput.trim())
  }

  function handleNameSubmit(e) {
    e.preventDefault()
    if (nameInput.trim()) onSetName(nameInput.trim())
  }

  return (
    <aside
      style={{
        width: 260,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        overflowY: 'auto',
        paddingRight: 4,
      }}
    >
      {/* Google Connection */}
      <Section
        title="Google Services"
        icon={<Globe size={14} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <StatusRow
            label="Google Calendar"
            icon={<Calendar size={13} />}
            connected={googleConnected}
          />
          <StatusRow
            label="Google Maps"
            icon={<MapPin size={13} />}
            connected={!!import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          />
        </div>

        {!googleConnected ? (
          <button
            onClick={onConnectGoogle}
            disabled={!googleReady}
            style={btnStyle('#1D9E75')}
          >
            <Calendar size={13} /> Connect Google Calendar
          </button>
        ) : (
          <button onClick={onDisconnectGoogle} style={btnStyle('#888', true)}>
            <LogOut size={13} /> Disconnect
          </button>
        )}

        {googleConnected && (
          <div>
            <button
              onClick={() => setRemindersOpen(o => !o)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: 12,
                fontWeight: 500,
                padding: '6px 0 2px',
                cursor: 'pointer',
              }}
            >
              Add election reminders
              {remindersOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {remindersOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 6 }}>
                {ELECTION_REMINDERS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => onAddReminder(r)}
                    disabled={calendarLoading}
                    style={{
                      fontSize: 11,
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '6px 10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      lineHeight: 1.4,
                    }}
                  >
                    {r.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Section>

      {/* User Context */}
      <Section
        title="Your context"
        icon={<User size={14} />}
        collapsible
        open={contextOpen}
        onToggle={() => setContextOpen(o => !o)}
      >
        {contextOpen && (
          <>
            <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={labelStyle}>Your name (optional)</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="e.g. Alex"
                  style={inputStyle}
                />
                <button type="submit" style={miniBtn}>Save</button>
              </div>
            </form>

            <form onSubmit={handleLocationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
              <label style={labelStyle}>Your location</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  value={locationInput}
                  onChange={e => setLocationInput(e.target.value)}
                  placeholder="City or country"
                  style={inputStyle}
                />
                <button type="submit" style={miniBtn}>Set</button>
              </div>
              {context.userLocation && (
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  📍 {context.userLocation}
                </span>
              )}
            </form>
          </>
        )}
      </Section>

      {/* Quick Topics */}
      <Section title="Quick topics" icon={<Zap size={14} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {QUICK_TOPICS.map(t => (
            <button
              key={t.label}
              onClick={() => onSendMessage(t.label)}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '7px 10px',
                fontSize: 12,
                color: 'var(--text-secondary)',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'border-color 0.12s, color 0.12s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--brand-green)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>
      </Section>
    </aside>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, icon, children, collapsible, open, onToggle }) {
  return (
    <div
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: collapsible ? 'pointer' : 'default',
        }}
        onClick={collapsible ? onToggle : undefined}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--text-tertiary)' }}>{icon}</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </span>
        </div>
        {collapsible && (open ? <ChevronUp size={12} color="var(--text-tertiary)" /> : <ChevronDown size={12} color="var(--text-tertiary)" />)}
      </div>
      {children}
    </div>
  )
}

function StatusRow({ label, icon, connected }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
        <span style={{ color: 'var(--text-tertiary)' }}>{icon}</span> {label}
      </div>
      {connected
        ? <CheckCircle size={13} color="#1D9E75" />
        : <Circle size={13} color="var(--text-tertiary)" />
      }
    </div>
  )
}

// ─── Shared styles ─────────────────────────────────────────────────────────────

const labelStyle = { fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }

const inputStyle = {
  flex: 1,
  fontSize: 12,
  padding: '6px 9px',
  border: '1px solid var(--border)',
  borderRadius: 8,
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
}

const miniBtn = {
  fontSize: 11,
  fontWeight: 500,
  padding: '6px 10px',
  background: 'var(--bg-tertiary)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  flexShrink: 0,
}

function btnStyle(color, ghost = false) {
  return {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '8px 12px',
    border: `1px solid ${color}44`,
    borderRadius: 8,
    background: ghost ? 'transparent' : `${color}14`,
    color: color,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    transition: 'background 0.15s',
  }
}
