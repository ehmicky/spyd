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
  progressState: { index, combinationEnd, row },
  total,
  duration,
  reporters,
}) {
  // Not started yet
  if (index === undefined) {
    return
  }

  const combinationTimeLeft = Math.max(combinationEnd - now(), 0)
  const percentage = getPercentage({
    index,
    combinationTimeLeft,
    total,
    duration,
  })
  const timeLeft = getTimeLeft({
    index,
    timeLeft: combinationTimeLeft,
    total,
    duration,
  })

  // Call each `reporter.update()`
  await Promise.all(
    reporters.map((reporter) =>
      reporter.update({ row, percentage, timeLeft, index, total }),
    ),
  )
}

// Percentage left of the whole benchmark
const getPercentage = function ({
  index,
  combinationTimeLeft,
  total,
  duration,
}) {
  const taskPercentage = 1 - combinationTimeLeft / duration
  const percentage = (index + taskPercentage) / total
  return percentage
}

export const stopUpdate = function (progressId) {
  clearInterval(progressId)
}
