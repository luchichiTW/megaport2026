import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'
import { applyTheme } from './hooks/useTheme'

// Apply theme immediately to prevent flash
const saved = localStorage.getItem('theme-pref')
const initial = (saved === 'light' || saved === 'dark')
  ? saved
  : matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'
applyTheme(initial)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/megaport2026/sw.js').catch(err => {
    console.warn('SW registration failed:', err)
  })
}
