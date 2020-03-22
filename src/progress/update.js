import now from 'precise-now'

import { getTimeLeft } from './time.js'

// Update progress at regular interval
export const startUpdate = function ({ total, duration, reporters }) {
  const progressState = {}
  const progressId = setInterval(
    () => updateProgress({ progressState, total, duration, reporters }),
    FREQUENCY,
  )
  return { progressState, progressId }
}

// How often (in milliseconds) to update progress
const FREQUENCY = 1e2

const updateProgress = async function ({
  progressState: { index, runEnd, name },
  total,
  duration,
  reporters,
}) {
  // Not started yet
  if (index === undefined) {
    return
  }

  const taskTimeLeft = Math.max(runEnd - now(), 0)
  const percentage = getPercentage({ index, taskTimeLeft, total, duration })
  const timeLeft = getTimeLeft({ index, taskTimeLeft, total, duration })

  // Call each `reporter.update()`
  await Promise.all(
    reporters.map((reporter) =>
      reporter.update({ name, percentage, timeLeft, index, total }),
    ),
  )
}

// Percentage left of the whole run
const getPercentage = function ({ index, taskTimeLeft, total, duration }) {
  const taskPercentage = 1 - taskTimeLeft / duration
  const percentage = (index + taskPercentage) / total
  return percentage
}

export const stopUpdate = function (progressId) {
  clearInterval(progressId)
}
