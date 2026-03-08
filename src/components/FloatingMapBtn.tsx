import { useRef, useEffect } from 'react'

interface FloatingMapBtnProps {
  onMapOpen: () => void
}

export function FloatingMapBtn({ onMapOpen }: FloatingMapBtnProps) {
  const btnRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0, moved: false })
  const pos = useRef({ x: -1, y: -1 })

  useEffect(() => {
    const el = btnRef.current
    if (!el) return
    if (pos.current.x < 0) {
      pos.current.x = window.innerWidth - 60
      pos.current.y = window.innerHeight - 180
      el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`
    }
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0]
      drag.current = { dragging: true, startX: t.clientX, startY: t.clientY, origX: pos.current.x, origY: pos.current.y, moved: false }
    }
    const onMove = (e: TouchEvent) => {
      const d = drag.current
      if (!d.dragging) return
      const t = e.touches[0]
      const dx = t.clientX - d.startX, dy = t.clientY - d.startY
      if (!d.moved && Math.abs(dx) + Math.abs(dy) > 5) d.moved = true
      if (d.moved) {
        e.preventDefault()
        const nx = Math.max(0, Math.min(window.innerWidth - 44, d.origX + dx))
        const ny = Math.max(0, Math.min(window.innerHeight - 44, d.origY + dy))
        pos.current = { x: nx, y: ny }
        el.style.transform = `translate(${nx}px, ${ny}px)`
      }
    }
    const onEnd = () => {
      drag.current.dragging = false
      const mid = window.innerWidth / 2
      const nx = pos.current.x < mid ? 12 : window.innerWidth - 56
      pos.current.x = nx
      el.style.transition = "transform .3s cubic-bezier(.16,1,.3,1)"
      el.style.transform = `translate(${nx}px, ${pos.current.y}px)`
      setTimeout(() => { el.style.transition = "none" }, 300)
    }
    el.addEventListener("touchstart", onStart, { passive: true })
    el.addEventListener("touchmove", onMove, { passive: false })
    el.addEventListener("touchend", onEnd, { passive: true })
    return () => {
      el.removeEventListener("touchstart", onStart)
      el.removeEventListener("touchmove", onMove)
      el.removeEventListener("touchend", onEnd)
    }
  }, [])

  return (
    <div ref={btnRef} style={{
      position: "fixed", top: 0, left: 0, zIndex: 150,
      touchAction: "none",
      WebkitUserSelect: "none", userSelect: "none",
    }}>
      <div onClick={() => { if (!drag.current.moved) onMapOpen() }}
        style={{
          width: 44, height: 44, borderRadius: 22,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, var(--glass-start), var(--glass-mid), var(--glass-end))",
          border: ".5px solid var(--glass-border)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          boxShadow: "var(--glass-shadow), inset 0 .5px 0 var(--glass-hi)",
          cursor: "pointer",
        }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      </div>
    </div>
  )
}
