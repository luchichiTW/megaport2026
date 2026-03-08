import { STAGES } from '../config'

interface BadgeProps {
  stage: string
  large?: boolean
}

export function Badge({ stage, large }: BadgeProps) {
  const s = STAGES[stage]
  if (!s) return null
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
      {s.name}
    </span>
  )
}
