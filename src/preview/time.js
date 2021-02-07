// Retrieve seconds/minutes/hours left in a human-friendly string
export const getTime = function (nsecs) {
  const secs = Math.ceil(nsecs / NANOSECS_TO_SECS)
  const minutes = Math.floor(secs / SECS_TO_MINUTES)
  const secsA = secs - minutes * SECS_TO_MINUTES
  const hours = Math.floor(minutes / MINUTES_TO_HOURS)
  const minutesA = minutes - hours * MINUTES_TO_HOURS
  const hoursStr = hours === 0 ? '' : `${padTime(hours)}:`
  return `${hoursStr}${padTime(minutesA)}:${padTime(secsA)}`
}

const NANOSECS_TO_SECS = 1e9
const SECS_TO_MINUTES = 60
const MINUTES_TO_HOURS = 60

const padTime = function (time) {
  return String(time).padStart(2, '0')
}
