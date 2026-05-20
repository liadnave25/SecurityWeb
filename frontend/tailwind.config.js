/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Legacy tokens (kept for backward compat during migration)
        'thiscount-blue-dark': '#2B4A7D',
        'thiscount-blue-primary': '#3B82F6',
        'thiscount-orange': '#D97706',
        'thiscount-gray-light': '#F8F9FA',
        'thiscount-text-primary': '#2B3F61',
        // Secure Dark palette
        'tc': {
          'bg':        '#0D1117',
          'surface':   '#161B22',
          'elevated':  '#21262D',
          'border':    '#30363D',
          'blue':      '#58A6FF',
          'emerald':   '#3FB950',
          'amber':     '#D29922',
          'red':       '#F85149',
          'purple':    '#BC8CFF',
          'text':      '#E6EDF3',
          'muted':     '#8B949E',
          'faint':     '#484F58',
        },
      },
      boxShadow: {
        'card':     '0 10px 40px -10px rgba(121, 159, 237, 0.4)',
        'dark-sm':  '0 1px 3px rgba(0,0,0,0.4)',
        'dark-md':  '0 4px 16px rgba(0,0,0,0.5)',
        'dark-lg':  '0 8px 32px rgba(0,0,0,0.6)',
        'glow-blue':'0 0 20px rgba(88,166,255,0.15)',
      },
    },
  },
  plugins: [],
}