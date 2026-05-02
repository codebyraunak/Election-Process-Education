/**
 * ApiKeyBanner.test.jsx
 * Tests for the demo mode banner component.
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ApiKeyBanner from '../components/ApiKeyBanner.jsx'

describe('ApiKeyBanner', () => {
  it('renders the demo mode notice', () => {
    render(<ApiKeyBanner />)
    expect(screen.getByText(/demo mode/i)).toBeDefined()
  })

  it('contains a link to the Anthropic console', () => {
    render(<ApiKeyBanner />)
    const link = screen.getByRole('link', { name: /get a free api key/i })
    expect(link).toBeDefined()
    expect(link.href).toContain('console.anthropic.com')
  })

  it('dismisses when close button is clicked', () => {
    render(<ApiKeyBanner />)
    const closeBtn = screen.getByRole('button', { name: /dismiss/i })
    fireEvent.click(closeBtn)
    expect(screen.queryByText(/demo mode/i)).toBeNull()
  })

  it('has role="alert" for accessibility', () => {
    render(<ApiKeyBanner />)
    const alert = screen.getByRole('alert')
    expect(alert).toBeDefined()
  })
})
