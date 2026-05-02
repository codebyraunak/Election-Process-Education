import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_ANTHROPIC_API_KEY: '',
      VITE_GOOGLE_API_KEY: '',
      VITE_GOOGLE_CLIENT_ID: '',
      VITE_GOOGLE_MAPS_API_KEY: '',
    }
  }
})

// Mock window.google
global.window.google = {
  accounts: {
    oauth2: {
      initTokenClient: vi.fn(() => ({
        requestAccessToken: vi.fn(),
        callback: null,
      })),
    },
  },
}
