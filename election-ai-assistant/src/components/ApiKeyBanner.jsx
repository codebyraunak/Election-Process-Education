import React, { useState } from 'react'
import { Key, X, ExternalLink } from 'lucide-react'

export default function ApiKeyBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div role="alert" aria-live="polite" style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 16px', background: 'linear-gradient(135deg, #fff8e1, #fff3cd)',
      border: '1px solid #ffc107', borderRadius: 10, marginBottom: 12, flexShrink: 0,
    }}>
      <Key size={15} color="#f59e0b" aria-hidden="true" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>
        <strong>Demo mode</strong> — Add your free Gemini API key to enable full AI responses.{' '}
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
          style={{ color: '#d97706', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          Get free key at Google AI Studio <ExternalLink size={11} aria-hidden="true" />
        </a>
        {' '}→ Add as <code style={{ background: '#fef3c7', padding: '1px 5px', borderRadius: 4, fontSize: 12 }}>VITE_GEMINI_API_KEY</code> in Vercel.
      </div>
      <button onClick={() => setDismissed(true)} aria-label="Dismiss notice"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', display: 'flex', padding: 2, borderRadius: 4, flexShrink: 0 }}>
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  )
}
