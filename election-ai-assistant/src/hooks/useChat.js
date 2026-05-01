/**
 * useChat.js
 * Core chat state machine. Manages message history, streaming,
 * context tracking, and smart action detection.
 */

import { useState, useCallback, useRef } from 'react'
import {
  sendMessage,
  buildSystemPrompt,
  detectActions,
  stripActions,
} from '../services/anthropicService'

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi! I'm **ElectionAI** — your smart guide to everything elections and democracy. I can help you understand how to vote, find polling stations, set calendar reminders, and much more.\n\nWhat would you like to know?",
  actions: [],
  timestamp: new Date(),
}

export function useChat({ userContext }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Ref to hold the full streaming text without re-renders on every chunk
  const streamRef = useRef('')
  const abortRef = useRef(null)

  // Build conversation history for the API (exclude welcome, strip actions)
  const buildHistory = useCallback((msgs) =>
    msgs
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role, content: m.rawContent || m.content })),
    []
  )

  const sendUserMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return

    setError(null)
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      rawContent: text,
      timestamp: new Date(),
    }

    // Placeholder for streaming assistant response
    const assistantId = `ai-${Date.now()}`
    const assistantPlaceholder = {
      id: assistantId,
      role: 'assistant',
      content: '',
      actions: [],
      timestamp: new Date(),
      streaming: true,
    }

    setMessages(prev => [...prev, userMsg, assistantPlaceholder])
    setIsLoading(true)
    streamRef.current = ''

    // Cancel any previous request
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    try {
      const systemPrompt = buildSystemPrompt(userContext)
      const history = buildHistory([...messages, userMsg])

      const fullText = await sendMessage({
        messages: history,
        systemPrompt,
        signal: abortRef.current.signal,
        onChunk: (_, accumulated) => {
          streamRef.current = accumulated
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, content: stripActions(accumulated), streaming: true }
                : m
            )
          )
        },
      })

      const actions = detectActions(fullText)
      const displayContent = stripActions(fullText)

      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: displayContent, rawContent: fullText, actions, streaming: false }
            : m
        )
      )
    } catch (err) {
      if (err.name === 'AbortError') return

      let friendlyError = 'Something went wrong. Please try again.'
      if (err.message === 'MISSING_API_KEY') {
        friendlyError = 'API key not configured. Please add your Anthropic API key to `.env`.'
      }

      setError(friendlyError)
      setMessages(prev => prev.filter(m => m.id !== assistantId))
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, messages, userContext, buildHistory])

  const clearChat = useCallback(() => {
    abortRef.current?.abort()
    setMessages([WELCOME_MESSAGE])
    setError(null)
  }, [])

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    setIsLoading(false)
    // Finalize the streaming message
    setMessages(prev =>
      prev.map(m => m.streaming ? { ...m, streaming: false } : m)
    )
  }, [])

  return { messages, isLoading, error, sendUserMessage, clearChat, stopStreaming }
}
