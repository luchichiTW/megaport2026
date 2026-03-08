import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { EVENT, STAGES, SCHEDULE } from './config'
import { t2m, clash, fmtTime } from './utils/time'
import { dbGet, dbSet, dbGetPref, dbSetPref } from './utils/db'
import { useTheme } from './hooks/useTheme'
import type { Performance } from './config'

import { Segment } from './components/Segment'
import { Pill } from './components/Pill'
import { ThemeIcon } from './components/ThemeIcon'
import { Card } from './components/Card'
import { SuggestionCard } from './components/SuggestionCard'
import { TimelineCard } from './components/TimelineCard'
import { ConflictGroup } from './components/ConflictGroup'
import { Timetable } from './components/Timetable'
import { FloatingMapBtn } from './components/FloatingMapBtn'
import { ImageViewer } from './components/ImageViewer'
import { TimePicker } from './components/TimePicker'
import { ConfirmDialog } from './components/ConfirmDialog'
import { Onboarding } from './components/Onboarding'

const T = SCHEDULE

// Festival date mapping
const DAY_DATES = EVENT.dates

// Earliest event start as a Date (day 1, earliest start minus 30 min)
const FESTIVAL_EARLIEST = (() => {
  const earliest = T.reduce<{ day: number; m: number; start: string } | null>((min, t) => {
    const m = t2m(t.start)
    return (!min || (t.day < min.day) || (t.day === min.day && m < min.m)) ? { day: t.day, m, start: t.start } : min
  }, null)!
  const [y, mo, d] = DAY_DATES[earliest.day].split('-').map(Number)
  return new Date(y, mo - 1, d, Math.floor((earliest.m - 30) / 60), (earliest.m - 30) % 60)
})()

function getDayFromDate(d: Date): number | null {
  const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  if (ds === DAY_DATES[1]) return 1
  if (ds === DAY_DATES[2]) return 2
  return null
}

export default function App() {
  const [sel, setSel] = useState<string[]>([])
  const [view, setView] = useState("pick")
  const [day, setDay] = useState(1)
  const [stg, setStg] = useState("ALL")
  const [pickMode, setPickMode] = useState("list")

  // Lock body scroll when timetable is visible
  useEffect(() => {
    const lock = view === "pick" && pickMode === "table"
    document.body.style.overflow = lock ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [view, pickMode])

  const [q, setQ] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const [rdy, setRdy] = useState(false)
  const [showSheet, setShowSheet] = useState(false)
  const [pref, setPref] = useState<Set<string>>(new Set())
  const [simNow, setSimNow] = useState<Date | null>(null)
  const [now, setNow] = useState(new Date())
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [lastTap, setLastTap] = useState(0)
  const theme = useTheme()
  const [showOnboard, setShowOnboard] = useState(() => !localStorage.getItem("onboard-done"))
  const [showRes, setShowRes] = useState(false)
  const [zoomImg, setZoomImg] = useState<string | { src: string; hotspots: boolean } | null>(null)

  // Tick real clock every 30s
  useEffect(() => {
    if (simNow) return
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [simNow])

  const rawNow = simNow || now
  const isClamped = !simNow && rawNow < FESTIVAL_EARLIEST
  const activeNow = isClamped ? FESTIVAL_EARLIEST : rawNow
  const activeDay = getDayFromDate(activeNow)
  const activeMinutes = activeNow.getHours() * 60 + activeNow.getMinutes()

  useEffect(() => {
    Promise.all([dbGet(), dbGetPref()]).then(([v, p]) => {
      setSel(v as string[]); setPref(new Set(p as string[])); setRdy(true)
    })
  }, [])
  useEffect(() => { if (rdy) dbSet(sel) }, [sel, rdy])
  useEffect(() => { if (rdy) dbSetPref([...pref]) }, [pref, rdy])

  const toggle = useCallback((id: string) => setSel(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]), [])
  const togglePref = useCallback((id: string, groupIds: string[]) => setPref(p => {
    const n = new Set(p)
    groupIds.forEach(gid => n.delete(gid))
    if (!p.has(id)) n.add(id)
    return n
  }), [])

  // Swipe between stages
  const pillsRef = useRef<HTMLDivElement>(null)
  const swipeRef = useRef({ x: 0, y: 0, swiping: false, locked: false })
  const [swipeX, setSwipeX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const swipeElRef = useRef<HTMLDivElement | null>(null)
  const skipTransition = useRef(false)

  const selItems = useMemo(() => T.filter(t => sel.includes(t.id)), [sel])
  const confIds = useMemo(() => {
    const s = new Set<string>()
    for (let i = 0; i < selItems.length; i++)
      for (let j = i + 1; j < selItems.length; j++)
        if (clash(selItems[i], selItems[j])) { s.add(selItems[i].id); s.add(selItems[j].id) }
    return s
  }, [selItems])
  const dimIds = useMemo(() => {
    const s = new Set<string>()
    T.forEach(t => {
      if (sel.includes(t.id)) return
      for (const si of selItems) if (clash(t, si)) { s.add(t.id); break }
    })
    return s
  }, [sel, selItems])

  const sched = useMemo(() => {
    const d: Record<number, Performance[]> = { 1: [], 2: [] }
    selItems.forEach(i => d[i.day]?.push(i))
    Object.values(d).forEach(a => a.sort((x, y) => t2m(x.start) - t2m(y.start)))
    return d
  }, [selItems])
  const stgsDay = useMemo(() => {
    const s = new Set<string>()
    T.forEach(t => { if (t.day === day) s.add(t.stage) })
    return ["ALL", ...Object.keys(STAGES).filter(k => s.has(k))]
  }, [day])
  const filterStage = useCallback((s: string) =>
    T.filter(t => {
      if (t.day !== day) return false
      if (q) return t.artist.toLowerCase().includes(q.toLowerCase())
      if (s !== "ALL" && t.stage !== s) return false
      return true
    }).sort((a, b) => t2m(a.start) - t2m(b.start)),
  [day, q])
  const list = useMemo(() => filterStage(stg), [filterStage, stg])
  const stgIdx = useMemo(() => stgsDay.indexOf(stg), [stgsDay, stg])
  const prevList = useMemo(() => stgIdx > 0 ? filterStage(stgsDay[stgIdx - 1]) : null, [filterStage, stgsDay, stgIdx])
  const nextList = useMemo(() => stgIdx < stgsDay.length - 1 ? filterStage(stgsDay[stgIdx + 1]) : null, [filterStage, stgsDay, stgIdx])
  const nC = Math.floor(confIds.size / 2)

  // Use refs to avoid stale closures in native listener
  const stgRef = useRef(stg)
  const stgsDayRef = useRef(stgsDay)
  useEffect(() => { stgRef.current = stg }, [stg])
  useEffect(() => { stgsDayRef.current = stgsDay }, [stgsDay])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    swipeRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, swiping: false, locked: false }
  }, [])

  const swipeHandlerRef = useRef<((e: TouchEvent) => void) | null>(null)
  if (!swipeHandlerRef.current) {
    swipeHandlerRef.current = (e: TouchEvent) => {
      const s = swipeRef.current
      if (s.locked) return
      const dx = e.touches[0].clientX - s.x
      const dy = e.touches[0].clientY - s.y
      if (!s.swiping && Math.abs(dy) > Math.abs(dx) * 1.2) { s.locked = true; return }
      if (!s.swiping && Math.abs(dx) > 6) { s.swiping = true; setSwiping(true) }
      if (s.swiping) {
        e.preventDefault()
        const stages = stgsDayRef.current
        const idx = stages.indexOf(stgRef.current)
        const atEdge = (dx < 0 && idx >= stages.length - 1) || (dx > 0 && idx <= 0)
        setSwipeX(atEdge ? dx * 0.25 : dx)
      }
    }
  }
  const swipeCallbackRef = useCallback((el: HTMLDivElement | null) => {
    if (swipeElRef.current && swipeHandlerRef.current) swipeElRef.current.removeEventListener("touchmove", swipeHandlerRef.current)
    swipeElRef.current = el
    if (el && swipeHandlerRef.current) el.addEventListener("touchmove", swipeHandlerRef.current, { passive: false })
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const s = swipeRef.current
    if (!s.swiping) { s.locked = false; return }
    s.swiping = false
    const dx = e.changedTouches[0].clientX - s.x
    const threshold = window.innerWidth * 0.2
    const stages = stgsDay
    const idx = stages.indexOf(stg)
    const w = window.innerWidth
    if (dx < -threshold && idx < stages.length - 1) {
      skipTransition.current = true
      setStg(stages[idx + 1])
      setSwipeX(w + dx)
      setSwiping(false)
      requestAnimationFrame(() => { skipTransition.current = false; setSwipeX(0) })
    } else if (dx > threshold && idx > 0) {
      skipTransition.current = true
      setStg(stages[idx - 1])
      setSwipeX(-w + dx)
      setSwiping(false)
      requestAnimationFrame(() => { skipTransition.current = false; setSwipeX(0) })
    } else {
      setSwiping(false)
      setSwipeX(0)
    }
  }, [stgsDay, stg])

  useEffect(() => {
    const c = pillsRef.current; if (!c) return
    const active = c.querySelector('[data-stage-active="1"]')
    if (active) active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
  }, [stg])

  const scrollToConflict = useCallback(() => {
    setView("sched")
    setTimeout(() => {
      const all = document.querySelectorAll('.conflict-group:not(.collapsed)')
      let el: Element | null = null
      for (const g of all) {
        const gDay = Number((g as HTMLElement).dataset.day)
        const gEnd = Number((g as HTMLElement).dataset.end)
        if (gDay > (activeDay ?? 0) || (gDay === activeDay && gEnd > activeMinutes)) { el = g; break }
      }
      if (!el) el = all[all.length - 1]
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 100)
  }, [activeDay, activeMinutes])

  const scrollToDay = useCallback((d: number) => {
    setView("sched")
    setTimeout(() => {
      const el = document.getElementById('sched-day-' + d)
      if (!el) return
      const header = document.querySelector('.liquid-glass')
      const offset = header ? header.getBoundingClientRect().height + 8 : 0
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: "smooth" })
    }, 100)
  }, [])

  const getStatus = useCallback((item: Performance) => {
    if (item.day !== activeDay) return null
    const s = t2m(item.start), e = t2m(item.end)
    if (activeMinutes >= e) return "ended"
    if (activeMinutes >= s && activeMinutes < e) return "playing"
    return "upcoming"
  }, [activeDay, activeMinutes])
  const getProgress = useCallback((item: Performance) => {
    const s = t2m(item.start), e = t2m(item.end)
    return (activeMinutes - s) / (e - s)
  }, [activeMinutes])

  return (
    <div style={{
      position: "relative", zIndex: 1,
      maxWidth: 520, margin: "0 auto",
      ...(view === "pick" && pickMode === "table"
        ? { height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }
        : { minHeight: "100dvh", paddingBottom: `calc(90px + var(--safe-bottom))` }),
    }}>

      {/* Floating Header */}
      <div className="liquid-glass" style={{
        position: "sticky", top: 0, zIndex: 100,
        padding: `calc(14px + var(--safe-top)) 18px 14px`,
        borderRadius: "0 0 24px 24px",
        borderTop: "none",
        boxShadow: "var(--glass-shadow), inset 0 -1px 0 var(--glass-lo)",
      }}>
        <div style={{ marginBottom: 14, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontSize: 24, fontWeight: 800, letterSpacing: -.5, lineHeight: 1.2,
            }}>
              <span style={{
                background: "linear-gradient(135deg, #FF6B6B 0%, #F4A261 50%, #FFD93D 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>{EVENT.shortName}</span>
              <span onClick={view === "sched" ? () => {
                const n = Date.now()
                if (n - lastTap < 400) setShowTimePicker(true)
                setLastTap(n)
              } : undefined} style={{
                color: simNow ? "#F4A261" : "var(--text-4)",
                fontWeight: 600, fontSize: 20, marginLeft: 6,
                cursor: view === "sched" ? "default" : "auto",
                transition: "color .2s",
              }}>{EVENT.year}{simNow && " ⏱"}</span>
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4, fontWeight: 500 }}>
              {EVENT.subtitle}
              <span style={{ margin: "0 6px", opacity: .3 }}>·</span>
              已選 {sel.length} 組
            </p>
          </div>
          <button className="theme-btn" onClick={theme.toggle} title={
            theme.resolved === 'light' ? '切換深色模式' : '切換淺色模式'
          }>
            <ThemeIcon resolved={theme.resolved} />
          </button>
        </div>

        <Segment
          items={[{ value: "pick", label: "選團" }, { value: "sched", label: "我的行程" }]}
          value={view} onChange={v => {
            setView(v as string)
            if (v === "sched") setTimeout(() => {
              const el = document.querySelector('.now-line') || document.querySelector('.now-playing-glow')?.parentElement
              if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
            }, 100)
          }}
        />

        {view === "pick" && (
          <>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Segment
                  items={[
                    { value: 1, label: EVENT.dayLabels[1] },
                    { value: 2, label: EVENT.dayLabels[2] },
                  ]}
                  value={day} onChange={v => {
                    setDay(v as number)
                    if (stg !== "ALL") {
                      const hasStage = T.some(t => t.day === (v as number) && t.stage === stg)
                      if (!hasStage) setStg("ALL")
                    }
                  }} size="sm"
                />
              </div>
              <button className="press" onClick={() => setPickMode(m => m === "list" ? "table" : "list")} style={{
                width: 36, height: 36, borderRadius: 10,
                border: ".5px solid var(--glass-border)",
                background: "linear-gradient(135deg, var(--glass-start), var(--glass-mid), var(--glass-end))",
                backdropFilter: "blur(50px) saturate(200%) brightness(1.1)",
                WebkitBackdropFilter: "blur(50px) saturate(200%) brightness(1.1)",
                boxShadow: "var(--glass-shadow), inset 0 .5px 0 var(--glass-hi)",
                color: "var(--text)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {pickMode === "list" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                )}
              </button>
            </div>

            {pickMode === "list" && (
              <div ref={pillsRef} className="no-scrollbar" style={{
                display: "flex", gap: 7, overflowX: "auto",
                paddingTop: 10, paddingBottom: 2, alignItems: "center",
              }}>
                {showSearch ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
                    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                      <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: .3 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
                      </svg>
                      <input
                        ref={searchRef}
                        value={q} onChange={e => setQ(e.target.value)}
                        placeholder="搜尋藝人..."
                        style={{
                          width: "100%", padding: "8px 32px 8px 30px",
                          borderRadius: 12, boxSizing: "border-box",
                          border: ".5px solid var(--glass-border)",
                          background: "var(--surface)",
                          color: "var(--text)", fontSize: 14,
                          outline: "none", fontFamily: "inherit",
                          boxShadow: "inset 0 .5px 0 var(--surface-border)",
                        }}
                      />
                      {q && (
                        <button onClick={() => setQ("")} style={{
                          position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                          width: 18, height: 18, borderRadius: "50%", border: "none",
                          background: "var(--text-5)", color: "var(--bg-page)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", fontSize: 10, fontWeight: 700, padding: 0,
                        }}>✕</button>
                      )}
                    </div>
                    <button className="press" onClick={() => { setShowSearch(false); setQ("") }} style={{
                      border: "none", background: "none", color: "var(--text-3)",
                      fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "6px 2px",
                      whiteSpace: "nowrap", flexShrink: 0,
                    }}>取消</button>
                  </div>
                ) : (<>
                  <button className="press" onClick={() => { setShowSearch(true); setTimeout(() => searchRef.current?.focus(), 50) }} style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    border: ".5px solid var(--surface-border)",
                    background: "var(--surface)",
                    boxShadow: "inset 0 .5px 0 var(--surface-hi)",
                    color: "var(--text-4)", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
                    </svg>
                  </button>
                  {stgsDay.map(s => (
                    <div key={s} data-stage-active={stg === s ? "1" : "0"}>
                      <Pill
                        label={s === "ALL" ? "全部" : STAGES[s]?.name}
                        active={stg === s}
                        color={s === "ALL" ? null : STAGES[s]?.bg}
                        onClick={() => { if (s !== stg) setStg(s) }}
                      />
                    </div>
                  ))}
                </>)}
              </div>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div style={{
        padding: "12px 16px 0",
        ...(view === "pick" && pickMode === "table"
          ? { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }
          : {}),
      }}>
        {view === "pick" ? (
          pickMode === "table" ? (
            <Timetable day={day} sel={sel} toggle={toggle} dimIds={dimIds} confIds={confIds} activeDay={activeDay} activeMinutes={activeMinutes} />
          ) : q ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 7, minHeight: "60vh", paddingBottom: 60 }}>
              {list.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "100px 20px",
                  color: "var(--text-5)", fontSize: 16, fontWeight: 500,
                }}>找不到符合的藝人</div>
              ) : list.map(item => {
                const st = getStatus(item)
                return <Card
                  key={item.id} item={item}
                  selected={sel.includes(item.id)}
                  dimmed={dimIds.has(item.id)}
                  conflict={confIds.has(item.id)}
                  onToggle={toggle}
                  showBadge
                  status={st} progress={st === "playing" ? getProgress(item) : 0}
                />
              })}
            </div>
          ) : (
            <div ref={swipeCallbackRef} style={{ overflow: "hidden", margin: "0 -16px", padding: "0 16px", touchAction: swiping ? "none" : "pan-y" }}
              onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <div style={{
                display: "flex", width: "300%", marginLeft: "-100%",
                transform: `translateX(${swipeX}px)`,
                transition: (swiping || skipTransition.current) ? 'none' : 'transform .38s cubic-bezier(.25,1,.5,1)',
                willChange: swiping ? 'transform' : 'auto',
              }}>
                {[prevList, list, nextList].map((items, pi) => (
                  <div key={pi} style={{
                    width: "33.333%", flexShrink: 0,
                    padding: "0 16px", boxSizing: "border-box",
                    display: "flex", flexDirection: "column", gap: 7, minHeight: "60vh",
                    opacity: pi === 1 ? 1 : (swiping ? 0.5 : 0),
                    transition: swiping ? 'opacity .1s' : 'opacity .2s',
                  }}>
                    {items == null ? null : items.length === 0 ? (
                      <div style={{
                        textAlign: "center", padding: "100px 20px",
                        color: "var(--text-5)", fontSize: 16, fontWeight: 500,
                      }}>此舞台本日無演出</div>
                    ) : (() => {
                      const out: React.ReactNode[] = []
                      let nowInserted = false
                      items.forEach((item) => {
                        if (!nowInserted && day === activeDay && t2m(item.start) > activeMinutes) {
                          nowInserted = true
                          out.push(<div key="now-line" className="now-line">{!isClamped && <div className="now-line-dot" />}<span className="now-line-label">{isClamped ? "🚢 活動即將開始" : `現在 ${fmtTime(activeNow)}`}</span><div className="now-line-line" /></div>)
                        }
                        const st = getStatus(item)
                        out.push(
                          <Card
                            key={item.id} item={item}
                            selected={sel.includes(item.id)}
                            dimmed={dimIds.has(item.id)}
                            conflict={confIds.has(item.id)}
                            onToggle={toggle}
                            showBadge={stg === "ALL"}
                            status={st} progress={st === "playing" ? getProgress(item) : 0}
                          />
                        )
                      })
                      return out
                    })()}
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          <div>
            {isClamped && (() => {
              const em = T.reduce((min, t) => t.day === 1 && t2m(t.start) < min ? t2m(t.start) : min, 9999)
              const eTime = `${Math.floor(em / 60)}:${String(em % 60).padStart(2, '0')}`
              return (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "10px 14px", margin: "0 0 12px",
                  borderRadius: 14,
                  background: "var(--surface)",
                  border: ".5px solid var(--surface-border)",
                  fontSize: 12, fontWeight: 500, color: "var(--text-4)",
                }}>
                  <span style={{ fontSize: 14 }}>⏳</span>
                  <span>還沒開演啦！<b style={{ color: "var(--text-2)" }}>{DAY_DATES[1].slice(5)} {eTime}</b> 開始後時間軸會自己跑</span>
                </div>
              )
            })()}
            {sel.length === 0 ? (
              <div style={{ padding: "60px 20px" }}>
                <div style={{
                  textAlign: "center",
                  color: "var(--text-5)", fontSize: 16,
                  fontWeight: 500, lineHeight: 2,
                }}>
                  還沒選任何演出<br />切換到「選團」開始挑選
                </div>
                {(() => {
                  const playing = T.filter(t => t.day === activeDay && activeMinutes >= t2m(t.start) && activeMinutes < t2m(t.end))
                    .sort((a, b) => t2m(a.end) - t2m(b.end))
                  if (!playing.length) return null
                  return (
                    <div style={{ marginTop: 28 }}>
                      <div style={{ fontSize: 12, color: "var(--text-5)", fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
                        現在有演出
                      </div>
                      <div className="no-scrollbar" style={{
                        display: "flex", gap: 8, overflowX: "auto",
                        padding: "2px 0 4px",
                      }}>
                        {playing.map(t => <SuggestionCard key={t.id} item={t} selected={sel.includes(t.id)} onToggle={toggle} />)}
                      </div>
                    </div>
                  )
                })()}
              </div>
            ) : (
              [1, 2].map(d => {
                const items = sched[d]; if (!items?.length) return null
                const segments: ({ type: "conflict"; items: Performance[] } | { type: "single"; item: Performance })[] = []
                let i = 0
                while (i < items.length) {
                  if (confIds.has(items[i].id)) {
                    const group = [items[i]]
                    let j = i + 1
                    while (j < items.length) {
                      const overlapsAny = group.some(g => clash(items[j], g))
                      if (overlapsAny) { group.push(items[j]); j++ }
                      else break
                    }
                    if (group.length > 1) {
                      segments.push({ type: "conflict", items: group })
                      i = j
                    } else {
                      segments.push({ type: "single", item: items[i] })
                      i++
                    }
                  } else {
                    segments.push({ type: "single", item: items[i] })
                    i++
                  }
                }
                return (
                  <div key={d} id={"sched-day-" + d} style={{ marginBottom: 24 }}>
                    <div style={{
                      display: "flex", alignItems: "baseline", gap: 8,
                      margin: "20px 0 14px",
                    }}>
                      <h3 style={{
                        fontSize: 18, fontWeight: 800,
                        background: d === 1
                          ? "linear-gradient(135deg,#FF6B6B,#E63946)"
                          : "linear-gradient(135deg,#F4A261,#EF6C00)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      }}>
                        {d === 1 ? "DAY 1" : "DAY 2"}
                      </h3>
                      <span style={{ fontSize: 13, color: "var(--text-4)", fontWeight: 500 }}>
                        {d === 1 ? "3/21 (六)" : "3/22 (日)"}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-5)", fontWeight: 500 }}>
                        {items.length} 組
                      </span>
                    </div>
                    {(() => {
                      const out: React.ReactNode[] = []
                      const nowLine = <div key="now-line" className="now-line">{!isClamped && <div className="now-line-dot" />}<span className="now-line-label">{isClamped ? "🚢 活動即將開始" : `現在 ${fmtTime(activeNow)}`}</span><div className="now-line-line" /></div>
                      let nowInserted = false

                      const nowPlaying = d === activeDay
                        ? T.filter(t => t.day === d && activeMinutes >= t2m(t.start) && activeMinutes < t2m(t.end))
                            .sort((a, b) => t2m(a.end) - t2m(b.end))
                        : []

                      const suggestions = nowPlaying.length > 0
                        ? <div key="suggestions" style={{ margin: "6px 0 10px" }}>
                            <div style={{ fontSize: 12, color: "var(--text-5)", fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
                              現在有演出
                            </div>
                            <div className="no-scrollbar" style={{
                              display: "flex", gap: 8, overflowX: "auto",
                              padding: "2px 0 4px",
                            }}>
                              {nowPlaying.map(t => <SuggestionCard key={t.id} item={t} selected={sel.includes(t.id)} onToggle={toggle} />)}
                            </div>
                          </div>
                        : null

                      const segEnd = (s: typeof segments[0]) => t2m((s.type === "conflict" ? s.items[s.items.length - 1] : s.item).end)
                      const segStart = (s: typeof segments[0]) => t2m(s.type === "conflict" ? s.items[0].start : s.item.start)

                      let suggestionsInserted = false

                      segments.forEach((seg, si) => {
                        const prevEnd = si > 0 ? segEnd(segments[si - 1]) : null
                        const curStart = segStart(seg)
                        const gap = prevEnd !== null ? curStart - prevEnd : null

                        if (!nowInserted && d === activeDay && prevEnd !== null && activeMinutes >= prevEnd && activeMinutes < curStart) {
                          nowInserted = true
                          out.push(nowLine)
                          if (suggestions) { out.push(suggestions); suggestionsInserted = true }
                        }

                        if (seg.type === "conflict") {
                          out.push(
                            <React.Fragment key={"cg-" + si}>
                              {gap !== null && gap > 0 && (
                                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", justifyContent: "center" }}>
                                  <div style={{ flex: 1, height: .5, background: "var(--divider)" }} />
                                  <span style={{ fontSize: 11, color: "var(--text-5)", fontWeight: 500 }}>{gap} 分鐘</span>
                                  <div style={{ flex: 1, height: .5, background: "var(--divider)" }} />
                                </div>
                              )}
                              <ConflictGroup items={seg.items} pref={pref} onPref={togglePref} getStatus={getStatus} getProgress={getProgress} />
                            </React.Fragment>
                          )
                          if (!suggestionsInserted && suggestions && d === activeDay) {
                            const anyPlaying = seg.items.some(it => getStatus(it) === "playing")
                            if (anyPlaying) { out.push(suggestions); suggestionsInserted = true }
                          }
                        } else {
                          const st = getStatus(seg.item)
                          out.push(
                            <TimelineCard key={seg.item.id} item={seg.item} gap={gap}
                              status={st} progress={st === "playing" ? getProgress(seg.item) : 0} />
                          )
                          if (!suggestionsInserted && suggestions && st === "playing") {
                            out.push(suggestions); suggestionsInserted = true
                          }
                        }
                      })
                      if (!nowInserted && d === activeDay && segments.length > 0 && activeMinutes >= segEnd(segments[segments.length - 1])) {
                        out.push(nowLine)
                        if (suggestions && !suggestionsInserted) out.push(suggestions)
                      }
                      if (!nowInserted && d === activeDay && segments.length > 0 && activeMinutes < segStart(segments[0])) {
                        out.unshift(nowLine)
                        if (suggestions && !suggestionsInserted) out.splice(1, 0, suggestions)
                      }
                      return out
                    })()}
                  </div>
                )
              })
            )}
            {sel.length > 0 && (
              <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
                <button className="press" onClick={() => setShowSheet(true)} style={{
                  padding: "13px 32px", borderRadius: 100,
                  border: ".5px solid rgba(255,80,80,.2)",
                  background: "rgba(255,80,80,.08)",
                  color: "#FF6B6B", fontSize: 15, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: `0 2px 12px rgba(255,80,80,.08), inset 0 .5px 0 var(--surface-border)`,
                }}>
                  清除所有選取
                </button>
              </div>
            )}
            {showTimePicker && (
              <TimePicker
                simNow={simNow}
                onSet={d => { setSimNow(d); setNow(d) }}
                onReset={() => { setSimNow(null); setNow(new Date()) }}
                onClose={() => setShowTimePicker(false)}
              />
            )}
            {showSheet && (
              <ConfirmDialog
                title="清除所有選取？"
                message={`已選的 ${sel.length} 組演出將全部移除，此操作無法復原。`}
                confirmLabel="清除"
                onConfirm={() => setSel([])}
                onClose={() => setShowSheet(false)}
              />
            )}
          </div>
        )}
      </div>

      {/* Floating Tab Bar */}
      {view === "sched" && <div className="liquid-glass" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
        borderRadius: "20px 20px 0 0",
        borderBottom: "none",
        boxShadow: "0 -4px 24px rgba(0,0,0,.08), inset 0 .5px 0 var(--glass-hi)",
        padding: `14px 0 calc(14px + var(--safe-bottom))`,
        display: "flex", justifyContent: "center", gap: 20,
        fontSize: 13, fontWeight: 500,
        color: "var(--text-4)",
      }}>
        <span onClick={() => scrollToDay(1)} style={{ cursor: "pointer", padding: "4px 8px", margin: "-4px -8px", borderRadius: 8 }}>
          DAY 1 <span style={{ fontWeight: 700, color: "var(--text-2)" }}>{sched[1]?.length || 0}</span>
        </span>
        <span style={{ color: "var(--dim)" }}>|</span>
        <span onClick={() => scrollToDay(2)} style={{ cursor: "pointer", padding: "4px 8px", margin: "-4px -8px", borderRadius: 8 }}>
          DAY 2 <span style={{ fontWeight: 700, color: "var(--text-2)" }}>{sched[2]?.length || 0}</span>
        </span>
        {nC > 0 && (
          <>
            <span style={{ color: "var(--dim)" }}>|</span>
            <span onClick={scrollToConflict} style={{
              color: "#FF6B6B", fontWeight: 700, cursor: "pointer",
              padding: "4px 8px", margin: "-4px -8px", borderRadius: 8,
              transition: "background .15s",
            }}>
              {nC} 撞場
            </span>
          </>
        )}
        <span style={{ color: "var(--dim)" }}>|</span>
        <span onClick={() => setShowRes(true)} style={{
          cursor: "pointer", padding: "4px 8px", margin: "-4px -8px", borderRadius: 8,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2, marginRight: 3 }}>
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
          </svg>
          總覽
        </span>
      </div>}

      {/* Resource Sheet */}
      {showRes && (() => {
        const dismiss = () => {
          document.querySelector('.res-backdrop')?.classList.add('closing')
          document.querySelector('.res-sheet')?.classList.add('closing')
          setTimeout(() => setShowRes(false), 320)
        }
        let dragY = 0, dragging = false
        const onDragStart = (e: React.TouchEvent) => {
          const sheet = e.currentTarget
          if (sheet.scrollTop <= 0) { dragY = e.touches[0].clientY; dragging = true }
        }
        const onDragMove = (e: React.TouchEvent) => {
          if (!dragging) return
          const sheet = e.currentTarget as HTMLElement
          const dy = e.touches[0].clientY - dragY
          if (dy > 0 && sheet.scrollTop <= 0) {
            sheet.style.transform = `translateY(${dy * 0.6}px)`
            const backdrop = document.querySelector('.res-backdrop') as HTMLElement | null
            if (backdrop) backdrop.style.opacity = String(Math.max(0, 1 - dy / 400))
          }
        }
        const onDragEnd = (e: React.TouchEvent) => {
          if (!dragging) return
          dragging = false
          const dy = e.changedTouches[0].clientY - dragY
          const sheet = e.currentTarget as HTMLElement
          if (dy > 100 && sheet.scrollTop <= 0) {
            dismiss()
          } else {
            sheet.style.transform = ''
            const backdrop = document.querySelector('.res-backdrop') as HTMLElement | null
            if (backdrop) backdrop.style.opacity = ''
          }
        }
        return <>
          <div className="res-backdrop" onClick={dismiss} />
          <div className="res-sheet" onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}>
            <div style={{ padding: "8px 16px calc(16px + var(--safe-bottom))", display: "flex", flexDirection: "column", gap: 14 }}>
              {EVENT.images.map(r => (
                <div key={r.src} style={{
                  borderRadius: 14, overflow: "hidden",
                  border: ".5px solid var(--surface-border)",
                  background: "var(--surface)",
                }}>
                  <img
                    src={r.src} alt={r.label}
                    style={{ width: "100%", display: "block", cursor: "pointer", WebkitTouchCallout: "none" }}
                    onClick={() => setZoomImg(r.src)}
                    onContextMenu={e => e.preventDefault()}
                  />
                  <div style={{ padding: "10px 14px" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{r.label}</span>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 12, color: "var(--text-5)", textAlign: "center", padding: "4px 0" }}>
                已快取，沒網路也能看
              </div>
            </div>
          </div>
        </>
      })()}

      {/* Floating Map Button */}
      <FloatingMapBtn onMapOpen={() => setZoomImg({ src: EVENT.mapSrc, hotspots: true })} />

      {/* Image Viewer */}
      {zoomImg && <ImageViewer
        src={typeof zoomImg === 'string' ? zoomImg : zoomImg.src}
        hotspots={typeof zoomImg === 'object' && zoomImg.hotspots}
        onClose={() => setZoomImg(null)}
      />}

      {showOnboard && <Onboarding onDone={() => { localStorage.setItem("onboard-done", "1"); setShowOnboard(false) }} />}
    </div>
  )
}
