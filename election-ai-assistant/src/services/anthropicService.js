/**
 * anthropicService.js
 * Handles all communication with the Anthropic Claude API.
 * Supports streaming, context management, and dynamic system prompts.
 */

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 1024

// ─── System prompt factory ────────────────────────────────────────────────────
// Builds a context-aware system prompt based on user state

export function buildSystemPrompt({ userLocation, calendarConnected, userName }) {
  const locationCtx = userLocation
    ? `The user is located near: ${userLocation}. When relevant, tailor answers to their local election context.`
    : 'The user has not shared their location.'

  const calendarCtx = calendarConnected
    ? 'The user has connected Google Calendar. When they mention wanting reminders, confirm you can add them to their calendar.'
    : 'Google Calendar is not connected yet.'

  const nameCtx = userName ? `The user's name is ${userName}.` : ''

  return `You are ElectionAI, a smart, friendly, and non-partisan election assistant. Your role is to help users understand elections, voting, civic participation, and democracy clearly and accurately.

${nameCtx}
${locationCtx}
${calendarCtx}

## Your capabilities:
- Explain voter registration, election timelines, polling, vote counting, and electoral systems
- Answer questions about specific countries' election systems when asked
- Help users find local polling information
- Suggest Google Calendar reminders for election dates
- Recommend reliable YouTube resources about civic education
- Detect when a user needs location-based help (polling station, local candidates) and prompt them to share location

## Behavior rules:
- Be concise: 2–4 short paragraphs unless the user asks for more detail
- Be non-partisan: never favor any political party or candidate
- Be proactive: if a user seems confused, ask a clarifying question
- Use plain language — no jargon unless explained
- When recommending a Google service action (calendar, maps, YouTube), clearly signal it with a line starting with "ACTION:" followed by the action type in brackets, e.g.: ACTION:[CALENDAR] Add "Election Day" reminder | ACTION:[MAPS] Find polling stations near you | ACTION:[YOUTUBE] Search: civic education explained

Always ground your answers in facts. If unsure, say so.`
}

// ─── Smart intent detector ────────────────────────────────────────────────────
// Detects what Google service action (if any) is suggested from AI response

export function detectActions(text) {
  const actions = []
  const regex = /ACTION:\[(\w+)\] (.+)/g
  let match
  while ((match = regex.exec(text)) !== null) {
    actions.push({ type: match[1], label: match[2].trim() })
  }
  return actions
}

// Strips ACTION lines from text before rendering
export function stripActions(text) {
  return text.replace(/ACTION:\[\w+\] .+(\n|$)/g, '').trim()
}

// ─── Core API call ────────────────────────────────────────────────────────────

export async function sendMessage({ messages, systemPrompt, onChunk, signal }) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    throw new Error('MISSING_API_KEY')
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages,
      stream: !!onChunk,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }

  // Streaming mode
  if (onChunk) {
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
      for (const line of lines) {
        try {
          const data = JSON.parse(line.slice(6))
          if (data.type === 'content_block_delta' && data.delta?.text) {
            fullText += data.delta.text
            onChunk(data.delta.text, fullText)
          }
        } catch (_) { /* skip malformed chunks */ }
      }
    }
    return fullText
  }

  // Non-streaming fallback
  const data = await response.json()
  return data.content?.find(b => b.type === 'text')?.text ?? ''
}
