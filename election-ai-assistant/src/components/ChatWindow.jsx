/**
 * ChatWindow.jsx
 * Main chat interface with full accessibility support.
 * ARIA roles, keyboard navigation, focus management, live regions.
 */

import React, { useRef, useEffect, useState } from 'react'
import { Send, Square, Trash2, Bot, Info } from 'lucide-react'
import MarkdownMessage from './MarkdownMessage.jsx'
import ActionBar from './ActionBar.jsx'

export default function ChatWindow({
  messages, isLoading, error, onSend, onStop, onClear,
  onAction, calendarLoading, calendarResult, isDemoMode,
}) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const liveRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  function submit() {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    onSend(text)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div
      role="region"
      aria-label="Election AI Chat"
      style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: 'var(--bg-primary)', border: '1px solid var(--border)',
        borderRadius: 16, overflow: 'hidden', minHeight: 0,
      }}
    >
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes blink{0%,80%,100%{opacity:0.15}40%{opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .send-btn:focus-visible,.clear-btn:focus-visible,.chip-btn:focus-visible{outline:2px solid #1D9E75;outline-offset:2px}
        .msg-bubble a:focus-visible{outline:2px solid #378ADD;outline-offset:1px;border-radius:2px}
      `}</style>

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 18px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)', flexShrink: 0,
      }}>
        <div aria-hidden="true" style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg, #1D9E75, #378ADD)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bot size={16} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
            ElectionAI {isDemoMode && <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 400 }}>(Demo mode)</span>}
          </div>
          <div style={{ fontSize: 11, color: '#1D9E75', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', animation: 'pulse 2s infinite', display: 'inline-block' }} />
            <span>Online · Non-partisan election guide</span>
          </div>
        </div>
        <button
          className="clear-btn"
          onClick={onClear}
          aria-label="Clear chat history"
          style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: 8,
            padding: '5px 8px', display: 'flex', alignItems: 'center',
            color: 'var(--text-tertiary)', cursor: 'pointer', gap: 4, fontSize: 12,
          }}
        >
          <Trash2 size={13} aria-hidden="true" /> Clear
        </button>
      </header>

      {/* Live region for screen readers */}
      <div ref={liveRef} aria-live="polite" aria-atomic="false" className="sr-only"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }} />

      {/* Messages */}
      <div
        role="log"
        aria-label="Conversation"
        aria-live="polite"
        style={{
          flex: 1, overflowY: 'auto', padding: '18px 18px 8px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        {messages.map(msg => (
          <Message
            key={msg.id} msg={msg} onAction={onAction}
            calendarLoading={calendarLoading} calendarResult={calendarResult}
          />
        ))}

        {isLoading && !messages.some(m => m.streaming) && (
          <div role="status" aria-label="ElectionAI is typing" style={{ display: 'flex', gap: 10 }}>
            <Avatar />
            <div style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: '4px 14px 14px 14px', padding: '10px 14px',
              display: 'flex', gap: 5, alignItems: 'center',
            }}>
              {[0,1,2].map(i => (
                <span key={i} aria-hidden="true" style={{
                  width: 7, height: 7, borderRadius: '50%', background: 'var(--text-tertiary)',
                  animation: `blink 1.2s ${i * 0.2}s infinite`, display: 'inline-block',
                }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div role="alert" style={{
            fontSize: 13, color: '#c4302b', background: '#fdecea',
            border: '1px solid #f5c6c6', borderRadius: 10, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Info size={14} aria-hidden="true" /> {error}
          </div>
        )}
        <div ref={bottomRef} tabIndex={-1} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid var(--border)',
        background: 'var(--bg-secondary)', display: 'flex',
        alignItems: 'flex-end', gap: 10, flexShrink: 0,
      }}>
        <label htmlFor="chat-input" className="sr-only"
          style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
          Ask ElectionAI a question
        </label>
        <textarea
          id="chat-input"
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about elections…"
          rows={1}
          aria-label="Type your question about elections"
          aria-describedby="chat-hint"
          style={{
            flex: 1, resize: 'none', border: '1px solid var(--border)',
            borderRadius: 12, padding: '9px 13px', fontSize: 14,
            fontFamily: 'var(--font-sans)', background: 'var(--bg-primary)',
            color: 'var(--text-primary)', outline: 'none', lineHeight: 1.5,
            transition: 'border-color 0.15s', maxHeight: 120,
          }}
          onFocus={e => e.target.style.borderColor = '#1D9E75'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <span id="chat-hint" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
          Press Enter to send, Shift+Enter for new line
        </span>

        {isLoading ? (
          <button
            className="send-btn"
            onClick={onStop}
            aria-label="Stop generating response"
            style={{
              width: 40, height: 40, borderRadius: '50%', background: '#ff4444',
              border: 'none', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
            }}
          >
            <Square size={14} color="white" fill="white" aria-hidden="true" />
          </button>
        ) : (
          <button
            className="send-btn"
            onClick={submit}
            disabled={!input.trim()}
            aria-label="Send message"
            aria-disabled={!input.trim()}
            style={{
              width: 40, height: 40, borderRadius: '50%', border: 'none',
              background: input.trim() ? 'linear-gradient(135deg, #1D9E75, #378ADD)' : 'var(--bg-tertiary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() ? 'pointer' : 'default', flexShrink: 0,
              transition: 'background 0.2s',
            }}
          >
            <Send size={15} color={input.trim() ? 'white' : 'var(--text-tertiary)'} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}

function Message({ msg, onAction, calendarLoading, calendarResult }) {
  const isAI = msg.role === 'assistant'
  return (
    <article
      aria-label={isAI ? 'ElectionAI response' : 'Your message'}
      style={{
        display: 'flex', gap: 10,
        flexDirection: isAI ? 'row' : 'row-reverse',
        animation: 'fadeUp 0.2s ease',
      }}
    >
      {isAI ? <Avatar /> : <UserAvatar />}
      <div style={{ maxWidth: '78%' }}>
        <div
          className="msg-bubble"
          style={{
            padding: '10px 14px', fontSize: 14, lineHeight: 1.65,
            color: isAI ? 'var(--text-primary)' : 'white',
            background: isAI ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #1D9E75, #378ADD)',
            border: isAI ? '1px solid var(--border)' : 'none',
            borderRadius: isAI ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
          }}
        >
          {isAI ? <MarkdownMessage content={msg.content} /> : msg.content}
          {msg.streaming && (
            <span aria-hidden="true" style={{
              display: 'inline-block', width: 8, height: 14, background: '#1D9E75',
              marginLeft: 2, borderRadius: 2, animation: 'pulse 0.8s infinite', verticalAlign: 'text-bottom',
            }} />
          )}
        </div>
        {isAI && msg.actions?.length > 0 && (
          <ActionBar actions={msg.actions} onAction={onAction}
            calendarLoading={calendarLoading} calendarResult={calendarResult} />
        )}
        <time
          dateTime={msg.timestamp?.toISOString()}
          style={{
            fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4,
            display: 'block', textAlign: isAI ? 'left' : 'right',
            paddingLeft: isAI ? 2 : 0, paddingRight: isAI ? 0 : 2,
          }}
        >
          {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </time>
      </div>
    </article>
  )
}

function Avatar() {
  return (
    <div aria-hidden="true" style={{
      width: 28, height: 28, borderRadius: '50%',
      background: 'linear-gradient(135deg, #1D9E75, #378ADD)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, marginTop: 2,
    }}>
      <Bot size={13} color="white" />
    </div>
  )
}

function UserAvatar() {
  return (
    <div aria-hidden="true" style={{
      width: 28, height: 28, borderRadius: '50%',
      background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)',
      flexShrink: 0, marginTop: 2,
    }}>
      You
    </div>
  )
}
