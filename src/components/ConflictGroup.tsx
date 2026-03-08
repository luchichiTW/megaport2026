import React from 'react'
import { STAGES } from '../config'
import type { Performance } from '../config'
import { t2m } from '../utils/time'
import { TimelineCard } from './TimelineCard'

interface ConflictGroupProps {
  items: Performance[]
  pref: Set<string>
  onPref: (id: string, groupIds: string[]) => void
  groupRef?: React.Ref<HTMLDivElement>
  getStatus?: (item: Performance) => string | null
  getProgress?: (item: Performance) => number
}

export function ConflictGroup({ items, pref, onPref, groupRef, getStatus, getProgress }: ConflictGroupProps) {
  const prefId = items.find(i => pref.has(i.id))?.id || null
  const collapsed = prefId !== null
  const otherCount = items.length - 1
  const latestEnd = Math.max(...items.map(i => t2m(i.end)))
  const day = items[0]?.day
  return (
    <div className={`conflict-group${collapsed ? " collapsed" : ""}`} ref={groupRef} data-end={latestEnd} data-day={day}>
      <div className={`conflict-item-wrap${collapsed ? " hidden" : ""}`} style={{ marginBottom: collapsed ? 0 : 10 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          paddingLeft: 4, paddingBottom: 10,
        }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="#FF6B6B" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M8 6.5V9.5" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11.5" r=".75" fill="#FF6B6B" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#FF6B6B" }}>
            時間撞場
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,80,80,.5)", fontWeight: 500 }}>
            — 點選想去的演出
          </span>
        </div>
      </div>
      {items.map(item => {
        const isPref = prefId === item.id
        const isOther = collapsed && !isPref
        const st = getStatus?.(item) ?? null
        const c = STAGES[item.stage]?.bg || "#888"
        if (isPref && collapsed) {
          const layers = Math.min(otherCount, 2)
          return (
            <div key={item.id} className="conflict-stack"
              onClick={() => onPref(prefId, items.map(i => i.id))}
              style={{ marginBottom: layers * 6 + 8 }}>
              {Array.from({ length: layers }, (_, i) => (
                <div key={i} className="conflict-stack-layer" style={{
                  transform: `translateY(${(i + 1) * 6}px) scaleX(${1 - (i + 1) * 0.025})`,
                  opacity: 0.7 - i * 0.25,
                  zIndex: -(i + 1),
                  borderColor: `${c}${i === 0 ? "30" : "18"}`,
                  background: `linear-gradient(135deg, ${c}${i === 0 ? "0C" : "06"}, var(--glass-mid), ${c}${i === 0 ? "08" : "04"})`,
                }} />
              ))}
              <TimelineCard
                item={item} gap={null}
                preferred={true}
                dimmed={false}
                onClick={() => {}}
                status={st} progress={st === "playing" ? getProgress?.(item) ?? 0 : 0}
              />
            </div>
          )
        }
        return (
          <div key={item.id} className={`conflict-item-wrap${isOther ? " hidden" : ""}`}>
            <TimelineCard
              item={item} gap={null}
              preferred={false}
              dimmed={false}
              onClick={() => onPref(item.id, items.map(i => i.id))}
              status={st} progress={st === "playing" ? getProgress?.(item) ?? 0 : 0}
            />
          </div>
        )
      })}
    </div>
  )
}
