/**
 * ChatWindow.jsx
 * Main chat interface: message list, input bar, and streaming indicator.
 */

import React, { useRef, useEffect, useState } from 'react'
import { Send, Square, Trash2, Bot } from 'lucide-react'
import MarkdownMessage from './MarkdownMessage.jsx'
import ActionBar from './ActionBar.jsx'

export default function ChatWindow({
  messages,
  isLoading,
  error,
  onSend,
  onStop,
  onClear,
  onAction,
  calendarLoading,
  calendarResult,
}) {
  const [input, setInput] = useState('')
  const [rows, setRows] = useState(1)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function handleInput(e) {
    setInput(e.target.value)
    const lineCount = (e.target.value.match(/\n/g) || []).length + 1
    setRows(Math.min(lineCount, 5))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    setRows(1)
    onSend(text)
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      {/* Topbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1D9E75, #378ADD)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bot size={16} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>ElectionAI</div>
          <div style={{ fontSize: 11, color: '#1D9E75', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#1D9E75',
                animation: 'pulse 2s infinite',
              }}
            />
            Online · Non-partisan election guide
          </div>
        </div>
        <button
          onClick={onClear}
          title="Clear chat"
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '5px 8px',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            gap: 4,
            fontSize: 12,
          }}
        >
          <Trash2 size={13} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '18px 18px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <style>{`
          @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }
          @keyframes blink { 0%,80%,100%{opacity:0.15}40%{opacity:1} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)} }
        `}</style>

        {messages.map(msg => (
          <Message
            key={msg.id}
            msg={msg}
            onAction={onAction}
            calendarLoading={calendarLoading}
            calendarResult={calendarResult}
          />
        ))}

        {isLoading && !messages.some(m => m.streaming) && (
          <div style={{ display: 'flex', gap: 10 }}>
            <Avatar />
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '4px 14px 14px 14px',
                padding: '10px 14px',
                display: 'flex',
                gap: 5,
                alignItems: 'center',
              }}
            >
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'var(--text-tertiary)',
                    animation: `blink 1.2s ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              fontSize: 13,
              color: '#c4302b',
              background: '#fdecea',
              border: '1px solid #f5c6c6',
              borderRadius: 10,
              padding: '10px 14px',
            }}
          >
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about elections…"
          rows={rows}
          style={{
            flex: 1,
            resize: 'none',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '9px 13px',
            fontSize: 14,
            fontFamily: 'var(--font-sans)',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            outline: 'none',
            lineHeight: 1.5,
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = '#1D9E75'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />

        {isLoading ? (
          <button
            onClick={onStop}
            style={{
              width: 40, height: 40,
              borderRadius: '50%',
              background: '#ff4444',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Square size={14} color="white" fill="white" />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!input.trim()}
            style={{
              width: 40, height: 40,
              borderRadius: '50%',
              background: input.trim() ? 'linear-gradient(135deg, #1D9E75, #378ADD)' : 'var(--bg-tertiary)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() ? 'pointer' : 'default',
              flexShrink: 0,
              transition: 'background 0.2s',
            }}
          >
            <Send size={15} color={input.trim() ? 'white' : 'var(--text-tertiary)'} />
          </button>
        )}
      </div>
    </div>
  )
}

function Message({ msg, onAction, calendarLoading, calendarResult }) {
  const isAI = msg.role === 'assistant'

  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        flexDirection: isAI ? 'row' : 'row-reverse',
        animation: 'fadeUp 0.2s ease',
      }}
    >
      {isAI ? <Avatar /> : <UserAvatar />}

      <div style={{ maxWidth: '78%' }}>
        <div
          style={{
            padding: '10px 14px',
            fontSize: 14,
            lineHeight: 1.65,
            color: isAI ? 'var(--text-primary)' : 'white',
            background: isAI
              ? 'var(--bg-secondary)'
              : 'linear-gradient(135deg, #1D9E75, #378ADD)',
            border: isAI ? '1px solid var(--border)' : 'none',
            borderRadius: isAI ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
          }}
        >
          {isAI ? <MarkdownMessage content={msg.content} /> : msg.content}
          {msg.streaming && (
            <span
              style={{
                display: 'inline-block',
                width: 8, height: 14,
                background: '#1D9E75',
                marginLeft: 2,
                borderRadius: 2,
                animation: 'pulse 0.8s infinite',
                verticalAlign: 'text-bottom',
              }}
            />
          )}
        </div>

        {isAI && msg.actions?.length > 0 && (
          <ActionBar
            actions={msg.actions}
            onAction={onAction}
            calendarLoading={calendarLoading}
            calendarResult={calendarResult}
          />
        )}

        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4, textAlign: isAI ? 'left' : 'right', paddingLeft: isAI ? 2 : 0, paddingRight: isAI ? 0 : 2 }}>
          {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

function Avatar() {
  return (
    <div
      style={{
        width: 28, height: 28, borderRadius: '50%',
        background: 'linear-gradient(135deg, #1D9E75, #378ADD)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 2,
      }}
    >
      <Bot size={13} color="white" />
    </div>
  )
}

function UserAvatar() {
  return (
    <div
      style={{
        width: 28, height: 28, borderRadius: '50%',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)',
        flexShrink: 0, marginTop: 2,
      }}
    >
      You
    </div>
  )
}
