import { useRef, useCallback } from 'react'

interface LongPressPos {
  x: number
  y: number
}

export function useLongPress(cb: (pos: LongPressPos | null) => void, ms = 500) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevented = useRef(false)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    prevented.current = false
    const t = e.touches?.[0]
    const pos = t ? { x: t.clientX, y: t.clientY } : null
    timer.current = setTimeout(() => { prevented.current = true; cb(pos) }, ms)
  }, [cb, ms])

  const onTouchEnd = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const onTouchMove = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  return { onTouchStart, onTouchEnd, onTouchMove, prevented }
}
