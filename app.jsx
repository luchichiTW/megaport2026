    const { useState, useEffect, useCallback, useMemo, useRef } = React;

    const t2m = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m };
    const clash = (a, b) => a.day === b.day && t2m(a.start) < t2m(b.end) && t2m(b.start) < t2m(a.end);
    const fmtEnd = item => item.tentativeEnd ? `${item.end}(待確定)` : item.end;

    const openDB = () => new Promise((resolve, reject) => {
      const req = indexedDB.open("mp2026", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("s");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    const dbGet = async () => {
      try {
        const db = await openDB();
        return new Promise((resolve) => {
          const req = db.transaction("s", "readonly").objectStore("s").get("v");
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        });
      } catch (err) {
        console.warn("dbGet failed:", err);
        return [];
      }
    };

    const dbSet = async (value) => {
      try {
        const db = await openDB();
        db.transaction("s", "readwrite").objectStore("s").put(value, "v");
      } catch (err) {
        console.warn("dbSet failed:", err);
      }
    };

    const dbGetPref = async () => {
      try {
        const db = await openDB();
        return new Promise((resolve) => {
          const req = db.transaction("s", "readonly").objectStore("s").get("pref");
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        });
      } catch { return []; }
    };

    const dbSetPref = async (value) => {
      try {
        const db = await openDB();
        db.transaction("s", "readwrite").objectStore("s").put(value, "pref");
      } catch { }
    };

    /* ══════════════════════════════════════
       Liquid Glass Design System
       ══════════════════════════════════════ */

    // Theme helpers
    function applyTheme(resolved) {
      document.documentElement.setAttribute('data-theme', resolved);
      const m = document.getElementById('meta-theme');
      if (m) m.content = resolved === 'dark' ? '#000000' : '#f2f2f7';
    }
    function useTheme() {
      const [resolved, setResolved] = useState(() => {
        const saved = localStorage.getItem('theme-pref');
        if (saved === 'light' || saved === 'dark') return saved;
        return matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
      });
      const toggle = useCallback(() => {
        const next = resolved === 'dark' ? 'light' : 'dark';
        setResolved(next);
        localStorage.setItem('theme-pref', next);
        applyTheme(next);
      }, [resolved]);
      return { resolved, toggle };
    }

    // Theme icon component (Apple SF Symbols style)
    function ThemeIcon({ resolved }) {
      if (resolved === 'light') return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="5.5" />
          <path d="M12 1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 12 1.5Zm0 18a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 12 19.5ZM4.22 4.22a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 0 1-1.06 1.06L4.22 5.28a.75.75 0 0 1 0-1.06Zm13.44 13.44a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 1 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06ZM1.5 12a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 1.5 12Zm18 0a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 19.5 12ZM5.28 19.78a.75.75 0 0 1 0-1.06l1.06-1.06a.75.75 0 1 1 1.06 1.06l-1.06 1.06a.75.75 0 0 1-1.06 0ZM17.66 7.34a.75.75 0 0 1 0-1.06l1.06-1.06a.75.75 0 1 1 1.06 1.06l-1.06 1.06a.75.75 0 0 1-1.06 0Z" />
        </svg>
      );
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646Z" />
        </svg>
      );
    }

    // Segmented Control — Apple-style with floating indicator
    function Segment({ items, value, onChange, size = "md" }) {
      const idx = items.findIndex(i => i.value === value);
      const count = items.length;
      const pad = size === "sm" ? 2 : 2;
      const py = size === "sm" ? "7px" : "8px";
      const fs = size === "sm" ? 13 : 13;
      const radius = 9;
      return (
        <div style={{
          position: "relative", display: "flex", padding: pad,
          borderRadius: radius + pad,
          background: "var(--seg-bg)",
          border: "1px solid var(--seg-border)",
        }}>
          {/* sliding indicator */}
          <div style={{
            position: "absolute",
            top: pad, bottom: pad,
            left: `calc(${pad}px + ${idx / count * 100}%)`,
            width: `calc(${100 / count}% - ${pad}px)`,
            borderRadius: radius,
            background: "var(--seg-ind)",
            boxShadow: `var(--seg-ind-shadow), inset 0 1px 0 var(--seg-ind-hi)`,
            transition: "left .3s cubic-bezier(.25,1,.5,1)",
          }} />
          {items.map((item, i) => (
            <button key={item.value} onClick={() => onChange(item.value)} style={{
              flex: 1, position: "relative", zIndex: 1,
              padding: `${py} 0`, border: "none", borderRadius: radius,
              background: "transparent", cursor: "pointer",
              fontSize: fs, fontWeight: 600, fontFamily: "inherit",
              color: value === item.value ? "var(--text)" : "var(--text-3)",
              transition: "color .2s",
              letterSpacing: -.1,
              borderRight: i < count - 1 && idx !== i && idx !== i + 1
                ? "0.5px solid var(--seg-border)" : "0.5px solid transparent",
            }}>
              {item.label}
            </button>
          ))}
        </div>
      );
    }

    // Pill filter chip
    function Pill({ label, active, color, onClick }) {
      return (
        <button className="press" onClick={onClick} style={{
          padding: "7px 16px", borderRadius: 100, border: "none",
          fontSize: 12, fontWeight: 600, cursor: "pointer",
          whiteSpace: "nowrap", flexShrink: 0, fontFamily: "inherit",
          background: active
            ? `linear-gradient(135deg, ${color || "var(--text-4)"}30, ${color || "var(--text-5)"}18)`
            : "var(--surface)",
          color: active ? (color || "var(--text)") : "var(--text-4)",
          boxShadow: active
            ? `0 0 0 .5px ${color || "var(--text-4)"}50, 0 2px 8px ${color || "rgba(0,0,0,.15)"}30, inset 0 .5px 0 var(--glass-hi)`
            : `0 0 0 .5px var(--surface-border)`,
          transition: "all .2s cubic-bezier(.16,1,.3,1)",
        }}>
          {label}
        </button>
      );
    }

    // Stage badge — frosted colored chip
    function Badge({ stage, large, full }) {
      const s = STAGES[stage]; if (!s) return null;
      return (
        <span style={{
          display: "inline-flex", alignItems: "center",
          background: `linear-gradient(135deg, ${s.bg}DD, ${s.bg}99)`,
          color: "var(--badge-text)", padding: large ? "3px 11px" : "2px 8px",
          borderRadius: large ? 8 : 6, fontSize: large ? 11 : 10,
          fontWeight: 700, letterSpacing: .4, whiteSpace: "nowrap",
          flexShrink: 0,
          boxShadow: `0 1px 4px ${s.bg}50, inset 0 .5px 0 rgba(255,255,255,.25)`,
        }}>
          {full && s.fullName ? s.fullName : s.name}
        </span>
      );
    }

    // Artist card — glass card with tinted selection
    function Card({ item, selected, dimmed, conflict, onToggle, showBadge = true, status, progress }) {
      const c = STAGES[item.stage]?.bg || "#888";
      const [tooltip, setTooltip] = useState(null);
      const lp = useLongPress((pos) => setTooltip(pos || { x: 0, y: 200 }));
      const isPlaying = status === "playing";
      const isEnded = status === "ended";
      return (
        <>
          {tooltip && <ArtistTooltip item={item} onClose={() => setTooltip(null)} />}
          <button className="press"
            onClick={e => { if (!lp.prevented.current) onToggle(item.id) }}
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
            {/* left accent bar */}
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
              {item.start}–{fmtEnd(item)}
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

            {/* Progress bar */}
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
      );
    }

    // Schedule timeline card (single, no conflict wrapper)
    // status: "ended" | "playing" | "upcoming" | null
    function useLongPress(cb, ms = 500) {
      const timer = useRef(null);
      const prevented = useRef(false);
      const onStart = useCallback(e => {
        prevented.current = false;
        const t = e.touches?.[0];
        const pos = t ? { x: t.clientX, y: t.clientY } : null;
        timer.current = setTimeout(() => { prevented.current = true; cb(pos) }, ms);
      }, [cb, ms]);
      const onEnd = useCallback(() => { clearTimeout(timer.current) }, []);
      const onMove = useCallback(e => {
        if (timer.current) {
          const t = e.touches?.[0];
          if (t) { clearTimeout(timer.current) }
        }
      }, []);
      return { onTouchStart: onStart, onTouchEnd: onEnd, onTouchMove: onMove, prevented };
    }

    function ArtistTooltip({ item, onClose }) {
      const [closing, setClosing] = useState(false);
      const dur = t2m(item.end) - t2m(item.start);
      const desc = typeof ARTIST_DESC!=="undefined" && ARTIST_DESC[item.artist] || null;
      const dismiss = useCallback(() => { setClosing(true); setTimeout(onClose, 260) }, [onClose]);
      const backdropRef = useRef(null);
      const descRef = useRef(null);

      useEffect(() => {
        const el = backdropRef.current;
        if (!el) return;
        const prevent = e => {
          if (descRef.current && descRef.current.contains(e.target)) return;
          e.preventDefault();
        };
        el.addEventListener("touchmove", prevent, { passive: false });
        document.body.style.overflow = "hidden";
        return () => {
          el.removeEventListener("touchmove", prevent);
          document.body.style.overflow = "";
        };
      }, []);

      return ReactDOM.createPortal(
        <div ref={backdropRef} className="lp-tooltip-backdrop" onClick={dismiss}
          style={closing ? { animation: "lpBackdropOut .22s ease-in forwards" } : {}}>
          <div className="lp-tooltip"
            style={{
              maxHeight: desc ? "70vh" : "auto",
              display: "flex", flexDirection: "column",
              ...(closing ? { animation: "tooltipOut .2s var(--ease-out) forwards" } : {}),
            }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexShrink: 0 }}>
              <Badge stage={item.stage} large />
              <span style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {item.start} – {fmtEnd(item)}
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
          </div>
        </div>,
        document.body
      );
    }

    function SuggestionCard({ item, selected, onToggle }) {
      const sc = STAGES[item.stage]?.bg || "#888";
      const [tooltip, setTooltip] = useState(null);
      const lp = useLongPress(() => setTooltip(true));
      return (
        <>
          {tooltip && <ArtistTooltip item={item} onClose={() => setTooltip(null)} />}
          <div className="press" onClick={e => { if (!lp.prevented.current) onToggle(item.id) }}
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
            {/* left accent bar */}
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
                {item.start}–{fmtEnd(item)}
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
      );
    }

    function TimelineCard({ item, gap, preferred, dimmed, onClick, status, progress }) {
      const c = STAGES[item.stage]?.bg || "#888";
      const dur = t2m(item.end) - t2m(item.start);
      const isClickable = !!onClick;
      const isPlaying = status === "playing";
      const isEnded = status === "ended";
      const [tooltip,setTooltip]=useState(null);
      const lp=useLongPress((pos)=>setTooltip(pos||{x:0,y:200}));
      return (
        <>
          {tooltip&&<ArtistTooltip item={item} onClose={()=>setTooltip(null)}/>}
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
          <div onClick={e=>{if(!lp.prevented.current&&onClick)onClick(e)}}
            onTouchStart={lp.onTouchStart} onTouchEnd={lp.onTouchEnd} onTouchMove={lp.onTouchMove}
            onContextMenu={e=>e.preventDefault()}
            style={{
              WebkitUserSelect:"none",userSelect:"none",WebkitTouchCallout:"none",
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
              <div className="now-playing-glow" style={{ "--glow-color": `${c}50` }} />
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
                  {item.start} – {fmtEnd(item)}
                </span>
                <Badge stage={item.stage} large full />
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
      );
    }

    // Conflict group wrapper — groups overlapping items visually
    function ConflictGroup({ items, pref, onPref, groupRef, getStatus, getProgress, onLottery }) {
      const prefId = items.find(i => pref.has(i.id))?.id || null;
      const collapsed = prefId !== null;
      const otherCount = items.length - 1;
      const latestEnd = Math.max(...items.map(i => t2m(i.end)));
      const day = items[0]?.day;
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
              <span style={{ fontSize: 11, color: "rgba(255,80,80,.5)", fontWeight: 500, flex: 1 }}>
                — 點選想去的演出
              </span>
              {onLottery && <button onClick={e => { e.stopPropagation(); onLottery(items); }} className="press" style={{
                background: "linear-gradient(135deg, rgba(255,107,107,0.12), rgba(255,107,107,0.06))",
                border: ".5px solid rgba(255,107,107,0.25)",
                borderRadius: 8, padding: "4px 10px",
                fontSize: 12, fontWeight: 700, color: "#FF6B6B",
                cursor: "pointer", fontFamily: "inherit",
                whiteSpace: "nowrap", transition: "all .15s",
                backdropFilter: "blur(12px) saturate(150%)",
                WebkitBackdropFilter: "blur(12px) saturate(150%)",
                boxShadow: "inset 0 .5px 0 rgba(255,255,255,.1)",
              }}>🎲 抽</button>}
            </div>
          </div>
          {items.map(item => {
            const isPref = prefId === item.id;
            const isOther = collapsed && !isPref;
            const st = getStatus?.(item);
            const c = STAGES[item.stage]?.bg || "#888";
            if (isPref && collapsed) {
              const layers = Math.min(otherCount, 2);
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
                    status={st} progress={st === "playing" ? getProgress?.(item) : 0}
                  />
                </div>
              );
            }
            return (
              <div key={item.id} className={`conflict-item-wrap${isOther ? " hidden" : ""}`}>
                <TimelineCard
                  item={item} gap={null}
                  preferred={false}
                  dimmed={false}
                  onClick={() => onPref(item.id, items.map(i => i.id))}
                  status={st} progress={st === "playing" ? getProgress?.(item) : 0}
                />
              </div>
            );
          })}
        </div>
      );
    }

    // Slot machine animation for lottery
    function SlotMachine({ items, winner, spinning, onDone }) {
      const [pos, setPos] = useState(0);
      const doneRef = useRef(false);
      const ITEM_H = 72;
      const count = items.length;

      useEffect(() => {
        if (!spinning) { setPos(0); doneRef.current = false; return; }
        const winIdx = items.findIndex(i => i.id === winner.id);
        const totalSlots = (3 + Math.floor(Math.random() * 2)) * count + winIdx;
        const duration = 2800;
        const startT = performance.now();
        let raf;
        const tick = (t) => {
          const p = Math.min((t - startT) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3); // ease-out cubic
          setPos(ease * totalSlots);
          if (p < 1) raf = requestAnimationFrame(tick);
          else {
            setPos(totalSlots);
            if (!doneRef.current) { doneRef.current = true; onDone(); }
          }
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
      }, [spinning]);

      return (
        <div style={{
          height: ITEM_H, overflow: "hidden", position: "relative",
          borderRadius: 14,
          background: "linear-gradient(135deg, var(--glass-start), var(--glass-mid), var(--glass-end))",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: ".5px solid var(--glass-border)",
          boxShadow: "var(--glass-shadow), inset 0 .5px 0 var(--glass-hi)",
        }}>
          <div style={{ transform: `translateY(${-(pos % count) * ITEM_H}px)` }}>
            {Array.from({ length: count * 8 }, (_, idx) => {
              const item = items[idx % count];
              const stg = STAGES[item.stage];
              return (
                <div key={idx} style={{
                  height: ITEM_H, display: "flex", alignItems: "center",
                  padding: "0 16px", gap: 12,
                }}>
                  <span style={{
                    background: stg?.bg || "#888", color: "var(--badge-text)",
                    fontSize: 11, fontWeight: 700, padding: "3px 8px",
                    borderRadius: 6, whiteSpace: "nowrap", letterSpacing: .5,
                  }}>{stg?.name || item.stage}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontWeight: 700, fontSize: 16, color: "var(--text)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{item.artist}</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
                      {item.start}–{fmtEnd(item)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Lottery bottom sheet
    function LotterySheet({ items, onAccept, onClose }) {
      const [closing, setClosing] = useState(false);
      const [spinning, setSpinning] = useState(false);
      const [winner, setWinner] = useState(null);
      const [revealed, setRevealed] = useState(false);
      const [scolded, setScolded] = useState(false);

      useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
      }, []);

      const dismiss = useCallback(() => {
        if (closing) return;
        setClosing(true);
        setTimeout(onClose, 320);
      }, [onClose, closing]);

      // Drag-to-dismiss
      const dragRef = useRef({ y: 0, dragging: false });
      const onDragStart = e => {
        const sheet = e.currentTarget;
        if (sheet.scrollTop <= 0) { dragRef.current = { y: e.touches[0].clientY, dragging: true }; }
      };
      const onDragMove = e => {
        if (!dragRef.current.dragging) return;
        const sheet = e.currentTarget;
        const dy = e.touches[0].clientY - dragRef.current.y;
        if (dy > 0 && sheet.scrollTop <= 0) {
          sheet.style.transform = `translateY(${dy * 0.6}px)`;
          const backdrop = document.querySelector('.lottery-backdrop');
          if (backdrop) backdrop.style.opacity = Math.max(0, 1 - dy / 400);
        }
      };
      const onDragEnd = e => {
        if (!dragRef.current.dragging) return;
        dragRef.current.dragging = false;
        const dy = e.changedTouches[0].clientY - dragRef.current.y;
        const sheet = e.currentTarget;
        if (dy > 100 && sheet.scrollTop <= 0) {
          dismiss();
        } else {
          sheet.style.transform = "";
          const backdrop = document.querySelector('.lottery-backdrop');
          if (backdrop) backdrop.style.opacity = "";
        }
      };

      const QIAOHU = "好朋友集合！巧虎的港邊大冒險";
      const spin = () => {
        const qiaohu = items.find(i => i.artist === QIAOHU);
        const pick = qiaohu || items[Math.floor(Math.random() * items.length)];
        setWinner(pick);
        setSpinning(true);
        setRevealed(false);
      };

      const onSpinDone = () => {
        setSpinning(false);
        setRevealed(true);
      };

      const retry = () => {
        setWinner(null);
        setRevealed(false);
        setScolded(false);
      };

      const accept = () => {
        if (winner) onAccept(winner.id);
      };

      return (
        <>
          <div className={`lottery-backdrop${closing ? " closing" : ""}`} onClick={dismiss} />
          <div className={`lottery-sheet${closing ? " closing" : ""}`}
            onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}>
            <div className="res-handle" />
            <div style={{ padding: "16px 20px calc(20px + var(--safe-bottom))" }}>
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>🎲</div>
                <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0, color: "var(--text)" }}>撞團抽籤</h2>
                <p style={{ fontSize: 13, color: "var(--text-3)", margin: "6px 0 0" }}>
                  {items.length} 組演出撞場，交給命運決定！
                </p>
              </div>

              {/* Item list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                {items.map(item => {
                  const stg = STAGES[item.stage];
                  const isWinner = revealed && winner?.id === item.id;
                  const isLoser = revealed && winner?.id !== item.id;
                  return (
                    <div key={item.id} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 14px", borderRadius: 12,
                      border: isWinner ? `1.5px solid ${stg?.bg || "#888"}` : ".5px solid var(--glass-border)",
                      background: isWinner
                        ? `linear-gradient(135deg, ${stg?.bg || "#888"}18, var(--glass-mid), ${stg?.bg || "#888"}0C)`
                        : "linear-gradient(135deg, var(--glass-start), var(--glass-mid), var(--glass-end))",
                      backdropFilter: "blur(20px) saturate(180%)",
                      WebkitBackdropFilter: "blur(20px) saturate(180%)",
                      boxShadow: isWinner
                        ? `0 4px 16px ${stg?.bg || "#888"}20, inset 0 .5px 0 var(--glass-hi)`
                        : "var(--glass-shadow), inset 0 .5px 0 var(--glass-hi)",
                      opacity: isLoser ? .4 : 1,
                      transition: "all .4s var(--ease-out)",
                      transform: isWinner ? "scale(1.02)" : "scale(1)",
                    }}>
                      {isWinner && <span style={{ fontSize: 20 }}>{winner?.artist === QIAOHU ? "🐯" : "🎉"}</span>}
                      <span style={{
                        background: stg?.bg || "#888", color: "var(--badge-text)",
                        fontSize: 10, fontWeight: 700, padding: "2px 7px",
                        borderRadius: 5, whiteSpace: "nowrap",
                      }}>{stg?.name || item.stage}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 700, fontSize: 15, color: "var(--text)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{item.artist}</div>
                        <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 1 }}>
                          {item.start}–{fmtEnd(item)}
                        </div>
                      </div>
                      {isLoser && <span style={{ fontSize: 11, color: "var(--text-4)" }}>下次吧</span>}
                    </div>
                  );
                })}
              </div>

              {/* Slot machine */}
              {spinning && winner && (
                <div style={{ marginBottom: 20 }}>
                  <SlotMachine items={items} winner={winner} spinning={spinning} onDone={onSpinDone} />
                </div>
              )}

              {/* Tiger burst */}
              {revealed && winner?.artist === QIAOHU && (
                <div style={{ position: "relative", height: 0, display: "flex", justifyContent: "center" }}>
                  {Array.from({ length: 12 }, (_, i) => {
                    const angle = (i / 12) * 360;
                    const rad = angle * Math.PI / 180;
                    const tx = Math.cos(rad) * 20;
                    const ty = Math.sin(rad) * 20;
                    const rot = (Math.random() - .5) * 360;
                    return (
                      <span key={i} style={{
                        position: "absolute", fontSize: 24 + Math.random() * 12,
                        "--tx": `${tx}px`, "--ty": `${ty}px`, "--rot": `${rot}deg`,
                        animation: `tigerBurst ${.8 + Math.random() * .4}s var(--ease-out) forwards`,
                        animationDelay: `${i * 30}ms`,
                        pointerEvents: "none",
                      }}>🐯</span>
                    );
                  })}
                </div>
              )}

              {/* Result text */}
              {revealed && winner && (
                <div className="lottery-result" style={{ textAlign: "center", padding: "12px 0 16px" }}>
                  <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 4 }}>{winner.artist === QIAOHU ? "小朋友就是要看" : "就決定是你了！"}</div>
                  <div style={{
                    fontSize: 20, fontWeight: 900,
                    background: `linear-gradient(135deg, ${STAGES[winner.stage]?.bg || "#888"}, var(--text))`,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>{winner.artist}</div>
                  <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 4 }}>
                    {STAGES[winner.stage]?.name} · {winner.start}–{fmtEnd(winner)}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                {!spinning && !revealed && (
                  <button onClick={spin} className="lottery-btn-primary">🎲 抽！</button>
                )}
                {revealed && winner?.artist === QIAOHU && !scolded && (
                  <>
                    <button onClick={() => setScolded(true)} className="lottery-btn-secondary">再抽一次</button>
                    <button onClick={accept} className="lottery-btn-primary">接受結果 ✓</button>
                  </>
                )}
                {revealed && winner?.artist === QIAOHU && scolded && (
                  <button onClick={accept} className="lottery-btn-primary">接受結果 ✓</button>
                )}
                {revealed && winner?.artist !== QIAOHU && (
                  <>
                    <button onClick={retry} className="lottery-btn-secondary">再抽一次</button>
                    <button onClick={accept} className="lottery-btn-primary">接受結果 ✓</button>
                  </>
                )}
              </div>

              {/* Scold overlay */}
              {scolded && (
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  pointerEvents: "none", overflow: "hidden",
                  zIndex: 10, borderRadius: "inherit",
                }}>
                  <div style={{
                    fontSize: 42, fontWeight: 900,
                    color: "#F5A623",
                    textShadow: "0 2px 20px rgba(245,166,35,.5), 0 0 60px rgba(245,166,35,.3)",
                    transform: "rotate(-18deg)",
                    whiteSpace: "nowrap",
                    animation: "scolded .5s var(--spring) both",
                    letterSpacing: 4,
                  }}>
                    小朋友就是要看巧虎！
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      );
    }

    // Festival date mapping: day 1 = 3/21, day 2 = 3/22
    const DAY_DATES = { 1: "2026-03-21", 2: "2026-03-22" };
    // Earliest event start as a Date (day 1, earliest start minus 30 min)
    const FESTIVAL_EARLIEST = (() => {
      const earliest = T.reduce((min, t) => {
        const m = t2m(t.start);
        return (!min || (t.day < min.day) || (t.day === min.day && m < min.m)) ? { day: t.day, m, start: t.start } : min;
      }, null);
      const [y, mo, d] = DAY_DATES[earliest.day].split('-').map(Number);
      const dt = new Date(y, mo - 1, d, Math.floor((earliest.m - 30) / 60), (earliest.m - 30) % 60);
      return dt;
    })();
    const getDayFromDate = (d) => {
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (ds === DAY_DATES[1]) return 1;
      if (ds === DAY_DATES[2]) return 2;
      return null;
    };
    const fmtTime = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

    // Floating draggable map button
    function FloatingMapBtn({ onMapOpen }) {
      const btnRef = useRef(null);
      const drag = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0, moved: false });
      const pos = useRef({ x: -1, y: -1 });

      useEffect(() => {
        const el = btnRef.current;
        if (!el) return;
        if (pos.current.x < 0) {
          pos.current.x = window.innerWidth - 60;
          pos.current.y = window.innerHeight - 180;
          el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
        }
        const onStart = e => {
          const t = e.touches[0];
          drag.current = { dragging: true, startX: t.clientX, startY: t.clientY, origX: pos.current.x, origY: pos.current.y, moved: false };
        };
        const onMove = e => {
          const d = drag.current;
          if (!d.dragging) return;
          const t = e.touches[0];
          const dx = t.clientX - d.startX, dy = t.clientY - d.startY;
          if (!d.moved && Math.abs(dx) + Math.abs(dy) > 5) d.moved = true;
          if (d.moved) {
            e.preventDefault();
            const nx = Math.max(0, Math.min(window.innerWidth - 44, d.origX + dx));
            const ny = Math.max(0, Math.min(window.innerHeight - 44, d.origY + dy));
            pos.current = { x: nx, y: ny };
            el.style.transform = `translate(${nx}px, ${ny}px)`;
          }
        };
        const onEnd = () => {
          drag.current.dragging = false;
          const mid = window.innerWidth / 2;
          const nx = pos.current.x < mid ? 12 : window.innerWidth - 56;
          pos.current.x = nx;
          el.style.transition = "transform .3s cubic-bezier(.16,1,.3,1)";
          el.style.transform = `translate(${nx}px, ${pos.current.y}px)`;
          setTimeout(() => { el.style.transition = "none" }, 300);
        };
        el.addEventListener("touchstart", onStart, { passive: true });
        el.addEventListener("touchmove", onMove, { passive: false });
        el.addEventListener("touchend", onEnd, { passive: true });
        return () => {
          el.removeEventListener("touchstart", onStart);
          el.removeEventListener("touchmove", onMove);
          el.removeEventListener("touchend", onEnd);
        };
      }, []);

      return (
        <div ref={btnRef} style={{
          position: "fixed", top: 0, left: 0, zIndex: 150,
          touchAction: "none",
          WebkitUserSelect: "none", userSelect: "none",
        }}>
          <div onClick={() => { if (!drag.current.moved) onMapOpen(); }}
            style={{
              width: 44, height: 44, borderRadius: 22,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg, var(--glass-start), var(--glass-mid), var(--glass-end))",
              border: ".5px solid var(--glass-border)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              boxShadow: "var(--glass-shadow), inset 0 .5px 0 var(--glass-hi)",
              cursor: "pointer",
            }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
        </div>
      );
    }

    // Image Viewer — fullscreen pinch-to-zoom
    const MAP_SRC = "./img/megaport_festival_2026_map.jpg";
    const navUrl = (k) => {
      const loc = STAGE_LOCS[k];
      if (!loc) return null;
      return /iPad|iPhone|iPod/.test(navigator.userAgent)
        ? `maps://maps.apple.com/?daddr=${loc.lat},${loc.lng}&dirflg=w`
        : `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}&travelmode=walking`;
    };

    function ImageViewer({ src, hotspots, onClose }) {
      const [closing, setClosing] = useState(false);
      const [stagePopup, setStagePopup] = useState(null);
      const imgRef = useRef(null);
      const overlayRef = useRef(null);
      const backdropRef = useRef(null);

      const dismiss = useCallback(() => {
        if (closing) return;
        setClosing(true);
        setTimeout(onClose, 320);
      }, [onClose, closing]);

      // Sync overlay with img bounding rect via rAF
      useEffect(() => {
        if (!hotspots) return;
        const img = imgRef.current;
        const o = overlayRef.current;
        if (!img || !o) return;
        let raf;
        const sync = () => {
          const r = img.getBoundingClientRect();
          o.style.left = r.left + "px";
          o.style.top = r.top + "px";
          o.style.width = r.width + "px";
          o.style.height = r.height + "px";
          raf = requestAnimationFrame(sync);
        };
        raf = requestAnimationFrame(sync);
        return () => cancelAnimationFrame(raf);
      }, [hotspots]);

      useEffect(() => {
        const img = imgRef.current;
        if (!img) return;

        let scale = 1, tx = 0, ty = 0;
        let startScale, startTx, startTy;
        let startDist, startMidX, startMidY;
        let panX, panY;
        let fingers = 0, hasMoved = false;
        let lastTapTime = 0, singleTapTimer = 0;
        let isDraggingToDismiss = false, dragStartY = 0, lastMoveY = 0, lastMoveTime = 0;
        const backdrop = backdropRef.current;
        const dismissRef = () => {
          document.querySelector('.img-viewer-backdrop')?.classList.add('closing');
          document.querySelector('.img-viewer-wrap')?.classList.add('closing');
          setTimeout(onClose, 320);
        };

        const setTransform = (animate) => {
          img.style.transition = animate ? 'transform .3s cubic-bezier(.16,1,.3,1)' : 'none';
          img.style.transform = `translate(-50%,-50%) translate(${tx}px,${ty}px) scale(${scale})`;
        };

        const dist = (a, b) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);

        const handleStart = e => {
          e.preventDefault();
          hasMoved = false;
          img.style.transition = 'none';

          if (e.touches.length === 2) {
            fingers = 2;
            startDist = dist(e.touches[0], e.touches[1]);
            startMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            startMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            startScale = scale;
            startTx = tx;
            startTy = ty;
          } else if (e.touches.length === 1) {
            fingers = 1;
            panX = e.touches[0].clientX;
            panY = e.touches[0].clientY;
            startTx = tx;
            startTy = ty;
          }
        };

        const handleMove = e => {
          e.preventDefault();
          hasMoved = true;

          if (e.touches.length === 2 && fingers >= 2) {
            isDraggingToDismiss = false;
            const d = dist(e.touches[0], e.touches[1]);
            const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            const newScale = Math.max(0.5, Math.min(10, startScale * (d / startDist)));
            const W2 = window.innerWidth / 2, H2 = window.innerHeight / 2;
            tx = mx - W2 - (startMidX - W2 - startTx) * (newScale / startScale);
            ty = my - H2 - (startMidY - H2 - startTy) * (newScale / startScale);
            scale = newScale;
            setTransform(false);
          } else if (e.touches.length === 1) {
            const dy = e.touches[0].clientY - panY;
            const dx = e.touches[0].clientX - panX;

            // At scale ~1: vertical-dominant drag → dismiss gesture
            if (scale <= 1.05 && fingers === 1 && !isDraggingToDismiss && Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx) * 1.2) {
              isDraggingToDismiss = true;
              dragStartY = panY;
            }

            if (isDraggingToDismiss) {
              const dragDy = e.touches[0].clientY - dragStartY;
              const progress = Math.min(Math.abs(dragDy) / 300, 1);
              const dragScale = 1 - progress * 0.3;
              img.style.transition = 'none';
              img.style.transform = `translate(-50%,-50%) translateY(${dragDy}px) scale(${dragScale})`;
              if (backdrop) backdrop.style.opacity = 1 - progress * 0.4;
              lastMoveY = e.touches[0].clientY;
              lastMoveTime = Date.now();
            } else {
              tx = startTx + dx;
              ty = startTy + dy;
              setTransform(false);
            }
          }
        };

        const handleEnd = e => {
          e.preventDefault();

          if (e.touches.length === 1) {
            fingers = 1;
            panX = e.touches[0].clientX;
            panY = e.touches[0].clientY;
            startTx = tx;
            startTy = ty;
            return;
          }

          if (e.touches.length > 0) return;
          fingers = 0;

          if (isDraggingToDismiss) {
            isDraggingToDismiss = false;
            const finalDy = e.changedTouches[0].clientY - dragStartY;
            const velocity = Math.abs(lastMoveY - dragStartY) / Math.max(1, Date.now() - lastMoveTime + 100);
            if (Math.abs(finalDy) > 100 || velocity > 0.5) {
              img.style.transition = 'none';
              img.style.transform = 'translate(-50%,-50%)';
              img.style.opacity = '';
              if (backdrop) { backdrop.style.transition = 'none'; backdrop.style.opacity = ''; }
              scale = 1; tx = 0; ty = 0;
              requestAnimationFrame(() => dismissRef());
            } else {
              img.style.transition = 'transform .4s cubic-bezier(.32,.72,.35,1)';
              img.style.transform = 'translate(-50%,-50%) scale(1)';
              if (backdrop) { backdrop.style.transition = 'opacity .4s cubic-bezier(.32,.72,.35,1)'; backdrop.style.opacity = '1'; }
              scale = 1; tx = 0; ty = 0;
            }
            return;
          }

          if (scale < 1) {
            scale = 1; tx = 0; ty = 0;
            setTransform(true);
          }

          if (!hasMoved) {
            const now = Date.now();
            if (now - lastTapTime < 300) {
              clearTimeout(singleTapTimer);
              if (scale > 1.2) { scale = 1; tx = 0; ty = 0; }
              else { scale = 3; }
              setTransform(true);
              lastTapTime = 0;
            } else {
              lastTapTime = now;
              const tapX = e.changedTouches[0].clientX;
              const tapY = e.changedTouches[0].clientY;
              singleTapTimer = setTimeout(() => {
                const rect = img.getBoundingClientRect();
                if (hotspots && tapX >= rect.left && tapX <= rect.right && tapY >= rect.top && tapY <= rect.bottom) {
                  const px = (tapX - rect.left) / rect.width * 100;
                  const py = (tapY - rect.top) / rect.height * 100;
                  for (const [k, r] of Object.entries(STAGE_REGIONS)) {
                    if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) {
                      const s = STAGES[k];
                      const url = navUrl(k);
                      if (s && url) {
                        setStagePopup({ name: s.name, bg: s.bg, url, loc: STAGE_LOCS[k] });
                      }
                      return;
                    }
                  }
                }
                if (scale <= 1.05) {
                  if (tapX < rect.left || tapX > rect.right || tapY < rect.top || tapY > rect.bottom) {
                    dismissRef();
                  }
                }
              }, 300);
            }
          }
        };

        const el = img.parentElement;
        el.addEventListener('touchstart', handleStart, { passive: false });
        el.addEventListener('touchmove', handleMove, { passive: false });
        el.addEventListener('touchend', handleEnd, { passive: false });

        const block = e => e.preventDefault();
        document.addEventListener('gesturestart', block, { passive: false });
        document.addEventListener('gesturechange', block, { passive: false });
        document.addEventListener('gestureend', block, { passive: false });

        return () => {
          clearTimeout(singleTapTimer);
          el.removeEventListener('touchstart', handleStart);
          el.removeEventListener('touchmove', handleMove);
          el.removeEventListener('touchend', handleEnd);
          document.removeEventListener('gesturestart', block);
          document.removeEventListener('gesturechange', block);
          document.removeEventListener('gestureend', block);
        };
      }, []);

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
              const s = STAGES[k];
              if (!s) return null;
              return (
                <div key={k} style={{
                  position: "absolute",
                  left: `${r.x}%`, top: `${r.y}%`,
                  width: `${r.w}%`, height: `${r.h}%`,
                  borderRadius: 6,
                  border: `2px solid transparent`,
                  background: `transparent`,
                }} />
              );
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
                <button onClick={() => { window.open(stagePopup.url, "_blank", "noopener,noreferrer"); setStagePopup(null); }} style={{
                  flex: 1, height: 44, borderRadius: 12, border: "none",
                  background: stagePopup.bg, color: "#fff",
                  fontSize: 15, fontWeight: 600, cursor: "pointer",
                  boxShadow: `0 2px 12px ${stagePopup.bg}40`,
                }}>導航前往</button>
              </div>
            </div>
          </div>
        )}
      </>;
    }

    // Time Picker — liquid glass bottom sheet
    function TimePicker({ simNow, onSet, onReset, onClose }) {
      const [closing, setClosing] = useState(false);
      const current = simNow || new Date();
      const curDay = getDayFromDate(current) || 1;
      const curH = current.getHours();
      const curM = current.getMinutes();

      const dismiss = useCallback(() => {
        setClosing(true);
        setTimeout(onClose, 280);
      }, [onClose]);

      const setTime = (day, h, m) => {
        const [y, mo, d] = DAY_DATES[day].split('-').map(Number);
        onSet(new Date(y, mo - 1, d, h, m, 0));
      };

      const adjust = (dH, dM) => {
        let h = curH + dH;
        let m = curM + dM;
        if (m >= 60) { m -= 60; h++; }
        if (m < 0) { m += 60; h--; }
        h = Math.max(0, Math.min(23, h));
        setTime(curDay, h, m);
      };

      const presets = [
        { label: "DAY 1 開場", day: 1, h: 12, m: 40 },
        { label: "DAY 1 下午", day: 1, h: 15, m: 0 },
        { label: "DAY 1 晚上", day: 1, h: 19, m: 0 },
        { label: "DAY 2 開場", day: 2, h: 12, m: 40 },
        { label: "DAY 2 下午", day: 2, h: 15, m: 0 },
        { label: "DAY 2 晚上", day: 2, h: 19, m: 0 },
      ];

      return ReactDOM.createPortal(
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
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>模擬時間</span>
                <button onClick={dismiss} style={{
                  background: "var(--dim)", border: "none", borderRadius: 50,
                  width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "var(--text-3)", fontSize: 18, fontFamily: "inherit",
                }}>×</button>
              </div>

              {/* Current display */}
              <div style={{
                textAlign: "center", padding: "16px 0 20px",
                fontSize: 40, fontWeight: 800, fontVariantNumeric: "tabular-nums",
                color: "var(--text)", letterSpacing: 2,
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-4)", display: "block", marginBottom: 4 }}>
                  {curDay === 1 ? "DAY 1 · 3/21 (六)" : "DAY 2 · 3/22 (日)"}
                </span>
                {String(curH).padStart(2, '0')}:{String(curM).padStart(2, '0')}
              </div>

              {/* Manual adjuster */}
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

              {/* Presets */}
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

              {/* Reset */}
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
      );
    }

    // Liquid glass confirm dialog
    function ConfirmDialog({ title, message, confirmLabel, onConfirm, onClose }) {
      const [closing, setClosing] = useState(false);
      const dismiss = useCallback(() => {
        setClosing(true);
        setTimeout(onClose, 220);
      }, [onClose]);
      const handleConfirm = useCallback(() => {
        setClosing(true);
        setTimeout(() => { onClose(); onConfirm(); }, 220);
      }, [onClose, onConfirm]);
      return ReactDOM.createPortal(
        <div className="confirm-backdrop"
          style={closing ? { animation: "fadeOut .22s ease-out forwards" } : {}}
          onClick={dismiss}
        >
          <div className="confirm-dialog"
            style={closing ? { animation: "dialogOut .22s var(--ease-out) forwards" } : {}}
            onClick={e => e.stopPropagation()}
          >
            <div className="confirm-body">
              <div className="confirm-title">{title}</div>
              {message && <div className="confirm-msg">{message}</div>}
            </div>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={dismiss}>取消</button>
              <button className="confirm-destructive" onClick={handleConfirm}>{confirmLabel}</button>
            </div>
          </div>
        </div>,
        document.body
      );
    }

    /* ══════════ Onboarding ══════════ */

    const ONBOARD_STEPS = [
      { icon: "🚢", title: "歡迎來到大港開唱", desc: "你的專屬音樂祭行程助手。點一下演出即可加入行程，左右滑動切換舞台，長按可查看藝人介紹。" },
      { icon: "🗺️", title: "行程、時刻表與地圖", desc: "切換「我的行程」查看已選演出與撞場標示，DAY 旁方格圖示可切換時刻表。右下角地圖按鈕可開啟場地地圖，點擊舞台位置即可導航前往。" },
      { icon: "📲", title: "先加主畫面再排團！", desc: "記得先點「分享 → 加入主畫面」再開始排行程，不然在瀏覽器排好的團序進到主畫面還要再排一次喔！完全離線運作、不蒐集任何資料。", links: [{ url: "https://www.instagram.com/megaportfest/", label: "官方 Instagram" }, { url: "https://github.com/luchichiTW/megaport2026", label: "GitHub 原始碼" }] },
    ];

    function Onboarding({ onDone }) {
      const [step, setStep] = useState(0);
      const [closing, setClosing] = useState(false);
      const [stepKey, setStepKey] = useState(0);
      const isLast = step === ONBOARD_STEPS.length - 1;
      const s = ONBOARD_STEPS[step];
      const next = () => {
        if (isLast) { setClosing(true); setTimeout(onDone, 280); return }
        setStep(p => p + 1); setStepKey(k => k + 1);
      };
      const prev = () => { if (step > 0) { setStep(p => p - 1); setStepKey(k => k + 1) } };
      const skip = () => { setClosing(true); setTimeout(onDone, 280) };
      return ReactDOM.createPortal(
        <div className="onboard-backdrop"
          style={closing ? { animation: "fadeOut .25s ease-out forwards" } : {}}>
          <div className="onboard-card"
            style={closing ? { animation: "dialogOut .25s var(--ease-out) forwards" } : {}}>
            <div key={stepKey} className="onboard-body onboard-step-enter">
              <div className="onboard-icon">{s.icon}</div>
              <div className="onboard-title">{s.title}</div>
              <div className="onboard-desc">{s.desc}</div>
              {s.links && <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
                {s.links.map(l => <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" style={{
                  fontSize: 13, fontWeight: 600, color: "var(--text-2)", textDecoration: "none",
                  padding: "8px 16px", borderRadius: 10,
                  background: "var(--surface)", border: ".5px solid var(--surface-border)",
                  boxShadow: "inset 0 .5px 0 var(--surface-hi)",
                }}>{l.label}</a>)}
              </div>}
            </div>
            <div className="onboard-dots">
              {ONBOARD_STEPS.map((_, i) => (
                <div key={i} className={"onboard-dot" + (i === step ? " active" : "")} />
              ))}
            </div>
            <div className="onboard-actions">
              {step > 0 ? (
                <button className="onboard-btn onboard-btn-secondary" onClick={prev}>上一步</button>
              ) : (
                <button className="onboard-btn onboard-btn-secondary" onClick={skip}>跳過</button>
              )}
              <button className="onboard-btn onboard-btn-primary" onClick={next}>
                {isLast ? "開始使用" : "下一步"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      );
    }

    /* ══════════ Timetable ══════════ */

    function TtBlock({ item, stg, selected, dimmed, conflict, top, height, toggle }) {
      const [tooltip, setTooltip] = useState(null);
      const lp = useLongPress((pos) => setTooltip(pos || { x: 0, y: 200 }));
      return (
        <>
          {tooltip && <ArtistTooltip item={item} onClose={() => setTooltip(null)} />}
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
      );
    }

    function Timetable({ day, sel, toggle, dimIds, confIds, activeDay, activeMinutes }) {
      const PX_PER_MIN = 2;
      const HEADER_H = 32;
      const dayItems = useMemo(() => T.filter(t => t.day === day), [day]);
      const stages = useMemo(() => Object.keys(STAGES).filter(k => dayItems.some(t => t.stage === k)), [dayItems]);

      const minTime = useMemo(() => {
        const m = Math.min(...dayItems.map(t => t2m(t.start)));
        return Math.floor(m / 60) * 60;
      }, [dayItems]);
      const maxTime = useMemo(() => {
        const m = Math.max(...dayItems.map(t => t2m(t.end)));
        return Math.ceil(m / 60) * 60;
      }, [dayItems]);

      const totalH = (maxTime - minTime) * PX_PER_MIN;
      const toY = (timeStr) => (t2m(timeStr) - minTime) * PX_PER_MIN + HEADER_H;
      const toH = (start, end) => (t2m(end) - t2m(start)) * PX_PER_MIN;

      const lines = useMemo(() => {
        const out = [];
        for (let m = minTime; m <= maxTime; m += 30) {
          out.push({ m, isHour: m % 60 === 0 });
        }
        return out;
      }, [minTime, maxTime]);

      return (
        <div className="tt-wrap" style={{ flex: 1, minHeight: 0 }}>
          <div className="tt-time-col" style={{ height: totalH + HEADER_H }}>
            {lines.map(l => (
              <div key={l.m} className="tt-time-label" style={{ top: (l.m - minTime) * PX_PER_MIN + HEADER_H }}>
                {l.isHour ? `${Math.floor(l.m/60)}:00` : `${Math.floor(l.m/60)}:30`}
              </div>
            ))}
          </div>
          <div className="tt-stages" style={{ position: "relative", height: totalH + HEADER_H }}>
            {stages.map(stg => {
              const items = dayItems.filter(t => t.stage === stg);
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
              );
            })}
            {/* Now line */}
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
      );
    }

    /* ══════════ Share Components ══════════ */

    function ShareSheet({ sel, onClose }) {
      const [step, setStep] = useState("init"); // init, loading, ready, error
      const [name, setName] = useState("");
      const [passphrase, setPassphrase] = useState("");
      const [usePassphrase, setUsePassphrase] = useState(false);
      const [shareURL, setShareURL] = useState("");
      const [qrSVG, setQrSVG] = useState("");
      const [copied, setCopied] = useState(false);
      const [identity, setIdentity] = useState(null);
      const [error, setError] = useState("");
      const [closing, setClosing] = useState(false);
      const inputRef = useRef(null);

      useEffect(() => {
        ShareIdentity.get().then(id => {
          if (id) { setName(id.name); setIdentity(id); setStep("hasId"); }
        });
      }, []);

      const dismiss = useCallback(() => {
        setClosing(true);
        setTimeout(onClose, 320);
      }, [onClose]);

      const generate = useCallback(async () => {
        if (!name.trim()) return;
        setStep("loading");
        try {
          const id = await ShareIdentity.getOrCreate(name.trim());
          setIdentity(id);
          const privKey = await ShareIdentity.getPrivateKey(id);
          const pubKey = await ShareIdentity.getPublicKey(id);
          const url = await ShareCodec.encodeShareURL(
            sel, name.trim(), privKey, pubKey,
            usePassphrase && passphrase ? passphrase : null
          );
          setShareURL(url);
          try { setQrSVG(QR.toSVG(url, { scale: 3, margin: 2 })); } catch { setQrSVG(""); }
          setStep("ready");
        } catch (e) {
          console.error("Share generation failed:", e);
          setError("產生分享連結失敗：" + e.message);
          setStep("error");
        }
      }, [sel, name, passphrase, usePassphrase]);

      const copyLink = useCallback(async () => {
        try {
          await navigator.clipboard.writeText(shareURL);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Fallback
          const ta = document.createElement("textarea");
          ta.value = shareURL;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }, [shareURL]);

      const webShare = useCallback(async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: "大港開唱 2026 行程",
              text: `${name} 的大港行程（${sel.length} 組演出）`,
              url: shareURL,
            });
          } catch {}
        }
      }, [shareURL, name, sel.length]);

      useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
      }, []);

      return ReactDOM.createPortal(
        <>
          <div className={`lottery-backdrop${closing ? " closing" : ""}`} onClick={dismiss} />
          <div className={`lottery-sheet${closing ? " closing" : ""}`}
            style={{ padding: `20px 20px calc(20px + var(--safe-bottom))` }}>
            <div className="res-handle" />

            <div style={{ padding: "16px 0 8px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>分享行程</div>
              <div style={{ fontSize: 13, color: "var(--text-4)", marginTop: 4 }}>
                已選 {sel.length} 組演出
              </div>
            </div>

            {(step === "init" || step === "hasId") && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "8px 0" }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", display: "block", marginBottom: 6 }}>
                    你的暱稱
                  </label>
                  <input
                    ref={inputRef}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="輸入暱稱..."
                    maxLength={20}
                    style={{
                      width: "100%", padding: "12px 14px",
                      borderRadius: 12, border: ".5px solid var(--glass-border)",
                      background: "var(--surface)", color: "var(--text)",
                      fontSize: 15, outline: "none", fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => setUsePassphrase(p => !p)} style={{
                    width: 44, height: 26, borderRadius: 13,
                    border: "none", cursor: "pointer",
                    background: usePassphrase
                      ? "linear-gradient(135deg, #34C759, #30B350)"
                      : "var(--surface-hi)",
                    position: "relative", transition: "background .2s",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,.1)",
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 11,
                      background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                      position: "absolute", top: 2,
                      left: usePassphrase ? 20 : 2,
                      transition: "left .2s cubic-bezier(.16,1,.3,1)",
                    }} />
                  </button>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>
                    設定通關密語（限制觀看）
                  </span>
                </div>

                {usePassphrase && (
                  <input
                    value={passphrase}
                    onChange={e => setPassphrase(e.target.value)}
                    placeholder="輸入通關密語..."
                    style={{
                      width: "100%", padding: "12px 14px",
                      borderRadius: 12, border: ".5px solid var(--glass-border)",
                      background: "var(--surface)", color: "var(--text)",
                      fontSize: 15, outline: "none", fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                  />
                )}

                {identity && (
                  <div style={{
                    fontSize: 11, color: "var(--text-5)", textAlign: "center",
                    padding: "4px 0",
                  }}>
                    密鑰指紋：{identity.fingerprint}
                  </div>
                )}

                <button className="lottery-btn-primary" onClick={generate}
                  disabled={!name.trim()}
                  style={{
                    width: "100%", padding: "14px",
                    opacity: name.trim() ? 1 : .4,
                  }}>
                  產生分享連結
                </button>
              </div>
            )}

            {step === "loading" && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{
                  width: 32, height: 32, border: "3px solid var(--text-5)",
                  borderTop: "3px solid var(--text)", borderRadius: "50%",
                  margin: "0 auto 12px",
                  animation: "spin 1s linear infinite",
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                <div style={{ fontSize: 14, color: "var(--text-3)" }}>正在產生密鑰與連結...</div>
              </div>
            )}

            {step === "ready" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "8px 0" }}>
                {/* QR Code */}
                {qrSVG && (
                  <div style={{ textAlign: "center", padding: "8px 0" }}>
                    <div
                      style={{
                        display: "inline-block", padding: 12,
                        borderRadius: 16, background: "#fff",
                        boxShadow: "0 4px 24px rgba(0,0,0,.1)",
                      }}
                      dangerouslySetInnerHTML={{ __html: qrSVG }}
                    />
                  </div>
                )}

                {/* Identity info */}
                <div style={{
                  textAlign: "center", padding: "4px 0",
                  display: "flex", flexDirection: "column", gap: 2,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                    {name} 的行程
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-5)" }}>
                    已簽署 · 密鑰 {identity?.fingerprint}
                  </div>
                  {usePassphrase && (
                    <div style={{ fontSize: 11, color: "#F4A261", fontWeight: 600, marginTop: 2 }}>
                      已加密 · 需要通關密語才能查看
                    </div>
                  )}
                </div>

                {/* URL display */}
                <div style={{
                  padding: "10px 14px", borderRadius: 12,
                  background: "var(--surface)", border: ".5px solid var(--surface-border)",
                  fontSize: 11, color: "var(--text-4)",
                  wordBreak: "break-all", lineHeight: 1.5,
                  maxHeight: 60, overflow: "hidden",
                }}>
                  {shareURL}
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="lottery-btn-primary" onClick={copyLink}
                    style={{ flex: 1, padding: "14px" }}>
                    {copied ? "已複製！" : "複製連結"}
                  </button>
                  {typeof navigator.share === "function" && (
                    <button className="lottery-btn-secondary" onClick={webShare}
                      style={{ padding: "14px 20px" }}>
                      分享
                    </button>
                  )}
                </div>
              </div>
            )}

            {step === "error" && (
              <div style={{ textAlign: "center", padding: "30px 0" }}>
                <div style={{ fontSize: 14, color: "#FF6B6B", fontWeight: 600 }}>{error}</div>
                <button className="lottery-btn-secondary" onClick={() => setStep("init")}
                  style={{ marginTop: 16 }}>
                  重試
                </button>
              </div>
            )}
          </div>
        </>,
        document.body
      );
    }

    function ShareReceiver({ shareData, onImport, onClose }) {
      const [closing, setClosing] = useState(false);
      const [passphrase, setPassphrase] = useState("");
      const [decrypted, setDecrypted] = useState(null);
      const [decryptError, setDecryptError] = useState(false);
      const [decrypting, setDecrypting] = useState(false);

      const data = decrypted || shareData;
      const isEncrypted = shareData.encrypted;

      const dismiss = useCallback(() => {
        setClosing(true);
        // Clear hash
        history.replaceState(null, "", location.pathname);
        setTimeout(onClose, 320);
      }, [onClose]);

      const doDecrypt = useCallback(async () => {
        if (!passphrase) return;
        setDecrypting(true);
        setDecryptError(false);
        try {
          const result = await ShareCodec.decryptAndDecode(shareData.data, passphrase);
          setDecrypted(result);
        } catch {
          setDecryptError(true);
        }
        setDecrypting(false);
      }, [shareData, passphrase]);

      const handleImport = useCallback(() => {
        if (data && data.sel) {
          onImport(data.sel);
          dismiss();
        }
      }, [data, onImport, dismiss]);

      useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
      }, []);

      const selItems = data?.sel ? T.filter(t => data.sel.includes(t.id)) : [];
      const sched = { 1: [], 2: [] };
      selItems.forEach(i => sched[i.day]?.push(i));
      Object.values(sched).forEach(a => a.sort((x, y) => t2m(x.start) - t2m(y.start)));
      const shareDate = data?.ts ? new Date(data.ts * 1000) : null;

      return ReactDOM.createPortal(
        <>
          <div className={`lottery-backdrop${closing ? " closing" : ""}`} onClick={dismiss} />
          <div className={`lottery-sheet${closing ? " closing" : ""}`}
            style={{ padding: `20px 20px calc(20px + var(--safe-bottom))`, maxHeight: "90vh" }}>
            <div className="res-handle" />

            <div style={{ padding: "16px 0 8px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>
                收到分享行程
              </div>
            </div>

            {isEncrypted && !decrypted && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "16px 0" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
                  <div style={{ fontSize: 14, color: "var(--text-2)", fontWeight: 600 }}>
                    此行程已加密
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 4 }}>
                    請輸入分享者提供的通關密語
                  </div>
                </div>
                <input
                  value={passphrase}
                  onChange={e => { setPassphrase(e.target.value); setDecryptError(false); }}
                  placeholder="輸入通關密語..."
                  onKeyDown={e => { if (e.key === "Enter") doDecrypt(); }}
                  style={{
                    width: "100%", padding: "12px 14px",
                    borderRadius: 12,
                    border: decryptError ? "1px solid #FF6B6B" : ".5px solid var(--glass-border)",
                    background: "var(--surface)", color: "var(--text)",
                    fontSize: 15, outline: "none", fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
                {decryptError && (
                  <div style={{ fontSize: 12, color: "#FF6B6B", textAlign: "center" }}>
                    密語錯誤，請重新輸入
                  </div>
                )}
                <button className="lottery-btn-primary" onClick={doDecrypt}
                  disabled={!passphrase || decrypting}
                  style={{ width: "100%", padding: "14px", opacity: passphrase && !decrypting ? 1 : .4 }}>
                  {decrypting ? "解密中..." : "解鎖"}
                </button>
              </div>
            )}

            {data && !data.encrypted && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "8px 0" }}>
                {/* Sharer identity */}
                <div style={{
                  padding: "14px 16px", borderRadius: 14,
                  background: data.verified
                    ? "linear-gradient(135deg, rgba(52,199,89,.08), rgba(48,179,80,.04))"
                    : "linear-gradient(135deg, rgba(255,107,107,.08), rgba(255,80,80,.04))",
                  border: data.verified
                    ? ".5px solid rgba(52,199,89,.2)"
                    : ".5px solid rgba(255,107,107,.2)",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: data.verified
                      ? "linear-gradient(135deg, #34C759, #30B350)"
                      : "linear-gradient(135deg, #FF6B6B, #E63946)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, color: "#fff", fontWeight: 800,
                    flexShrink: 0,
                  }}>
                    {data.verified ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>
                      {data.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-4)", marginTop: 2 }}>
                      {data.verified ? "簽章已驗證" : "簽章驗證失敗"}
                      {data.fingerprint && ` · ${data.fingerprint}`}
                    </div>
                    {shareDate && (
                      <div style={{ fontSize: 11, color: "var(--text-5)", marginTop: 1 }}>
                        {shareDate.toLocaleDateString("zh-TW")} {shareDate.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Itinerary preview */}
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)" }}>
                  共 {selItems.length} 組演出
                </div>
                <div className="no-scrollbar" style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                  {[1, 2].map(d => {
                    const items = sched[d];
                    if (!items?.length) return null;
                    return (
                      <div key={d}>
                        <div style={{
                          fontSize: 13, fontWeight: 800, marginBottom: 6,
                          background: d === 1
                            ? "linear-gradient(135deg,#FF6B6B,#E63946)"
                            : "linear-gradient(135deg,#F4A261,#EF6C00)",
                          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        }}>
                          {d === 1 ? "DAY 1 · 3/21" : "DAY 2 · 3/22"}
                        </div>
                        {items.map(item => (
                          <div key={item.id} style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "8px 12px", marginBottom: 4,
                            borderRadius: 12,
                            background: `linear-gradient(135deg, ${STAGES[item.stage]?.bg || "#888"}14, ${STAGES[item.stage]?.bg || "#888"}08)`,
                            border: `.5px solid ${STAGES[item.stage]?.bg || "#888"}25`,
                          }}>
                            <span style={{ fontSize: 12, color: "var(--text-4)", fontWeight: 500, fontVariantNumeric: "tabular-nums", minWidth: 75 }}>
                              {item.start}–{item.end}
                            </span>
                            <Badge stage={item.stage} />
                            <span style={{ fontSize: 13, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {item.artist}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                  <button className="lottery-btn-secondary" onClick={dismiss}
                    style={{ flex: 1, padding: "14px" }}>
                    關閉
                  </button>
                  <button className="lottery-btn-primary" onClick={handleImport}
                    style={{ flex: 1, padding: "14px" }}>
                    匯入到我的行程
                  </button>
                </div>
              </div>
            )}
          </div>
        </>,
        document.body
      );
    }

    /* ══════════ App ══════════ */

    function App() {
      const [sel, setSel] = useState([]);
      const [view, setView] = useState("pick");
      const [day, setDay] = useState(1);
      const [stg, setStg] = useState("ALL");
      const [pickMode, setPickMode] = useState("table");

      // Lock body scroll when timetable is visible
      useEffect(() => {
        const lock = view === "pick" && pickMode === "table";
        document.body.style.overflow = lock ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
      }, [view, pickMode]);

      const [q, setQ] = useState("");
      const [showSearch, setShowSearch] = useState(false);
      const searchRef = useRef(null);
      const [rdy, setRdy] = useState(false);
      const [showSheet, setShowSheet] = useState(false);
      const [pref, setPref] = useState(new Set());
      const [simNow, setSimNow] = useState(null);
      const [now, setNow] = useState(new Date());
      const [showTimePicker, setShowTimePicker] = useState(false);
      const [lastTap, setLastTap] = useState(0);
      const firstConflictRef = useRef(null);
      const theme = useTheme();
      const [showOnboard, setShowOnboard] = useState(() => !localStorage.getItem("onboard-done"));
      const [showRes, setShowRes] = useState(false);
      const [zoomImg, setZoomImg] = useState(null);
      const [lotteryItems, setLotteryItems] = useState(null);
      const [showShare, setShowShare] = useState(false);
      const [shareData, setShareData] = useState(null);

      // Tick real clock every 30s
      useEffect(() => {
        if (simNow) return;
        const id = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(id);
      }, [simNow]);

      const rawNow = simNow || now;
      const isClamped = !simNow && rawNow < FESTIVAL_EARLIEST;
      const activeNow = isClamped ? FESTIVAL_EARLIEST : rawNow;
      const activeDay = getDayFromDate(activeNow);
      const activeMinutes = activeNow.getHours() * 60 + activeNow.getMinutes();

      useEffect(() => {
        Promise.all([dbGet(), dbGetPref()]).then(([v, p]) => {
          setSel(v); setPref(new Set(p)); setRdy(true);
        });
        // Check for share URL
        if (location.hash.startsWith("#s=")) {
          ShareCodec.decodeShareURL(location.hash).then(data => {
            if (data) setShareData(data);
          }).catch(e => console.warn("Share decode failed:", e));
        }
      }, []);
      useEffect(() => { if (rdy) dbSet(sel) }, [sel, rdy]);
      useEffect(() => { if (rdy) dbSetPref([...pref]) }, [pref, rdy]);

      const toggle = useCallback(id => setSel(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]), []);
      const togglePref = useCallback((id, groupIds) => setPref(p => { const n = new Set(p); groupIds.forEach(gid => n.delete(gid)); if (!p.has(id)) n.add(id); return n }), []);
      // Swipe between stages — finger-following carousel
      const pillsRef = useRef(null);
      const swipeRef = useRef({ x: 0, y: 0, swiping: false, locked: false });
      const [swipeX, setSwipeX] = useState(0);
      const [swiping, setSwiping] = useState(false);
      const swipeElRef = useRef(null);
      const skipTransition = useRef(false);

      const stgsDay = useMemo(() => { const s = new Set(); T.forEach(t => { if (t.day === day) s.add(t.stage) }); return ["ALL", ...Object.keys(STAGES).filter(k => s.has(k))] }, [day]);

      // Use refs to avoid stale closures in native listener
      const stgRef = useRef(stg);
      const stgsDayRef = useRef(stgsDay);
      useEffect(() => { stgRef.current = stg }, [stg]);
      useEffect(() => { stgsDayRef.current = stgsDay }, [stgsDay]);

      const onTouchStart = useCallback(e => {
        swipeRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, swiping: false, locked: false };
      }, []);

      // Native touchmove with {passive: false} to properly block vertical scroll
      const swipeHandlerRef = useRef(null);
      if (!swipeHandlerRef.current) {
        swipeHandlerRef.current = e => {
          const s = swipeRef.current;
          if (s.locked) return;
          const dx = e.touches[0].clientX - s.x;
          const dy = e.touches[0].clientY - s.y;
          if (!s.swiping && Math.abs(dy) > Math.abs(dx) * 1.2) { s.locked = true; return; }
          if (!s.swiping && Math.abs(dx) > 6) { s.swiping = true; setSwiping(true); }
          if (s.swiping) {
            e.preventDefault();
            const stages = stgsDayRef.current;
            const idx = stages.indexOf(stgRef.current);
            const atEdge = (dx < 0 && idx >= stages.length - 1) || (dx > 0 && idx <= 0);
            setSwipeX(atEdge ? dx * 0.25 : dx);
          }
        };
      }
      const swipeCallbackRef = useCallback(el => {
        if (swipeElRef.current) swipeElRef.current.removeEventListener("touchmove", swipeHandlerRef.current);
        swipeElRef.current = el;
        if (el) el.addEventListener("touchmove", swipeHandlerRef.current, { passive: false });
      }, []);

      const onTouchEnd = useCallback(e => {
        const s = swipeRef.current;
        if (!s.swiping) { s.locked = false; return; }
        s.swiping = false;
        const dx = e.changedTouches[0].clientX - s.x;
        const threshold = window.innerWidth * 0.2;
        const stages = stgsDay;
        const idx = stages.indexOf(stg);
        const w = window.innerWidth;
        if (dx < -threshold && idx < stages.length - 1) {
          skipTransition.current = true;
          setStg(stages[idx + 1]);
          setSwipeX(w + dx);
          setSwiping(false);
          requestAnimationFrame(() => {
            skipTransition.current = false;
            setSwipeX(0);
          });
        } else if (dx > threshold && idx > 0) {
          skipTransition.current = true;
          setStg(stages[idx - 1]);
          setSwipeX(-w + dx);
          setSwiping(false);
          requestAnimationFrame(() => {
            skipTransition.current = false;
            setSwipeX(0);
          });
        } else {
          setSwiping(false);
          setSwipeX(0);
        }
      }, [stgsDay, stg]);

      useEffect(() => {
        const c = pillsRef.current; if (!c) return;
        const active = c.querySelector('[data-stage-active="1"]');
        if (active) active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }, [stg]);

      const scrollToConflict = useCallback(() => {
        setView("sched");
        setTimeout(() => {
          const all = document.querySelectorAll('.conflict-group:not(.collapsed)');
          let el = null;
          for (const g of all) {
            const gDay = Number(g.dataset.day);
            const gEnd = Number(g.dataset.end);
            if (gDay > activeDay || (gDay === activeDay && gEnd > activeMinutes)) { el = g; break; }
          }
          if (!el) el = all[all.length - 1];
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }, [activeDay, activeMinutes]);
      const scrollToDay = useCallback((d) => {
        setView("sched");
        setTimeout(() => {
          const el = document.getElementById('sched-day-' + d);
          if (!el) return;
          const header = document.querySelector('.liquid-glass');
          const offset = header ? header.getBoundingClientRect().height + 8 : 0;
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: "smooth" });
        }, 100);
      }, []);

      const selItems = useMemo(() => T.filter(t => sel.includes(t.id)), [sel]);
      const confIds = useMemo(() => { const s = new Set(); for (let i = 0; i < selItems.length; i++)for (let j = i + 1; j < selItems.length; j++)if (clash(selItems[i], selItems[j])) { s.add(selItems[i].id); s.add(selItems[j].id) } return s }, [selItems]);
      const dimIds = useMemo(() => { const s = new Set(); T.forEach(t => { if (sel.includes(t.id)) return; for (const si of selItems) if (clash(t, si)) { s.add(t.id); break } }); return s }, [sel, selItems]);

      const sched = useMemo(() => { const d = { 1: [], 2: [] }; selItems.forEach(i => d[i.day]?.push(i)); Object.values(d).forEach(a => a.sort((x, y) => t2m(x.start) - t2m(y.start))); return d }, [selItems]);
      const filterStage = useCallback((s) => T.filter(t => { if (t.day !== day) return false; if (q) return t.artist.toLowerCase().includes(q.toLowerCase()); if (s !== "ALL" && t.stage !== s) return false; return true }).sort((a, b) => t2m(a.start) - t2m(b.start)), [day, q]);
      const list = useMemo(() => filterStage(stg), [filterStage, stg]);
      const stgIdx = useMemo(() => stgsDay.indexOf(stg), [stgsDay, stg]);
      const prevList = useMemo(() => stgIdx > 0 ? filterStage(stgsDay[stgIdx - 1]) : null, [filterStage, stgsDay, stgIdx]);
      const nextList = useMemo(() => stgIdx < stgsDay.length - 1 ? filterStage(stgsDay[stgIdx + 1]) : null, [filterStage, stgsDay, stgIdx]);
      const nC = useMemo(() => { let count = 0; for (const d of [1, 2]) { const items = selItems.filter(t => t.day === d).sort((a, b) => t2m(a.start) - t2m(b.start)); let i = 0; while (i < items.length) { if (!confIds.has(items[i].id)) { i++; continue; } const group = [items[i]]; let j = i + 1; while (j < items.length) { if (group.some(g => clash(items[j], g))) { group.push(items[j]); j++; } else break; } if (group.length > 1) count++; i = j; } } return count }, [selItems, confIds]);

      // Compute show status relative to activeNow
      const getStatus = useCallback((item) => {
        if (item.day !== activeDay) return null;
        const s = t2m(item.start), e = t2m(item.end);
        if (activeMinutes >= e) return "ended";
        if (activeMinutes >= s && activeMinutes < e) return "playing";
        return "upcoming";
      }, [activeDay, activeMinutes]);
      const getProgress = useCallback((item) => {
        const s = t2m(item.start), e = t2m(item.end);
        return (activeMinutes - s) / (e - s);
      }, [activeMinutes]);

      return (
        <div style={{
          position: "relative", zIndex: 1,
          maxWidth: 520, margin: "0 auto",
          ...(view === "pick" && pickMode === "table"
            ? { height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }
            : { minHeight: "100dvh", paddingBottom: `calc(90px + var(--safe-bottom))` }),
        }}>

          {/* ══ Floating Header ══ */}
          <div className="liquid-glass" style={{
            position: "sticky", top: 0, zIndex: 100,
            padding: `calc(10px + var(--safe-top)) 16px 10px`,
            borderRadius: "0 0 24px 24px",
            borderTop: "none",
            boxShadow: "var(--glass-shadow), inset 0 -1px 0 var(--glass-lo)",
          }}>
            {/* Title row */}
            <div style={{ marginBottom: 8, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{
                  fontSize: 24, fontWeight: 800, letterSpacing: -.5, lineHeight: 1.2,
                }}>
                  <span style={{
                    background: "linear-gradient(135deg, #FF6B6B 0%, #F4A261 50%, #FFD93D 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>大港開唱</span>
                  <span onClick={view === "sched" ? () => {
                    const n = Date.now();
                    if (n - lastTap < 400) setShowTimePicker(true);
                    setLastTap(n);
                  } : undefined} style={{
                    color: simNow ? "#F4A261" : "var(--text-4)",
                    fontWeight: 600, fontSize: 20, marginLeft: 6,
                    cursor: view === "sched" ? "default" : "auto",
                    transition: "color .2s",
                  }}>2026{simNow && " ⏱"}</span>
                </h1>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2, fontWeight: 500 }}>
                  3/21–22 高雄駁二
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

            {/* Mode toggle */}
            <Segment
              items={[{ value: "pick", label: "選團" }, { value: "sched", label: "我的行程" }]}
              value={view} onChange={v => {
                setView(v);
                if (v === "sched") setTimeout(() => {
                  const el = document.querySelector('.now-line') || document.querySelector('.now-playing-glow')?.parentElement;
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 100);
              }}
            />

            {view === "pick" && (
              <>
                {/* Day toggle + pick mode */}
                <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <Segment
                      items={[{ value: 1, label: "DAY 1 · 3/21 六" }, { value: 2, label: "DAY 2 · 3/22 日" }]}
                      value={day} onChange={v => {
                        setDay(v);
                        if (stg !== "ALL") {
                          const hasStage = T.some(t => t.day === v && t.stage === stg);
                          if (!hasStage) setStg("ALL");
                        }
                      }} size="sm"
                    />
                  </div>
                  <button className="press" onClick={() => setPickMode(m => m === "list" ? "table" : "list")} style={{
                    width: 36, height: 36, borderRadius: 10,
                    border: "1px solid var(--glass-border)",
                    background: "var(--glass-bg)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    boxShadow: "var(--glass-shadow), var(--glass-inner)",
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

                {pickMode === "list" && (<>
                {/* Search + Stage pills */}
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
                          onClick={() => {
                            if (s !== stg) setStg(s);
                          }}
                        />
                      </div>
                    ))}
                  </>)}
                </div>
                </>)}
              </>
            )}
          </div>

          {/* ══ Content ══ */}
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
                    const st = getStatus(item);
                    return <Card
                      key={item.id} item={item}
                      selected={sel.includes(item.id)}
                      dimmed={dimIds.has(item.id)}
                      conflict={confIds.has(item.id)}
                      onToggle={toggle}
                      showBadge
                      status={st} progress={st === "playing" ? getProgress(item) : 0}
                    />;
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
                        const out = [];
                        let nowInserted = false;
                        items.forEach((item, idx) => {
                          if (!nowInserted && day === activeDay && t2m(item.start) > activeMinutes) {
                            nowInserted = true;
                            out.push(<div key="now-line" className="now-line">{!isClamped && <div className="now-line-dot" />}<span className="now-line-label">{isClamped ? "🚢 活動即將開始" : `現在 ${fmtTime(activeNow)}`}</span><div className="now-line-line" /></div>);
                          }
                          const st = getStatus(item);
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
                          );
                        });
                        return out;
                      })()}
                    </div>
                  ))}
                </div>
              </div>
              )
            ) : (
              <div>
                {isClamped && (() => {
                  const em = T.reduce((min, t) => t.day === 1 && t2m(t.start) < min ? t2m(t.start) : min, 9999);
                  const eTime = `${Math.floor(em/60)}:${String(em%60).padStart(2,'0')}`;
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
                  );
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
                        .sort((a, b) => t2m(a.end) - t2m(b.end));
                      if (!playing.length) return null;
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
                      );
                    })()}
                  </div>
                ) : (
                  [1, 2].map(d => {
                    const items = sched[d]; if (!items?.length) return null;
                    // Build segments: group overlapping conflicts together
                    const segments = [];
                    let i = 0;
                    while (i < items.length) {
                      if (confIds.has(items[i].id)) {
                        // Collect all items that overlap with any item in the group
                        const group = [items[i]];
                        let j = i + 1;
                        while (j < items.length) {
                          const overlapsAny = group.some(g => clash(items[j], g));
                          if (overlapsAny) { group.push(items[j]); j++; }
                          else break;
                        }
                        if (group.length > 1) {
                          segments.push({ type: "conflict", items: group });
                          i = j;
                        } else {
                          segments.push({ type: "single", item: items[i] });
                          i++;
                        }
                      } else {
                        segments.push({ type: "single", item: items[i] });
                        i++;
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
                          const out = [];
                          const nowLine = <div key="now-line" className="now-line">{!isClamped && <div className="now-line-dot" />}<span className="now-line-label">{isClamped ? "🚢 活動即將開始" : `現在 ${fmtTime(activeNow)}`}</span><div className="now-line-line" /></div>;
                          let nowInserted = false;

                          // Find all artists currently performing
                          const nowPlaying = d === activeDay
                            ? T.filter(t => t.day === d && activeMinutes >= t2m(t.start) && activeMinutes < t2m(t.end))
                                .sort((a, b) => t2m(a.end) - t2m(b.end))
                            : [];

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
                            : null;

                          // Helper: get the latest end time of a segment
                          const segEnd = s => t2m((s.type === "conflict" ? s.items[s.items.length - 1] : s.item).end);
                          const segStart = s => t2m(s.type === "conflict" ? s.items[0].start : s.item.start);

                          let suggestionsInserted = false;

                          segments.forEach((seg, si) => {
                            const prevEnd = si > 0 ? segEnd(segments[si - 1]) : null;
                            const curStart = segStart(seg);
                            const gap = prevEnd !== null ? curStart - prevEnd : null;

                            // Insert NOW line + suggestions: between segments, in the gap where activeMinutes falls
                            if (!nowInserted && d === activeDay && prevEnd !== null && activeMinutes >= prevEnd && activeMinutes < curStart) {
                              nowInserted = true;
                              out.push(nowLine);
                              if (suggestions) { out.push(suggestions); suggestionsInserted = true; }
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
                                  <ConflictGroup items={seg.items} pref={pref} onPref={togglePref} getStatus={getStatus} getProgress={getProgress} onLottery={setLotteryItems} />
                                </React.Fragment>
                              );
                              // Show suggestions after a currently-playing conflict group
                              if (!suggestionsInserted && suggestions && d === activeDay) {
                                const anyPlaying = seg.items.some(it => getStatus(it) === "playing");
                                if (anyPlaying) { out.push(suggestions); suggestionsInserted = true; }
                              }
                            } else {
                              const st = getStatus(seg.item);
                              out.push(
                                <TimelineCard key={seg.item.id} item={seg.item} gap={gap}
                                  status={st} progress={st === "playing" ? getProgress(seg.item) : 0} />
                              );
                              // Show suggestions after a currently-playing card
                              if (!suggestionsInserted && suggestions && st === "playing") {
                                out.push(suggestions); suggestionsInserted = true;
                              }
                            }
                          });
                          // NOW line after all segments if all ended
                          if (!nowInserted && d === activeDay && segments.length > 0 && activeMinutes >= segEnd(segments[segments.length - 1])) {
                            out.push(nowLine);
                            if (suggestions && !suggestionsInserted) out.push(suggestions);
                          }
                          // NOW line before all segments if before first show
                          if (!nowInserted && d === activeDay && segments.length > 0 && activeMinutes < segStart(segments[0])) {
                            out.unshift(nowLine);
                            if (suggestions && !suggestionsInserted) out.splice(1, 0, suggestions);
                          }
                          return out;
                        })()}
                      </div>
                    );
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

          {/* ══ Floating Tab Bar ══ */}
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
            {view === "sched" && <>
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
                  }} onTouchStart={e => e.currentTarget.style.background = "rgba(255,80,80,.12)"}
                    onTouchEnd={e => e.currentTarget.style.background = "transparent"}>
                    {nC} 撞場
                  </span>
                </>
              )}
              <span style={{ color: "var(--dim)" }}>|</span>
            </>}
            {sel.length > 0 && <>
              <span onClick={() => setShowShare(true)} style={{
                cursor: "pointer", padding: "4px 8px", margin: "-4px -8px", borderRadius: 8,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2, marginRight: 2 }}>
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                分享
              </span>
              <span style={{ color: "var(--dim)" }}>|</span>
            </>}
            <span onClick={() => setShowRes(true)} style={{
              cursor: "pointer", padding: "4px 8px", margin: "-4px -8px", borderRadius: 8,
            }}>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2, marginRight: 3 }}>
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
              </svg>
              總覽
            </span>
          </div>}


          {/* ══ Resource Sheet ══ */}
          {showRes && (() => {
            const dismiss = () => {
              document.querySelector('.res-backdrop')?.classList.add('closing');
              document.querySelector('.res-sheet')?.classList.add('closing');
              setTimeout(() => setShowRes(false), 320);
            };
            let dragY = 0, dragging = false;
            const onDragStart = e => {
              const sheet = e.currentTarget;
              if (sheet.scrollTop <= 0) { dragY = e.touches[0].clientY; dragging = true; }
            };
            const onDragMove = e => {
              if (!dragging) return;
              const sheet = e.currentTarget;
              const dy = e.touches[0].clientY - dragY;
              if (dy > 0 && sheet.scrollTop <= 0) {
                sheet.style.transform = `translateY(${dy * 0.6}px)`;
                const backdrop = document.querySelector('.res-backdrop');
                if (backdrop) backdrop.style.opacity = Math.max(0, 1 - dy / 400);
              }
            };
            const onDragEnd = e => {
              if (!dragging) return;
              dragging = false;
              const dy = e.changedTouches[0].clientY - dragY;
              const sheet = e.currentTarget;
              if (dy > 100 && sheet.scrollTop <= 0) {
                dismiss();
              } else {
                sheet.style.transform = '';
                const backdrop = document.querySelector('.res-backdrop');
                if (backdrop) backdrop.style.opacity = '';
              }
            };
            return <>
              <div className="res-backdrop" onClick={dismiss} />
              <div className="res-sheet" onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}>
                <div style={{ padding: "8px 16px calc(16px + var(--safe-bottom))", display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { src: MAP_SRC, label: "場地地圖" },
                    { src: "./img/megaport_festival_2026_day_1.webp", label: "DAY 1 節目表 (3/21)" },
                    { src: "./img/megaport_festival_2026_day_2.webp", label: "DAY 2 節目表 (3/22)" },
                    { src: "./img/megaport_festival_2026_free_stage.jpg", label: "大樹下節目表" },
                  ].map(r => (
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
            </>;
          })()}
          {/* ══ Floating Map Button ══ */}
          <FloatingMapBtn onMapOpen={() => setZoomImg({ src: MAP_SRC, hotspots: true })} />
          {/* ══ Image Viewer ══ */}
          {zoomImg && <ImageViewer src={typeof zoomImg === 'string' ? zoomImg : zoomImg.src} hotspots={typeof zoomImg === 'object' && zoomImg.hotspots} onClose={() => setZoomImg(null)} />}
          {showOnboard && <Onboarding onDone={() => { localStorage.setItem("onboard-done", "1"); setShowOnboard(false) }} />}
          {lotteryItems && <LotterySheet items={lotteryItems} onAccept={id => { togglePref(id, lotteryItems.map(i => i.id)); setLotteryItems(null); }} onClose={() => setLotteryItems(null)} />}
          {showShare && <ShareSheet sel={sel} onClose={() => setShowShare(false)} />}
          {shareData && <ShareReceiver shareData={shareData} onImport={ids => setSel(ids)} onClose={() => setShareData(null)} />}
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
