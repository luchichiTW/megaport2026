interface PillProps {
  label: string
  active: boolean
  color?: string | null
  onClick: () => void
}

export function Pill({ label, active, color, onClick }: PillProps) {
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
  )
}
