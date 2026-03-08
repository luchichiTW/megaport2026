import { useState, useCallback, useEffect, useRef } from 'react'
import { STAGES, STAGE_LOCS, STAGE_REGIONS } from '../config'

function navUrl(k: string): string | null {
  const loc = STAGE_LOCS[k]
  if (!loc) return null
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    ? `maps://maps.apple.com/?daddr=${loc.lat},${loc.lng}&dirflg=w`
    : `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}&travelmode=walking`
}

interface StagePopup {
  name: string
  bg: string
  url: string
  loc: { lat: number; lng: number }
}

interface ImageViewerProps {
  src: string
  hotspots?: boolean
  onClose: () => void
}

export function ImageViewer({ src, hotspots, onClose }: ImageViewerProps) {
  const [closing, setClosing] = useState(false)
  const [stagePopup, setStagePopup] = useState<StagePopup | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  const dismiss = useCallback(() => {
    if (closing) return
    setClosing(true)
    setTimeout(onClose, 320)
  }, [onClose, closing])

  useEffect(() => {
    if (!hotspots) return
    const img = imgRef.current
    const o = overlayRef.current
    if (!img || !o) return
    let raf: number
    const sync = () => {
      const r = img.getBoundingClientRect()
      o.style.left = r.left + "px"
      o.style.top = r.top + "px"
      o.style.width = r.width + "px"
      o.style.height = r.height + "px"
      raf = requestAnimationFrame(sync)
    }
    raf = requestAnimationFrame(sync)
    return () => cancelAnimationFrame(raf)
  }, [hotspots])

  useEffect(() => {
    const img = imgRef.current
    if (!img) return

    let scale = 1, tx = 0, ty = 0
    let startScale: number, startTx: number, startTy: number
    let startDist: number, startMidX: number, startMidY: number
    let panX: number, panY: number
    let fingers = 0, hasMoved = false
    let lastTapTime = 0, singleTapTimer = 0
    let isDraggingToDismiss = false, dragStartY = 0, lastMoveY = 0, lastMoveTime = 0
    const backdrop = backdropRef.current

    const dismissRef = () => {
      document.querySelector('.img-viewer-backdrop')?.classList.add('closing')
      document.querySelector('.img-viewer-wrap')?.classList.add('closing')
      setTimeout(onClose, 320)
    }

    const setTransform = (animate: boolean) => {
      img.style.transition = animate ? 'transform .3s cubic-bezier(.16,1,.3,1)' : 'none'
      img.style.transform = `translate(-50%,-50%) translate(${tx}px,${ty}px) scale(${scale})`
    }

    const dist = (a: Touch, b: Touch) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)

    const handleStart = (e: TouchEvent) => {
      e.preventDefault()
      hasMoved = false
      img.style.transition = 'none'

      if (e.touches.length === 2) {
        fingers = 2
        startDist = dist(e.touches[0], e.touches[1])
        startMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        startMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2
        startScale = scale
        startTx = tx
        startTy = ty
      } else if (e.touches.length === 1) {
        fingers = 1
        panX = e.touches[0].clientX
        panY = e.touches[0].clientY
        startTx = tx
        startTy = ty
      }
    }

    const handleMove = (e: TouchEvent) => {
      e.preventDefault()
      hasMoved = true

      if (e.touches.length === 2 && fingers >= 2) {
        isDraggingToDismiss = false
        const d = dist(e.touches[0], e.touches[1])
        const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2
        const my = (e.touches[0].clientY + e.touches[1].clientY) / 2
        const newScale = Math.max(0.5, Math.min(10, startScale * (d / startDist)))
        const W2 = window.innerWidth / 2, H2 = window.innerHeight / 2
        tx = mx - W2 - (startMidX - W2 - startTx) * (newScale / startScale)
        ty = my - H2 - (startMidY - H2 - startTy) * (newScale / startScale)
        scale = newScale
        setTransform(false)
      } else if (e.touches.length === 1) {
        const dy = e.touches[0].clientY - panY
        const dx = e.touches[0].clientX - panX

        if (scale <= 1.05 && fingers === 1 && !isDraggingToDismiss && Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx) * 1.2) {
          isDraggingToDismiss = true
          dragStartY = panY
        }

        if (isDraggingToDismiss) {
          const dragDy = e.touches[0].clientY - dragStartY
          const progress = Math.min(Math.abs(dragDy) / 300, 1)
          const dragScale = 1 - progress * 0.3
          img.style.transition = 'none'
          img.style.transform = `translate(-50%,-50%) translateY(${dragDy}px) scale(${dragScale})`
          if (backdrop) backdrop.style.opacity = String(1 - progress * 0.4)
          lastMoveY = e.touches[0].clientY
          lastMoveTime = Date.now()
        } else {
          tx = startTx + dx
          ty = startTy + dy
          setTransform(false)
        }
      }
    }

    const handleEnd = (e: TouchEvent) => {
      e.preventDefault()

      if (e.touches.length === 1) {
        fingers = 1
        panX = e.touches[0].clientX
        panY = e.touches[0].clientY
        startTx = tx
        startTy = ty
        return
      }

      if (e.touches.length > 0) return
      fingers = 0

      if (isDraggingToDismiss) {
        isDraggingToDismiss = false
        const finalDy = e.changedTouches[0].clientY - dragStartY
        const velocity = Math.abs(lastMoveY - dragStartY) / Math.max(1, Date.now() - lastMoveTime + 100)
        if (Math.abs(finalDy) > 100 || velocity > 0.5) {
          img.style.transition = 'none'
          img.style.transform = 'translate(-50%,-50%)'
          img.style.opacity = ''
          if (backdrop) { backdrop.style.transition = 'none'; backdrop.style.opacity = '' }
          scale = 1; tx = 0; ty = 0
          requestAnimationFrame(() => dismissRef())
        } else {
          img.style.transition = 'transform .4s cubic-bezier(.32,.72,.35,1)'
          img.style.transform = 'translate(-50%,-50%) scale(1)'
          if (backdrop) { backdrop.style.transition = 'opacity .4s cubic-bezier(.32,.72,.35,1)'; backdrop.style.opacity = '1' }
          scale = 1; tx = 0; ty = 0
        }
        return
      }

      if (scale < 1) {
        scale = 1; tx = 0; ty = 0
        setTransform(true)
      }

      if (!hasMoved) {
        const now = Date.now()
        if (now - lastTapTime < 300) {
          clearTimeout(singleTapTimer)
          if (scale > 1.2) { scale = 1; tx = 0; ty = 0 }
          else { scale = 3 }
          setTransform(true)
          lastTapTime = 0
        } else {
          lastTapTime = now
          const tapX = e.changedTouches[0].clientX
          const tapY = e.changedTouches[0].clientY
          singleTapTimer = window.setTimeout(() => {
            const rect = img.getBoundingClientRect()
            if (hotspots && tapX >= rect.left && tapX <= rect.right && tapY >= rect.top && tapY <= rect.bottom) {
              const px = (tapX - rect.left) / rect.width * 100
              const py = (tapY - rect.top) / rect.height * 100
              for (const [k, r] of Object.entries(STAGE_REGIONS)) {
                if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) {
                  const s = STAGES[k]
                  const url = navUrl(k)
                  if (s && url) {
                    setStagePopup({ name: s.name, bg: s.bg, url, loc: STAGE_LOCS[k] })
                  }
                  return
                }
              }
            }
            if (scale <= 1.05) {
              const rect2 = img.getBoundingClientRect()
              if (tapX < rect2.left || tapX > rect2.right || tapY < rect2.top || tapY > rect2.bottom) {
                dismissRef()
              }
            }
          }, 300)
        }
      }
    }

    const el = img.parentElement!
    el.addEventListener('touchstart', handleStart, { passive: false })
    el.addEventListener('touchmove', handleMove, { passive: false })
    el.addEventListener('touchend', handleEnd, { passive: false })

    const block = (e: Event) => e.preventDefault()
    document.addEventListener('gesturestart', block, { passive: false })
    document.addEventListener('gesturechange', block, { passive: false })
    document.addEventListener('gestureend', block, { passive: false })

    return () => {
      clearTimeout(singleTapTimer)
      el.removeEventListener('touchstart', handleStart)
      el.removeEventListener('touchmove', handleMove)
      el.removeEventListener('touchend', handleEnd)
      document.removeEventListener('gesturestart', block)
      document.removeEventListener('gesturechange', block)
      document.removeEventListener('gestureend', block)
    }
  }, [])

  return <>
    <div ref={backdropRef} className={`img-viewer-backdrop${closing ? ' closing' : ''}`} />
    <div className={`img-viewer-wrap${closing ? ' closing' : ''}`}>
      <img ref={imgRef} src={src} alt="" draggable={false}
        style={{ position: "absolute", top: "50%", left: "50%", maxWidth: "100%", maxHeight: "100%", objectFit: "contain", transform: "translate(-50%,-50%)", userSelect: "none", WebkitUserSelect: "none", pointerEvents: "none" }}
      />
    </div>
    {hotspots && (
      <div ref={overlayRef} style={{
        position: "fixed", zIndex: 20002, pointerEvents: "none",
      }}>
        {Object.entries(STAGE_REGIONS).map(([k, r]) => {
          const s = STAGES[k]
          if (!s) return null
          return (
            <div key={k} style={{
              position: "absolute",
              left: `${r.x}%`, top: `${r.y}%`,
              width: `${r.w}%`, height: `${r.h}%`,
              borderRadius: 6,
              border: `2px solid transparent`,
              background: `transparent`,
            }} />
          )
        })}
      </div>
    )}
    <button className="img-viewer-close" onClick={dismiss} style={{ opacity: closing ? 0 : 1 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </button>
    {stagePopup && (
      <div style={{
        position: "fixed", inset: 0, zIndex: 20010,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        paddingBottom: `calc(32px + var(--safe-bottom))`,
      }} onClick={() => setStagePopup(null)}>
        <div onClick={e => e.stopPropagation()} className="liquid-glass" style={{
          width: "min(320px, 85vw)",
          borderRadius: 20,
          padding: "18px 20px 14px",
          animation: "imgViewerIn .3s var(--ease-out) both",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: stagePopup.bg, flexShrink: 0 }} />
            <span style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", letterSpacing: -.2 }}>{stagePopup.name}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-4)", marginBottom: 16, paddingLeft: 20 }}>
            {stagePopup.loc.lat.toFixed(4)}, {stagePopup.loc.lng.toFixed(4)}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStagePopup(null)} style={{
              flex: 1, height: 44, borderRadius: 12,
              border: ".5px solid var(--glass-border)",
              background: "var(--surface)", color: "var(--text-3)",
              fontSize: 15, fontWeight: 600, cursor: "pointer",
            }}>取消</button>
            <button onClick={() => { window.open(stagePopup.url, "_blank", "noopener,noreferrer"); setStagePopup(null) }} style={{
              flex: 1, height: 44, borderRadius: 12, border: "none",
              background: stagePopup.bg, color: "#fff",
              fontSize: 15, fontWeight: 600, cursor: "pointer",
              boxShadow: `0 2px 12px ${stagePopup.bg}40`,
            }}>導航前往</button>
          </div>
        </div>
      </div>
    )}
  </>
}
