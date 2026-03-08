import { useState } from 'react'
import { STAGES } from '../config'
import type { Performance } from '../config'
import { useLongPress } from '../hooks/useLongPress'
import { Badge } from './Badge'
import { ArtistTooltip } from './ArtistTooltip'

interface SuggestionCardProps {
  item: Performance
  selected: boolean
  onToggle: (id: string) => void
}

export function SuggestionCard({ item, selected, onToggle }: SuggestionCardProps) {
  const sc = STAGES[item.stage]?.bg || "#888"
  const [tooltip, setTooltip] = useState(false)
  const lp = useLongPress(() => setTooltip(true))
  return (
    <>
      {tooltip && <ArtistTooltip item={item} onClose={() => setTooltip(false)} />}
      <div className="press" onClick={() => { if (!lp.prevented.current) onToggle(item.id) }}
        onTouchStart={lp.onTouchStart} onTouchEnd={lp.onTouchEnd} onTouchMove={lp.onTouchMove}
        onContextMenu={e => e.preventDefault()}
        style={{
          flexShrink: 0, padding: "10px 14px",
          borderRadius: 14, cursor: "pointer",
          background: selected
            ? `linear-gradient(135deg, ${sc}30, ${sc}18)`
            : `linear-gradient(135deg, ${sc}18, ${sc}0A)`,
          border: selected ? `.5px solid ${sc}60` : `.5px solid ${sc}30`,
          boxShadow: selected ? `0 2px 12px ${sc}20` : "none",
          minWidth: 120, maxWidth: 180,
          transition: "all .2s",
          WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none",
          position: "relative",
        }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: selected ? 3 : 0,
          background: `linear-gradient(180deg, ${sc}, ${sc}AA)`,
          borderRadius: "14px 0 0 14px",
          transition: "width .2s cubic-bezier(.16,1,.3,1)",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <Badge stage={item.stage} />
          <span style={{ fontSize: 11, color: "var(--text-4)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {item.start}–{item.end}
          </span>
        </div>
        <div style={{
          fontSize: 13, fontWeight: 600, color: "var(--text)",
          lineHeight: 1.3, overflow: "hidden",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {item.artist}
        </div>
      </div>
    </>
  )
}
