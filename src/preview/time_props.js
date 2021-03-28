import now from 'precise-now'

import { getTime } from './time.js'

// Update `percentage` and `time` to show in preview. There are three modes:
//  - When `duration` is 1, `time` goes up and a progress bar shows which
//    combinations have ended.
//  - Otherwise, `time` does down and the progress bar is based on `duration`
// Those are also passed to `reporters` in preview:
//  - This is meant for reporters not printed in terminal.
//  - This is not passed to the final report.
//  - Unlike the progress bar, there is a slight delay since those properties
//    require another call to `setPreviewReport()` then to `updatePreview()`.
//    This delay is roughly equal to the time between two `setPreviewReport()`.
export const updateTimeProps = function (previewState, benchmarkDuration) {
  const { percentage, time } = getTimeProps(previewState, benchmarkDuration)
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(previewState, { percentage, time })
}

const getTimeProps = function (previewState, benchmarkDuration) {
  return benchmarkDuration === 1
    ? getStartDurationProps(previewState)
    : getEndDurationProps(previewState, benchmarkDuration)
}

const getStartDurationProps = function ({ benchmarkStart, percentage = 0 }) {
  const startDuration = getStartDuration(benchmarkStart)
  const time = getTime(startDuration)
  return { time, percentage }
}

// `benchmarkStart` is undefined when not started yet
const getStartDuration = function (benchmarkStart) {
  if (benchmarkStart === undefined) {
    return 0
  }

  return now() - benchmarkStart
}

const getEndDurationProps = function (previewState, benchmarkDuration) {
  const timeLeft = updateTimeLeft(previewState, benchmarkDuration)
  const time = getTime(timeLeft)
  const percentage = 1 - timeLeft / benchmarkDuration
  return { percentage, time }
}

// We do not allow `timeLeft` to decrease, only to freeze.
// This prevents `timeLeft` from jumping up when a combination lasts longer
// than its allowed `duration`.
const updateTimeLeft = function (previewState, benchmarkDuration) {
  const timeLeft = getTimeLeft(previewState, benchmarkDuration)
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.timeLeft = timeLeft
  return timeLeft
}

// `benchmarkEnd` is undefined when not started yet
const getTimeLeft = function ({ benchmarkEnd, timeLeft }, benchmarkDuration) {
  if (benchmarkEnd === undefined) {
    return benchmarkDuration
  }

  return Math.min(Math.max(benchmarkEnd - now(), 0), timeLeft)
}
