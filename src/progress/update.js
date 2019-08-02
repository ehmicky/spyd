import { now } from '../now.js'

// Update progress at regular interval
export const startUpdate = function({ total, duration, reporters }) {
  const progressState = {}
  const progressId = setInterval(
    () => updateProgress({ progressState, total, duration, reporters }),
    FREQUENCY,
  )
  return { progressState, progressId }
}

// How often (in milliseconds) to update progress
const FREQUENCY = 1e2

const updateProgress = async function({
  progressState: { index, runEnd, name },
  total,
  duration,
  reporters,
}) {
  // Not started yet
  if (index === undefined) {
    return
  }

  const percentage = getPercentage({ index, runEnd, total, duration })

  // Call each `reporter.update()`
  const promises = reporters.map(reporter =>
    reporter.update({ name, percentage, index, total }),
  )
  await Promise.all(promises)
}

// Percentage left of the whole run
const getPercentage = function({ index, runEnd, total, duration }) {
  const timeLeft = Math.max(runEnd - now(), 0)
  const taskPercentage = 1 - timeLeft / duration
  const percentage = (index + taskPercentage) / total
  return percentage
}

export const stopUpdate = function(progressId) {
  clearInterval(progressId)
}
