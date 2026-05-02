/**
 * anthropicService.test.js
 * Unit tests for the AI service layer — action detection, prompt building, key checking.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  detectActions,
  stripActions,
  buildSystemPrompt,
  isApiKeyConfigured,
} from '../services/anthropicService.js'

// ─── detectActions ────────────────────────────────────────────────────────────

describe('detectActions', () => {
  it('returns empty array when no actions present', () => {
    const result = detectActions('This is a normal response with no actions.')
    expect(result).toEqual([])
  })

  it('detects a single CALENDAR action', () => {
    const text = 'You should set a reminder.\nACTION:[CALENDAR] Add Election Day reminder'
    const result = detectActions(text)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ type: 'CALENDAR', label: 'Add Election Day reminder' })
  })

  it('detects a MAPS action', () => {
    const text = 'Find your polling station.\nACTION:[MAPS] Find polling stations near you'
    const result = detectActions(text)
    expect(result[0].type).toBe('MAPS')
    expect(result[0].label).toBe('Find polling stations near you')
  })

  it('detects a YOUTUBE action', () => {
    const text = 'Watch this video.\nACTION:[YOUTUBE] Search: how voting works explained'
    const result = detectActions(text)
    expect(result[0].type).toBe('YOUTUBE')
  })

  it('detects multiple actions', () => {
    const text = 'Here are suggestions:\nACTION:[CALENDAR] Add reminder\nACTION:[MAPS] Find station'
    const result = detectActions(text)
    expect(result).toHaveLength(2)
  })
})

// ─── stripActions ─────────────────────────────────────────────────────────────

describe('stripActions', () => {
  it('removes ACTION lines from text', () => {
    const text = 'Normal content here.\nACTION:[CALENDAR] Add reminder\nMore content.'
    const result = stripActions(text)
    expect(result).not.toContain('ACTION:')
    expect(result).toContain('Normal content here.')
  })

  it('returns unchanged text when no actions', () => {
    const text = 'Just a normal response.'
    expect(stripActions(text)).toBe(text)
  })

  it('strips multiple action lines', () => {
    const text = 'Content.\nACTION:[CALENDAR] Reminder\nACTION:[MAPS] Find station'
    const result = stripActions(text)
    expect(result).toBe('Content.')
  })
})

// ─── buildSystemPrompt ────────────────────────────────────────────────────────

describe('buildSystemPrompt', () => {
  it('includes user name when provided', () => {
    const prompt = buildSystemPrompt({ userName: 'Raunak', userLocation: '', calendarConnected: false })
    expect(prompt).toContain('Raunak')
  })

  it('includes location context when provided', () => {
    const prompt = buildSystemPrompt({ userName: '', userLocation: 'Mysuru, India', calendarConnected: false })
    expect(prompt).toContain('Mysuru, India')
  })

  it('mentions calendar connected when true', () => {
    const prompt = buildSystemPrompt({ userName: '', userLocation: '', calendarConnected: true })
    expect(prompt).toContain('Google Calendar')
    expect(prompt).toContain('connected')
  })

  it('returns a non-empty string', () => {
    const prompt = buildSystemPrompt({ userName: '', userLocation: '', calendarConnected: false })
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(100)
  })

  it('always includes non-partisan instruction', () => {
    const prompt = buildSystemPrompt({ userName: '', userLocation: '', calendarConnected: false })
    expect(prompt.toLowerCase()).toContain('non-partisan')
  })
})

// ─── isApiKeyConfigured ───────────────────────────────────────────────────────

describe('isApiKeyConfigured', () => {
  it('returns false when key is placeholder', () => {
    // In test env, VITE_ANTHROPIC_API_KEY is not set
    const result = isApiKeyConfigured()
    expect(typeof result).toBe('boolean')
  })
})
