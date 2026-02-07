import { defineConfig } from 'vite'

export default defineConfig({
  base: '/app/',
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'farmaproject.zapto.org',
      '172.20.0.5'
    ]
  }
})
