// Retrieve seconds/minutes/hours left in a human-friendly string
export const getTimeLeft = function ({ index, taskTimeLeft, total, duration }) {
  const nanosecs = (total - index - 1) * duration + taskTimeLeft
  const secs = Math.ceil(nanosecs / NANOSECS_TO_SECS)
  const totalTime = (total * duration) / NANOSECS_TO_SECS
  const timeLeft = addTimeUnits(secs, totalTime)
  return timeLeft
}

const NANOSECS_TO_SECS = 1e9

// We use the `totalTime` (instead of remaining time) to decide whether to show
// h/m/s, so that it is constant through the run
const addTimeUnits = function (secs, totalTime) {
  if (totalTime < SECS_TO_MINUTES) {
    return `${padTime(secs)}s`
  }

  const minutes = Math.floor(secs / SECS_TO_MINUTES)
  const secsA = secs - minutes * SECS_TO_MINUTES

  if (totalTime < SECS_TO_MINUTES * MINUTES_TO_HOURS) {
    return `${padTime(minutes)}m:${padTime(secsA)}s`
  }

  const hours = Math.floor(minutes / MINUTES_TO_HOURS)
  const minutesA = minutes - hours * MINUTES_TO_HOURS
  return `${padTime(hours)}h:${padTime(minutesA)}m:${padTime(secsA)}s`
}

const SECS_TO_MINUTES = 60
const MINUTES_TO_HOURS = 60

const padTime = function (time) {
  return String(time).padStart(2)
}
