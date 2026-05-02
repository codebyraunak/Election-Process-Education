/**
 * ApiKeyBanner.jsx
 * Shows a dismissible banner when running without an API key (demo mode).
 * Includes accessibility attributes and keyboard support.
 */

import React, { useState } from 'react'
import { Key, X, ExternalLink } from 'lucide-react'

export default function ApiKeyBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        background: 'linear-gradient(135deg, #fff8e1, #fff3cd)',
        border: '1px solid #ffc107',
        borderRadius: 10,
        marginBottom: 12,
        flexShrink: 0,
      }}
    >
      <Key size={15} color="#f59e0b" aria-hidden="true" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>
        <strong>Demo mode</strong> — Running without an API key. Responses are pre-written.{' '}
        <a
          href="https://console.anthropic.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#d97706', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 3 }}
          aria-label="Get API key from Anthropic console (opens in new tab)"
        >
          Get a free API key <ExternalLink size={11} aria-hidden="true" />
        </a>
        {' '}and add it to your <code style={{ background: '#fef3c7', padding: '1px 5px', borderRadius: 4, fontSize: 12 }}>.env</code> file.
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss demo mode notice"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#92400e',
          display: 'flex',
          padding: 2,
          borderRadius: 4,
          flexShrink: 0,
        }}
        onKeyDown={e => e.key === 'Enter' && setDismissed(true)}
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  )
}
