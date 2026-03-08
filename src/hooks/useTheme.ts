import { useState, useCallback } from 'react'

export function applyTheme(resolved: 'dark' | 'light') {
  document.documentElement.setAttribute('data-theme', resolved)
  const m = document.getElementById('meta-theme')
  if (m) m.setAttribute('content', resolved === 'dark' ? '#000000' : '#f2f2f7')
}

export function useTheme() {
  const [resolved, setResolved] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme-pref')
    if (saved === 'light' || saved === 'dark') return saved
    return matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'
  })

  const toggle = useCallback(() => {
    const next = resolved === 'dark' ? 'light' : 'dark'
    setResolved(next)
    localStorage.setItem('theme-pref', next)
    applyTheme(next)
  }, [resolved])

  return { resolved, toggle }
}
