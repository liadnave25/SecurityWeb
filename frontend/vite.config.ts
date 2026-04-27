import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // ── Vitest configuration ──────────────────────────────────────────
  // Vitest uses the same config file as Vite and has a Jest-compatible
  // API: describe/it/expect/vi.fn() map to jest's describe/it/expect/jest.fn().
  test: {
    // jsdom simulates a real browser DOM so React components can be
    // rendered and queried in tests without a browser.
    environment: 'jsdom',

    // Load setup.ts before every test file.
    // setup.ts imports @testing-library/jest-dom which adds DOM matchers
    // like toBeInTheDocument(), toHaveTextContent(), toHaveValue(), etc.
    setupFiles: ['./src/__tests__/setup.ts'],

    // Make describe/it/expect/vi available globally without importing them.
    globals: true,
  },
})
