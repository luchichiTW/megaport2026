import { useState } from 'react'
import { STAGES } from '../config'
import type { Performance } from '../config'
import { t2m } from '../utils/time'
import { useLongPress } from '../hooks/useLongPress'
import { Badge } from './Badge'
import { ArtistTooltip } from './ArtistTooltip'

interface TimelineCardProps {
  item: Performance
  gap: number | null
  preferred?: boolean
  dimmed?: boolean
  onClick?: (e: React.MouseEvent) => void
  status?: string | null
  progress?: number
}

export function TimelineCard({ item, gap, preferred, dimmed, onClick, status, progress }: TimelineCardProps) {
  const c = STAGES[item.stage]?.bg || "#888"
  const dur = t2m(item.end) - t2m(item.start)
  const isClickable = !!onClick
  const isPlaying = status === "playing"
  const isEnded = status === "ended"
  const [tooltip, setTooltip] = useState(false)
  const lp = useLongPress(() => setTooltip(true))
  return (
    <>
      {tooltip && <ArtistTooltip item={item} onClose={() => setTooltip(false)} />}
      {gap !== null && gap > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 0", justifyContent: "center",
        }}>
          <div style={{ flex: 1, height: .5, background: "var(--divider)" }} />
          <span style={{ fontSize: 11, color: "var(--text-5)", fontWeight: 500 }}>
            {gap} 分鐘
          </span>
          <div style={{ flex: 1, height: .5, background: "var(--divider)" }} />
        </div>
      )}
      <div onClick={e => { if (!lp.prevented.current && onClick) onClick(e) }}
        onTouchStart={lp.onTouchStart} onTouchEnd={lp.onTouchEnd} onTouchMove={lp.onTouchMove}
        onContextMenu={e => e.preventDefault()}
        style={{
          WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none",
          position: "relative", marginBottom: 8,
          borderRadius: 18, overflow: "hidden",
          cursor: isClickable ? "pointer" : "default",
          background: preferred
            ? `linear-gradient(135deg, ${c}28, ${c}12)`
            : isPlaying
              ? `linear-gradient(135deg, ${c}22, ${c}10)`
              : `linear-gradient(135deg, ${c}14, ${c}08)`,
          border: preferred
            ? `.5px solid ${c}60`
            : isPlaying
              ? `.5px solid ${c}50`
              : `.5px solid ${c}25`,
          boxShadow: preferred
            ? `0 4px 24px ${c}25, inset 0 .5px 0 var(--surface-hi)`
            : undefined,
          opacity: dimmed ? .4 : isEnded ? .45 : 1,
          transition: "all .25s cubic-bezier(.16,1,.3,1)",
        }}>
        {isPlaying && (
          <div className="now-playing-glow" style={{ "--glow-color": `${c}50` } as React.CSSProperties} />
        )}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: preferred || isPlaying ? 4 : 3,
          background: `linear-gradient(180deg, ${c}, ${c}${preferred || isPlaying ? "" : "88"})`,
          borderRadius: "3px 0 0 3px",
          transition: "width .25s",
        }} />
        <div style={{ padding: `16px 18px ${isPlaying ? 20 : 16}px 20px`, position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontVariantNumeric: "tabular-nums", fontSize: 13,
              color: "var(--text-3)", fontWeight: 600,
            }}>
              {item.start} – {item.end}
            </span>
            <Badge stage={item.stage} large />
            {isPlaying && (
              <span style={{
                fontSize: 10, fontWeight: 700,
                background: `${c}25`, color: c,
                padding: "2px 8px", borderRadius: 6,
                boxShadow: `inset 0 .5px 0 var(--surface-hi)`,
              }}>演出中</span>
            )}
            {isEnded && (
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: "var(--text-5)",
              }}>已結束</span>
            )}
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 8, lineHeight: 1.3 }}>
            {item.artist}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 4, fontWeight: 500 }}>
            {dur} 分鐘
          </div>
        </div>
        {isPlaying && (
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{
              width: `${Math.min(100, Math.max(0, (progress || 0) * 100))}%`,
              background: "var(--text-4)",
            }} />
          </div>
        )}
      </div>
    </>
  )
}
