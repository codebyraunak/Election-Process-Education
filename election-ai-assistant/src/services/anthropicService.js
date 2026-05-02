/**
 * aiService.js
 * Handles AI communication using Google Gemini API (free).
 * Falls back to demo mode if API key is missing.
 */

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

// ─── Demo responses ───────────────────────────────────────────────────────────
const DEMO_RESPONSES = {
  default: `I'm running in **demo mode**. Add your Gemini API key to activate full AI responses!\n\nElections are the foundation of democracy — they allow citizens to choose their representatives. The process involves voter registration, campaigning, election day voting, and vote counting.`,
  register: `**Voter Registration steps:**\n\n- Check eligibility: citizen, 18+, resident\n- Gather documents: photo ID and proof of address\n- Register online at your official electoral website\n- Verify your registration before election day`,
  vote: `**How to Vote:**\n\n1. Find your polling station\n2. Bring valid photo ID\n3. Check in with the electoral officer\n4. Mark your ballot privately\n5. Submit in the sealed ballot box`,
  count: `**How Votes Are Counted:**\n\n1. Ballot boxes sealed after polls close\n2. Ballots sorted and verified\n3. Every valid vote counted\n4. Results certified by electoral commission`,
}

function getDemoResponse(message) {
  const lower = message.toLowerCase()
  if (lower.includes('register')) return DEMO_RESPONSES.register
  if (lower.includes('vote') || lower.includes('voting')) return DEMO_RESPONSES.vote
  if (lower.includes('count') || lower.includes('result')) return DEMO_RESPONSES.count
  return DEMO_RESPONSES.default
}

// ─── System prompt ────────────────────────────────────────────────────────────
export function buildSystemPrompt({ userLocation, calendarConnected, userName }) {
  return `You are ElectionAI, a smart, friendly, non-partisan election assistant helping users understand elections, voting, and democracy.

${userName ? `The user's name is ${userName}.` : ''}
${userLocation ? `User location: ${userLocation}. Tailor answers to their local context.` : ''}
${calendarConnected ? 'Google Calendar is connected — offer to add reminders.' : ''}

Rules:
- Be concise: 2-4 short paragraphs
- Be strictly non-partisan
- Use plain language
- When a Google action is useful: ACTION:[CALENDAR] label | ACTION:[MAPS] label | ACTION:[YOUTUBE] Search: query`
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
  const key = import.meta.env.VITE_GEMINI_API_KEY
  return !!(key && key.trim() !== '' && key !== 'your_gemini_api_key_here')
}

// ─── Main send function ───────────────────────────────────────────────────────
export async function sendMessage({ messages, systemPrompt, onChunk, signal }) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

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

  // Build Gemini request format
  const geminiMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: geminiMessages,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  }

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Gemini API error ${res.status}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  // Simulate streaming for Gemini (non-streaming endpoint)
  if (onChunk && text) {
    const words = text.split(' ')
    let accumulated = ''
    for (const word of words) {
      if (signal?.aborted) break
      accumulated += (accumulated ? ' ' : '') + word
      onChunk(word + ' ', accumulated)
      await new Promise(r => setTimeout(r, 15))
    }
  }

  return text
}
