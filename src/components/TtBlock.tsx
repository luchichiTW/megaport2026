import { useState } from 'react'
import { STAGES } from '../config'
import type { Performance } from '../config'
import { useLongPress } from '../hooks/useLongPress'
import { ArtistTooltip } from './ArtistTooltip'

interface TtBlockProps {
  item: Performance
  stg: string
  selected: boolean
  dimmed: boolean
  conflict: boolean
  top: number
  height: number
  toggle: (id: string) => void
}

export function TtBlock({ item, stg, selected, dimmed, conflict, top, height, toggle }: TtBlockProps) {
  const [tooltip, setTooltip] = useState(false)
  const lp = useLongPress(() => setTooltip(true))
  return (
    <>
      {tooltip && <ArtistTooltip item={item} onClose={() => setTooltip(false)} />}
      <div
        className={`tt-block${selected ? " selected" : ""}${dimmed ? " dimmed" : ""}${conflict ? " conflict" : ""}`}
        style={{
          top, height,
          background: selected
            ? `linear-gradient(135deg, ${STAGES[stg].bg}44, ${STAGES[stg].bg}22)`
            : undefined,
        }}
        onClick={() => { if (!lp.prevented.current) toggle(item.id) }}
        onTouchStart={lp.onTouchStart} onTouchEnd={lp.onTouchEnd} onTouchMove={lp.onTouchMove}
        onContextMenu={e => e.preventDefault()}
      >
        {item.artist}
      </div>
    </>
  )
}
