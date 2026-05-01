/**
 * ActionBar.jsx
 * Renders contextual Google action buttons when the AI detects an opportunity
 * (e.g., add calendar reminder, open Maps, search YouTube).
 */

import React, { useState } from 'react'
import { Calendar, MapPin, Youtube, Check, Loader } from 'lucide-react'

const ACTION_CONFIG = {
  CALENDAR: {
    icon: Calendar,
    color: '#1D9E75',
    bg: '#e8f7f2',
    label: 'Add to Calendar',
  },
  MAPS: {
    icon: MapPin,
    color: '#378ADD',
    bg: '#e8f2fb',
    label: 'Open in Maps',
  },
  YOUTUBE: {
    icon: Youtube,
    color: '#c4302b',
    bg: '#fdecea',
    label: 'Search YouTube',
  },
}

export default function ActionBar({ actions, onAction, calendarLoading, calendarResult }) {
  if (!actions?.length) return null

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
      {actions.map((action, i) => (
        <ActionButton
          key={i}
          action={action}
          onAction={onAction}
          calendarLoading={calendarLoading && action.type === 'CALENDAR'}
          calendarSuccess={calendarResult?.success && action.type === 'CALENDAR'}
        />
      ))}
    </div>
  )
}

function ActionButton({ action, onAction, calendarLoading, calendarSuccess }) {
  const config = ACTION_CONFIG[action.type] ?? ACTION_CONFIG.CALENDAR
  const Icon = config.icon

  return (
    <button
      onClick={() => onAction(action)}
      disabled={calendarLoading || calendarSuccess}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 8,
        border: `1px solid ${config.color}33`,
        background: config.bg,
        color: config.color,
        fontSize: 12,
        fontWeight: 500,
        cursor: calendarLoading || calendarSuccess ? 'default' : 'pointer',
        transition: 'opacity 0.15s',
        opacity: calendarLoading ? 0.7 : 1,
      }}
    >
      {calendarLoading ? (
        <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />
      ) : calendarSuccess ? (
        <Check size={13} />
      ) : (
        <Icon size={13} />
      )}
      {calendarSuccess ? 'Added!' : action.label}
    </button>
  )
}
