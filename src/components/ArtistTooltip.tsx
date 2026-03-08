import { useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ARTISTS } from '../config'
import type { Performance } from '../config'
import { t2m } from '../utils/time'
import { useOnline } from '../hooks/useOnline'
import { Badge } from './Badge'

interface ArtistTooltipProps {
  item: Performance
  onClose: () => void
}

export function ArtistTooltip({ item, onClose }: ArtistTooltipProps) {
  const [closing, setClosing] = useState(false)
  const dur = t2m(item.end) - t2m(item.start)
  const artist = ARTISTS[item.artist]
  const desc = artist?.desc || null
  const embedUrl = artist?.embedUrl || null
  const online = useOnline()
  const dismiss = useCallback(() => { setClosing(true); setTimeout(onClose, 260) }, [onClose])
  const backdropRef = useRef<HTMLDivElement>(null)
  const descRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = backdropRef.current
    if (!el) return
    const prevent = (e: TouchEvent) => {
      if (descRef.current && descRef.current.contains(e.target as Node)) return
      e.preventDefault()
    }
    el.addEventListener("touchmove", prevent, { passive: false })
    document.body.style.overflow = "hidden"
    return () => {
      el.removeEventListener("touchmove", prevent)
      document.body.style.overflow = ""
    }
  }, [])

  return createPortal(
    <div ref={backdropRef} className="lp-tooltip-backdrop" onClick={dismiss}
      style={closing ? { animation: "lpBackdropOut .22s ease-in forwards" } : {}}>
      <div className="lp-tooltip"
        style={{
          maxHeight: (desc || embedUrl) ? "70vh" : "auto",
          display: "flex", flexDirection: "column",
          ...(closing ? { animation: "tooltipOut .2s var(--ease-out) forwards" } : {}),
        }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexShrink: 0 }}>
          <Badge stage={item.stage} large />
          <span style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {item.start} – {item.end}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-5)", fontWeight: 500 }}>{dur} 分鐘</span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.45, color: "var(--text)", letterSpacing: "-.01em", flexShrink: 0 }}>
          {item.artist}
        </div>
        {desc && (
          <div ref={descRef} className="no-scrollbar" style={{
            fontSize: 13, color: "var(--text-3)", lineHeight: 1.65,
            marginTop: 10, paddingTop: 10,
            borderTop: ".5px solid var(--dim)",
            overflowY: "auto", flexShrink: 1,
            WebkitOverflowScrolling: "touch",
          }}>
            {desc.split("\n").map((p, i) => p.trim() ? <p key={i} style={{ margin: "0 0 8px" }}>{p}</p> : null)}
          </div>
        )}
        {embedUrl && online && (
          <div style={{ marginTop: 10, flexShrink: 0 }}>
            <iframe
              allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
              frameBorder="0"
              style={{
                width: "100%", height: 175, maxWidth: 660,
                overflow: "hidden", borderRadius: 10,
                background: "transparent",
              }}
              sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
              src={embedUrl}
            />
          </div>
        )}
        {embedUrl && !online && (
          <div style={{
            marginTop: 10, padding: "10px 14px",
            borderRadius: 10, background: "var(--surface)",
            border: ".5px solid var(--surface-border)",
            fontSize: 12, color: "var(--text-4)", fontWeight: 500,
            textAlign: "center",
          }}>
            目前為離線模式，無法播放音樂
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
