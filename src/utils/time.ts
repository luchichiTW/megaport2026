import type { Performance } from '../config'

export const t2m = (t: string): number => {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

export const clash = (a: Performance, b: Performance): boolean =>
  a.day === b.day && t2m(a.start) < t2m(b.end) && t2m(b.start) < t2m(a.end)

export const fmtTime = (d: Date): string =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
