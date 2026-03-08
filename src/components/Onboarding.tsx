import { useState } from 'react'
import { createPortal } from 'react-dom'
import { EVENT } from '../config'

const ONBOARD_STEPS = [
  { icon: "🚢", title: `歡迎來到${EVENT.shortName}`, desc: "你的專屬音樂祭行程助手。點一下演出即可加入行程，左右滑動切換舞台，長按可查看藝人介紹。" },
  { icon: "🗺️", title: "行程、時刻表與地圖", desc: "切換「我的行程」查看已選演出與撞場標示，DAY 旁方格圖示可切換時刻表。右下角地圖按鈕可開啟場地地圖，點擊舞台位置即可導航前往。" },
  { icon: "📲", title: "先加主畫面再排團！", desc: "記得先點「分享 → 加入主畫面」再開始排行程，不然在瀏覽器排好的團序進到主畫面還要再排一次喔！完全離線運作、不蒐集任何資料。", links: [{ url: EVENT.links.instagram, label: "官方 Instagram" }, { url: EVENT.links.github, label: "GitHub 原始碼" }] },
]

interface OnboardingProps {
  onDone: () => void
}

export function Onboarding({ onDone }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const [closing, setClosing] = useState(false)
  const [stepKey, setStepKey] = useState(0)
  const isLast = step === ONBOARD_STEPS.length - 1
  const s = ONBOARD_STEPS[step]
  const next = () => {
    if (isLast) { setClosing(true); setTimeout(onDone, 280); return }
    setStep(p => p + 1); setStepKey(k => k + 1)
  }
  const prev = () => { if (step > 0) { setStep(p => p - 1); setStepKey(k => k + 1) } }
  const skip = () => { setClosing(true); setTimeout(onDone, 280) }
  return createPortal(
    <div className="onboard-backdrop"
      style={closing ? { animation: "fadeOut .25s ease-out forwards" } : {}}>
      <div className="onboard-card"
        style={closing ? { animation: "dialogOut .25s var(--ease-out) forwards" } : {}}>
        <div key={stepKey} className="onboard-body onboard-step-enter">
          <div className="onboard-icon">{s.icon}</div>
          <div className="onboard-title">{s.title}</div>
          <div className="onboard-desc">{s.desc}</div>
          {'links' in s && s.links && <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
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
  )
}
