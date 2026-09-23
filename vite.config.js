import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves project sites from https://<user>.github.io/<repo>/, so the
// deploy workflow sets PAGES_REPO to the repo name. Unset (local dev, custom domain) → "/".
// It is a bare name rather than a path because Git Bash on Windows rewrites
// path-like environment values.
const repo = process.env.PAGES_REPO

export default defineConfig({
  base: repo ? `/${repo}/` : '/',
  plugins: [react()],
})
