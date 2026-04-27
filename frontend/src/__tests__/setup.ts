/**
 * Vitest global test setup file.
 * Imported before every test file (configured in vite.config.ts).
 *
 * @testing-library/jest-dom extends Vitest's `expect` with DOM-aware
 * matchers such as:
 *   toBeInTheDocument()  — element exists in the DOM
 *   toHaveTextContent()  — element contains specific text
 *   toHaveValue()        — input has a specific value
 *   toBeDisabled()       — element is disabled
 */
import '@testing-library/jest-dom';
