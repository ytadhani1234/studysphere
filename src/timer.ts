export function remainingAt(endTime: number, now: number) {
  return Math.max(0, Math.ceil((endTime - now) / 1000))
}

export function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds))
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`
}

export function focusElapsed(totalSeconds: number, remainingSeconds: number) {
  return Math.max(0, Math.min(totalSeconds, totalSeconds - remainingSeconds))
}
