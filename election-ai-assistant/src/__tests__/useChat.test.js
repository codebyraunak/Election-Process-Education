/**
 * useChat.test.js
 * Tests for the chat state machine — message handling, history building.
 */

import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChat } from '../hooks/useChat.js'

// Mock the anthropic service
vi.mock('../services/anthropicService.js', () => ({
  sendMessage: vi.fn(async ({ messages, onChunk }) => {
    const reply = 'This is a mock AI response about elections.'
    if (onChunk) {
      onChunk('This is a mock', reply)
    }
    return reply
  }),
  buildSystemPrompt: vi.fn(() => 'mock system prompt'),
  detectActions: vi.fn(() => []),
  stripActions: vi.fn(text => text),
}))

describe('useChat', () => {
  const defaultContext = { userName: '', userLocation: '', calendarConnected: false }

  it('initializes with a welcome message', () => {
    const { result } = renderHook(() => useChat({ userContext: defaultContext }))
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].role).toBe('assistant')
    expect(result.current.messages[0].id).toBe('welcome')
  })

  it('starts with isLoading false', () => {
    const { result } = renderHook(() => useChat({ userContext: defaultContext }))
    expect(result.current.isLoading).toBe(false)
  })

  it('starts with no error', () => {
    const { result } = renderHook(() => useChat({ userContext: defaultContext }))
    expect(result.current.error).toBeNull()
  })

  it('adds user message when sendUserMessage is called', async () => {
    const { result } = renderHook(() => useChat({ userContext: defaultContext }))
    await act(async () => {
      await result.current.sendUserMessage('How do I register to vote?')
    })
    const userMsg = result.current.messages.find(m => m.role === 'user')
    expect(userMsg).toBeDefined()
    expect(userMsg.content).toBe('How do I register to vote?')
  })

  it('adds AI response after user message', async () => {
    const { result } = renderHook(() => useChat({ userContext: defaultContext }))
    await act(async () => {
      await result.current.sendUserMessage('What is election day?')
    })
    const aiMessages = result.current.messages.filter(m => m.role === 'assistant')
    expect(aiMessages.length).toBeGreaterThan(1) // welcome + response
  })

  it('clears chat on clearChat call', async () => {
    const { result } = renderHook(() => useChat({ userContext: defaultContext }))
    await act(async () => {
      await result.current.sendUserMessage('Test message')
    })
    act(() => {
      result.current.clearChat()
    })
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].id).toBe('welcome')
  })

  it('ignores empty messages', async () => {
    const { result } = renderHook(() => useChat({ userContext: defaultContext }))
    const initialLength = result.current.messages.length
    await act(async () => {
      await result.current.sendUserMessage('   ')
    })
    expect(result.current.messages).toHaveLength(initialLength)
  })
})
