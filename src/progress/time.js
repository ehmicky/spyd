// Retrieve seconds/minutes/hours left in a human-friendly string
export const getTime = function (nsecs, totalNsecs = nsecs) {
  const secs = Math.ceil(nsecs / NANOSECS_TO_SECS)
  const totalSecs = Math.ceil(totalNsecs / NANOSECS_TO_SECS)
  const time = addTimeUnits(secs, totalSecs)
  return time
}

// We use the `totalSecs` (instead of remaining time) to decide whether to show
// h/m/s, so that it is constant through the benchmark
const addTimeUnits = function (secs, totalSecs) {
  if (totalSecs < SECS_TO_MINUTES) {
    return `${padTime(secs)}s`
  }

  const minutes = Math.floor(secs / SECS_TO_MINUTES)
  const secsA = secs - minutes * SECS_TO_MINUTES

  if (totalSecs < SECS_TO_MINUTES * MINUTES_TO_HOURS) {
    return `${padTime(minutes)}m:${padTime(secsA)}s`
  }

  const hours = Math.floor(minutes / MINUTES_TO_HOURS)
  const minutesA = minutes - hours * MINUTES_TO_HOURS
  return `${padTime(hours)}h:${padTime(minutesA)}m:${padTime(secsA)}s`
}

const NANOSECS_TO_SECS = 1e9
const SECS_TO_MINUTES = 60
const MINUTES_TO_HOURS = 60

const padTime = function (time) {
  return String(time).padStart(2)
}
