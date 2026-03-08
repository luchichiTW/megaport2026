import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { EVENT } from '../config'

interface TimePickerProps {
  simNow: Date | null
  onSet: (d: Date) => void
  onReset: () => void
  onClose: () => void
}

function getDayFromDate(d: Date): number | null {
  const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  if (ds === EVENT.dates[1]) return 1
  if (ds === EVENT.dates[2]) return 2
  return null
}

export function TimePicker({ simNow, onSet, onReset, onClose }: TimePickerProps) {
  const [closing, setClosing] = useState(false)
  const current = simNow || new Date()
  const curDay = getDayFromDate(current) || 1
  const curH = current.getHours()
  const curM = current.getMinutes()

  const dismiss = useCallback(() => {
    setClosing(true)
    setTimeout(onClose, 280)
  }, [onClose])

  const setTime = (day: number, h: number, m: number) => {
    const [y, mo, d] = EVENT.dates[day].split('-').map(Number)
    onSet(new Date(y, mo - 1, d, h, m, 0))
  }

  const adjust = (dH: number, dM: number) => {
    let h = curH + dH
    let m = curM + dM
    if (m >= 60) { m -= 60; h++ }
    if (m < 0) { m += 60; h-- }
    h = Math.max(0, Math.min(23, h))
    setTime(curDay, h, m)
  }

  const presets = [
    { label: "DAY 1 開場", day: 1, h: 12, m: 40 },
    { label: "DAY 1 下午", day: 1, h: 15, m: 0 },
    { label: "DAY 1 晚上", day: 1, h: 19, m: 0 },
    { label: "DAY 2 開場", day: 2, h: 12, m: 40 },
    { label: "DAY 2 下午", day: 2, h: 15, m: 0 },
    { label: "DAY 2 晚上", day: 2, h: 19, m: 0 },
  ]

  return createPortal(
    <>
      <div className="time-picker-backdrop"
        style={closing ? { animation: "fadeOut .25s ease-out forwards" } : {}}
        onClick={dismiss}
      />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10000, display: "flex", justifyContent: "center" }}>
        <div className="time-picker-sheet"
          style={closing ? { animation: "sheetDown .28s var(--ease-out) forwards" } : {}}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>模擬時間</span>
            <button onClick={dismiss} style={{
              background: "var(--dim)", border: "none", borderRadius: 50,
              width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-3)", fontSize: 18, fontFamily: "inherit",
            }}>×</button>
          </div>

          <div style={{
            textAlign: "center", padding: "16px 0 20px",
            fontSize: 40, fontWeight: 800, fontVariantNumeric: "tabular-nums",
            color: "var(--text)", letterSpacing: 2,
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-4)", display: "block", marginBottom: 4 }}>
              {EVENT.dayShortLabels[curDay]}
            </span>
            {String(curH).padStart(2, '0')}:{String(curM).padStart(2, '0')}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 20 }}>
            {[
              { label: "-1h", dH: -1, dM: 0 }, { label: "-10m", dH: 0, dM: -10 },
              { label: "+10m", dH: 0, dM: 10 }, { label: "+1h", dH: 1, dM: 0 },
            ].map(a => (
              <button key={a.label} className="press" onClick={() => adjust(a.dH, a.dM)} style={{
                padding: "10px 16px", borderRadius: 12, border: "none",
                background: "var(--seg-bg)", color: "var(--text-2)",
                fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                boxShadow: `inset 0 .5px 0 var(--surface-hi)`,
              }}>{a.label}</button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
            {presets.map(p => (
              <button key={p.label} className="press" onClick={() => setTime(p.day, p.h, p.m)} style={{
                padding: "12px 8px", borderRadius: 14, border: "none",
                background: curDay === p.day && curH === p.h && curM === p.m
                  ? "rgba(244,162,97,.15)" : "var(--surface)",
                color: curDay === p.day && curH === p.h && curM === p.m
                  ? "#F4A261" : "var(--text-2)",
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                boxShadow: `inset 0 .5px 0 var(--surface-border)`,
                lineHeight: 1.4,
              }}>{p.label}</button>
            ))}
          </div>

          <button className="press" onClick={() => { onReset(); dismiss() }} style={{
            width: "100%", padding: "14px", borderRadius: 14, border: "none",
            background: simNow ? "var(--seg-bg)" : "var(--surface)",
            color: simNow ? "var(--text)" : "var(--text-5)",
            fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            boxShadow: `inset 0 .5px 0 var(--surface-border)`,
          }}>
            恢復即時
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
