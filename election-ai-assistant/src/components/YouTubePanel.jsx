/**
 * YouTubePanel.jsx
 * Displays a grid of YouTube video results for civic education searches.
 */

import React from 'react'
import { X, Youtube, ExternalLink, Loader } from 'lucide-react'

export default function YouTubePanel({ results, loading, query, onClose }) {
  if (!loading && !results?.length) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 100,
        right: 24,
        width: 340,
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
        zIndex: 50,
        animation: 'slideUp 0.2s ease',
      }}
    >
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
        }}
      >
        <Youtube size={15} color="#c4302b" />
        <span style={{ fontSize: 13, fontWeight: 500, flex: 1, color: 'var(--text-primary)' }}>
          {query ? `Videos: "${query}"` : 'Election Videos'}
        </span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', padding: 2, display: 'flex' }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Content */}
      <div style={{ maxHeight: 380, overflowY: 'auto', padding: 12 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
            <Loader size={20} color="var(--text-tertiary)" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map(video => (
              <a
                key={video.id}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  gap: 10,
                  padding: 10,
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {video.thumbnail && (
                  <img
                    src={video.thumbnail}
                    alt=""
                    style={{ width: 80, height: 52, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {video.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    {video.channel}
                  </div>
                </div>
                <ExternalLink size={12} color="var(--text-tertiary)" style={{ flexShrink: 0, marginTop: 2 }} />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
