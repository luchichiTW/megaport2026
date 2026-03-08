interface SegmentItem {
  value: string | number
  label: string
}

interface SegmentProps {
  items: SegmentItem[]
  value: string | number
  onChange: (v: never) => void
  size?: 'sm' | 'md'
}

export function Segment({ items, value, onChange, size = "md" }: SegmentProps) {
  const idx = items.findIndex(i => i.value === value)
  const count = items.length
  const pad = size === "sm" ? 2 : 3
  const py = size === "sm" ? "6px" : "9px"
  const fs = size === "sm" ? 12 : 14
  return (
    <div style={{
      position: "relative", display: "flex", padding: pad,
      borderRadius: size === "sm" ? 10 : 12,
      background: "var(--seg-bg)",
      border: ".5px solid var(--seg-border)",
    }}>
      <div style={{
        position: "absolute",
        top: pad, bottom: pad,
        left: `calc(${pad}px + ${idx / count * 100}%)`,
        width: `calc(${100 / count}% - ${pad}px)`,
        borderRadius: size === "sm" ? 8 : 10,
        background: "var(--seg-ind)",
        boxShadow: "var(--seg-ind-shadow), inset 0 .5px 0 var(--seg-ind-hi)",
        transition: "left .35s cubic-bezier(.16,1,.3,1)",
      }} />
      {items.map(item => (
        <button key={String(item.value)} onClick={() => onChange(item.value as never)} style={{
          flex: 1, position: "relative", zIndex: 1,
          padding: `${py} 0`, border: "none", borderRadius: 10,
          background: "transparent", cursor: "pointer",
          fontSize: fs, fontWeight: 600, fontFamily: "inherit",
          color: value === item.value ? "var(--text)" : "var(--text-3)",
          transition: "color .25s",
          letterSpacing: size === "sm" ? 0 : .2,
        }}>
          {item.label}
        </button>
      ))}
    </div>
  )
}
