/**
 * anthropicService.js
 * Handles all communication with the Anthropic Claude API.
 * Supports streaming, context management, and dynamic system prompts.
 * Falls back to demo mode if API key is missing.
 */

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 1024

// Demo responses for when no API key is configured
const DEMO_RESPONSES = {
  default: `I'm running in **demo mode** since no API key is configured yet.\n\nTo activate full AI responses, add your Anthropic API key to your \`.env\` file as \`VITE_ANTHROPIC_API_KEY=sk-ant-...\` and redeploy.\n\nGet a free key at [console.anthropic.com](https://console.anthropic.com)\n\nIn the meantime — elections are the foundation of democracy, allowing citizens to choose representatives and hold them accountable. Ask me anything and I'll give you a helpful answer even in demo mode!`,
  register: `**Voter Registration** is your first step!\n\n- Check eligibility: citizen, 18+, resident\n- Gather documents: photo ID and proof of address\n- Register online at your official electoral website\n- Verify your registration before election day\n\nDeadlines vary by country — some allow same-day registration!`,
  vote: `**How to Vote on Election Day:**\n\n1. Find your assigned polling station\n2. Bring valid photo ID\n3. Check in with the electoral officer\n4. Enter the private voting booth\n5. Mark your ballot carefully\n6. Submit in the sealed ballot box\n\nPolls typically open 7am–10pm. Mail voting is available in many countries!`,
  count: `**How Votes Are Counted:**\n\n1. Ballot boxes sealed and transported under guard\n2. Ballots sorted and verified for validity\n3. Every valid vote counted and recorded\n4. Results from each station tallied\n5. Electoral commission certifies the final result\n\nIndependent monitors observe the entire process for transparency.`,
  system: `**Electoral Systems Explained:**\n\n- **First Past The Post (FPTP)**: Candidate with most votes wins, used in USA and UK\n- **Proportional Representation**: Seats allocated based on vote share, common in Europe\n- **Ranked Choice Voting**: Voters rank candidates by preference\n- **Two-Round System**: If no majority in round 1, top two candidates face a runoff\n\nEach system has different effects on representation and governance!`
}

function getDemoResponse(message) {
  const lower = message.toLowerCase()
  if (lower.includes('register')) return DEMO_RESPONSES.register
  if (lower.includes('vote') || lower.includes('voting') || lower.includes('election day') || lower.includes('poll')) return DEMO_RESPONSES.vote
  if (lower.includes('count') || lower.includes('result') || lower.includes('tally')) return DEMO_RESPONSES.count
  if (lower.includes('system') || lower.includes('proportional') || lower.includes('fptp') || lower.includes('ranked')) return DEMO_RESPONSES.system
  return DEMO_RESPONSES.default
}

export function buildSystemPrompt({ userLocation, calendarConnected, userName }) {
  const locationCtx = userLocation
    ? `The user is located near: ${userLocation}. When relevant, tailor answers to their local election context.`
    : 'The user has not shared their location.'
  const calendarCtx = calendarConnected
    ? 'The user has connected Google Calendar. When they mention wanting reminders, confirm you can add them.'
    : 'Google Calendar is not connected yet.'
  const nameCtx = userName ? `The user's name is ${userName}.` : ''

  return `You are ElectionAI, a smart, friendly, and non-partisan election assistant helping users understand elections, voting, civic participation, and democracy.

${nameCtx}
${locationCtx}
${calendarCtx}

## Capabilities:
- Explain voter registration, election timelines, polling, vote counting, electoral systems
- Answer questions about specific countries' election systems
- Help users find local polling information
- Suggest Google Calendar reminders for election dates
- Recommend YouTube resources about civic education

## Rules:
- Be concise: 2-4 short paragraphs unless more detail is requested
- Be strictly non-partisan: never favor any party or candidate
- Use plain language
- When recommending a Google action: ACTION:[CALENDAR] label | ACTION:[MAPS] label | ACTION:[YOUTUBE] Search: query

Always be factual. If unsure, say so.`
}

export function detectActions(text) {
  const actions = []
  const regex = /ACTION:\[(\w+)\] (.+)/g
  let match
  while ((match = regex.exec(text)) !== null) {
    actions.push({ type: match[1], label: match[2].trim() })
  }
  return actions
}

export function stripActions(text) {
  return text.replace(/ACTION:\[\w+\] .+(\n|$)/g, '').trim()
}

export function isApiKeyConfigured() {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  return !!(key && key !== 'your_anthropic_api_key_here' && key.trim() !== '')
}

export async function sendMessage({ messages, systemPrompt, onChunk, signal }) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  if (!isApiKeyConfigured()) {
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || ''
    const demoText = getDemoResponse(lastUserMsg)
    if (onChunk) {
      const words = demoText.split(' ')
      let accumulated = ''
      for (const word of words) {
        if (signal?.aborted) break
        accumulated += (accumulated ? ' ' : '') + word
        onChunk(word + ' ', accumulated)
        await new Promise(r => setTimeout(r, 25))
      }
    }
    return demoText
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
        } catch (_) {}
      }
    }
    return fullText
  }

  const data = await response.json()
  return data.content?.find(b => b.type === 'text')?.text ?? ''
}
