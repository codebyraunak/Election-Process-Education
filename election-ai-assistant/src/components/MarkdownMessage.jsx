/**
 * MarkdownMessage.jsx
 * Renders AI responses with safe markdown formatting.
 */

import React from 'react'
import ReactMarkdown from 'react-markdown'

const components = {
  p: ({ children }) => (
    <p style={{ margin: '0 0 0.6em', lineHeight: 1.7 }}>{children}</p>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{children}</strong>
  ),
  em: ({ children }) => <em>{children}</em>,
  ul: ({ children }) => (
    <ul style={{ paddingLeft: '1.2em', margin: '0.4em 0 0.6em' }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ paddingLeft: '1.2em', margin: '0.4em 0 0.6em' }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: '0.25em', lineHeight: 1.65 }}>{children}</li>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85em',
          background: 'var(--bg-tertiary)',
          padding: '1px 5px',
          borderRadius: 4,
        }}
      >
        {children}
      </code>
    ) : (
      <pre
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85em',
          background: 'var(--bg-tertiary)',
          padding: '10px 14px',
          borderRadius: 8,
          overflowX: 'auto',
          margin: '0.5em 0',
        }}
      >
        <code>{children}</code>
      </pre>
    ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote
      style={{
        borderLeft: '3px solid var(--brand-green)',
        paddingLeft: '0.8em',
        margin: '0.5em 0',
        color: 'var(--text-secondary)',
      }}
    >
      {children}
    </blockquote>
  ),
}

export default function MarkdownMessage({ content }) {
  return (
    <ReactMarkdown components={components}>
      {content || ''}
    </ReactMarkdown>
  )
}
