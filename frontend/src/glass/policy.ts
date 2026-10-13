/** One material policy for every Vue host of the official DOM SDK. */
export const glassPolicy = {
  appearance: 'dark',
  material: 'clear',
  motion: 'full',
  refraction: 12,
  maxSurfaces: 32,
} as const

export function boundedValue(value: number, min: number, max: number, step: number) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min || !Number.isFinite(step) || step <= 0) return min
  const current = Number.isFinite(value) ? value : min
  return Math.min(max, Math.max(min, Number((min + Math.round((current - min) / step) * step).toFixed(8))))
}

export function nextEnabledIndex(disabled: boolean[], current: number, direction: number) {
  for (let offset = 1; offset <= disabled.length; offset++) {
    const index = ((current + offset * direction) % disabled.length + disabled.length) % disabled.length
    if (!disabled[index]) return index
  }
  return -1
}
