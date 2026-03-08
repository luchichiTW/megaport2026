import { useState } from 'react'
import { STAGES } from '../config'
import type { Performance } from '../config'
import { useLongPress } from '../hooks/useLongPress'
import { Badge } from './Badge'
import { ArtistTooltip } from './ArtistTooltip'

interface CardProps {
  item: Performance
  selected: boolean
  dimmed: boolean
  conflict: boolean
  onToggle: (id: string) => void
  showBadge?: boolean
  status?: string | null
  progress?: number
}

export function Card({ item, selected, dimmed, conflict, onToggle, showBadge = true, status, progress }: CardProps) {
  const c = STAGES[item.stage]?.bg || "#888"
  const [tooltip, setTooltip] = useState(false)
  const lp = useLongPress((pos) => setTooltip(true))
  const isPlaying = status === "playing"
  const isEnded = status === "ended"
  return (
    <>
      {tooltip && <ArtistTooltip item={item} onClose={() => setTooltip(false)} />}
      <button className="press"
        onClick={() => { if (!lp.prevented.current) onToggle(item.id) }}
        onTouchStart={lp.onTouchStart} onTouchEnd={lp.onTouchEnd} onTouchMove={lp.onTouchMove}
        onContextMenu={e => e.preventDefault()}
        style={{
          WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none",
          display: "flex", alignItems: "center", gap: 11,
          width: "100%", padding: "13px 16px",
          borderRadius: 18, cursor: "pointer", textAlign: "left",
          position: "relative", color: "inherit", fontFamily: "inherit",
          overflow: "hidden",
          background: selected
            ? `linear-gradient(135deg, ${c}20, ${c}0A)`
            : isPlaying
              ? `linear-gradient(135deg, ${c}12, ${c}06)`
              : "var(--surface)",
          border: selected
            ? `.5px solid ${c}50`
            : isPlaying
              ? `.5px solid ${c}30`
              : `.5px solid var(--surface-border)`,
          boxShadow: selected
            ? `0 4px 24px ${c}18, inset 0 .5px 0 var(--surface-hi), inset 0 0 0 .5px ${c}20`
            : `inset 0 .5px 0 var(--surface-hi)`,
          backdropFilter: selected ? "blur(30px) saturate(200%)" : "none",
          WebkitBackdropFilter: selected ? "blur(30px) saturate(200%)" : "none",
          opacity: dimmed && !selected ? .35 : isEnded && !selected ? .45 : 1,
          transition: "all .25s cubic-bezier(.16,1,.3,1)",
        }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: selected ? 4 : 0,
          background: `linear-gradient(180deg, ${c}, ${c}AA)`,
          borderRadius: "18px 0 0 18px",
          transition: "width .25s cubic-bezier(.16,1,.3,1)",
        }} />

        <span style={{
          fontVariantNumeric: "tabular-nums", fontSize: 13,
          color: "var(--text-3)", minWidth: 85, fontWeight: 500,
        }}>
          {item.start}–{item.end}
        </span>

        {showBadge && <Badge stage={item.stage} />}

        <span style={{
          fontSize: 15, fontWeight: 600, flex: 1,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          lineHeight: 1.3,
        }}>
          {item.artist}
        </span>

        {isPlaying && (
          <span style={{
            fontSize: 10, fontWeight: 700, flexShrink: 0,
            background: `${c}25`, color: c,
            padding: "2px 8px", borderRadius: 6,
          }}>演出中</span>
        )}
        {isEnded && (
          <span style={{
            fontSize: 10, fontWeight: 600, flexShrink: 0,
            color: "var(--text-5)",
          }}>已結束</span>
        )}

        {conflict && selected && !isPlaying && !isEnded && (
          <span style={{
            fontSize: 10, fontWeight: 700, flexShrink: 0,
            background: "rgba(255,80,80,.12)", color: "#FF6B6B",
            padding: "3px 9px", borderRadius: 8,
            boxShadow: `inset 0 .5px 0 var(--dim)`,
          }}>撞場</span>
        )}

        {isPlaying && (
          <div className="progress-bar-track" style={{ left: 16, right: 16, bottom: 8 }}>
            <div className="progress-bar-fill" style={{
              width: `${Math.min(100, Math.max(0, (progress || 0) * 100))}%`,
              background: "var(--text-4)",
            }} />
          </div>
        )}
      </button>
    </>
  )
}
