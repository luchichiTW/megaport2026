import { useMemo } from 'react'
import { STAGES, SCHEDULE } from '../config'
import { t2m } from '../utils/time'
import { TtBlock } from './TtBlock'

interface TimetableProps {
  day: number
  sel: string[]
  toggle: (id: string) => void
  dimIds: Set<string>
  confIds: Set<string>
  activeDay: number | null
  activeMinutes: number
}

export function Timetable({ day, sel, toggle, dimIds, confIds, activeDay, activeMinutes }: TimetableProps) {
  const PX_PER_MIN = 2
  const HEADER_H = 32
  const dayItems = useMemo(() => SCHEDULE.filter(t => t.day === day), [day])
  const stages = useMemo(() => Object.keys(STAGES).filter(k => dayItems.some(t => t.stage === k)), [dayItems])

  const minTime = useMemo(() => {
    const m = Math.min(...dayItems.map(t => t2m(t.start)))
    return Math.floor(m / 60) * 60
  }, [dayItems])
  const maxTime = useMemo(() => {
    const m = Math.max(...dayItems.map(t => t2m(t.end)))
    return Math.ceil(m / 60) * 60
  }, [dayItems])

  const totalH = (maxTime - minTime) * PX_PER_MIN
  const toY = (timeStr: string) => (t2m(timeStr) - minTime) * PX_PER_MIN + HEADER_H
  const toH = (start: string, end: string) => (t2m(end) - t2m(start)) * PX_PER_MIN

  const lines = useMemo(() => {
    const out: { m: number; isHour: boolean }[] = []
    for (let m = minTime; m <= maxTime; m += 30) {
      out.push({ m, isHour: m % 60 === 0 })
    }
    return out
  }, [minTime, maxTime])

  return (
    <div className="tt-wrap" style={{ flex: 1, minHeight: 0, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="tt-time-col" style={{ height: totalH + HEADER_H }}>
        {lines.map(l => (
          <div key={l.m} className="tt-time-label" style={{ top: (l.m - minTime) * PX_PER_MIN + HEADER_H }}>
            {l.isHour ? `${Math.floor(l.m / 60)}:00` : `${Math.floor(l.m / 60)}:30`}
          </div>
        ))}
      </div>
      <div className="tt-stages" style={{ position: "relative", height: totalH + HEADER_H }}>
        {stages.map(stg => {
          const items = dayItems.filter(t => t.stage === stg)
          return (
            <div key={stg} className="tt-stage-col" style={{ height: totalH + HEADER_H }}>
              <div className="tt-stage-header" style={{ background: STAGES[stg].bg }}>
                {STAGES[stg].name}
              </div>
              {lines.map(l => (
                <div key={l.m} className={l.isHour ? "tt-hour-line" : "tt-half-line"}
                  style={{ top: (l.m - minTime) * PX_PER_MIN + HEADER_H }} />
              ))}
              {items.map(item => (
                <TtBlock key={item.id} item={item} stg={stg}
                  selected={sel.includes(item.id)}
                  dimmed={dimIds.has(item.id)}
                  conflict={confIds.has(item.id)}
                  top={toY(item.start)}
                  height={Math.max(toH(item.start, item.end) - 2, 14)}
                  toggle={toggle}
                />
              ))}
            </div>
          )
        })}
        {day === activeDay && activeMinutes >= minTime && activeMinutes <= maxTime && (
          <div style={{
            position: "absolute", left: 0, right: 0, zIndex: 4,
            top: (activeMinutes - minTime) * PX_PER_MIN + HEADER_H,
            pointerEvents: "none",
          }}>
            <div style={{
              position: "absolute", left: 0, right: 0, height: 1.5,
              background: "#FF6B6B",
            }} />
            <div style={{
              position: "absolute", left: 0, top: -3.5,
              width: 8, height: 8, borderRadius: "50%",
              background: "#FF6B6B",
              boxShadow: "0 0 8px rgba(255,80,80,.5)",
            }} />
          </div>
        )}
      </div>
    </div>
  )
}
