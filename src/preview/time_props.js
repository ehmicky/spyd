import now from 'precise-now'

import { getTime } from './time.js'

// Update `percentage` and `time` to show in preview. There are two modes:
//  - When `duration` is 0 or 1, `time` goes up and `percentage` is `undefined`
//  - Otherwise, `time` does down and `percentage` is based on `duration`
// Those are also passed to `reporters` in preview:
//  - This is meant for reporters not printed in terminal.
//  - This is not passed to the final report.
//  - Unlike the progress bar, there is a slight delay since those properties
//    require another call to `setPreviewReport()` then to `updatePreview()`.
//    This delay is roughly equal to the time between two `setPreviewReport()`.
// Those are `undefined` until measuring starts.
export const updateTimeProps = function (previewState, benchmarkDuration) {
  const { percentage, time } = getTimeProps({
    previewState,
    benchmarkDuration,
  })
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(previewState, { percentage, time })
}

const getTimeProps = function ({
  previewState: { benchmarkStart, benchmarkEnd },
  benchmarkDuration,
}) {
  return benchmarkDuration === 0 || benchmarkDuration === 1
    ? getStartDurationProps(benchmarkStart)
    : getEndDurationProps(benchmarkEnd, benchmarkDuration)
}

const getStartDurationProps = function (benchmarkStart) {
  const startDuration = getStartDuration(benchmarkStart)
  const time = getTime(startDuration)
  return { time }
}

const getStartDuration = function (benchmarkStart) {
  // Not started yet
  if (benchmarkStart === undefined) {
    return 0
  }

  return now() - benchmarkStart
}

const getEndDurationProps = function (benchmarkEnd, benchmarkDuration) {
  const timeLeft = getTimeLeft(benchmarkEnd, benchmarkDuration)
  const percentage = 1 - timeLeft / benchmarkDuration
  const time = getTime(timeLeft, benchmarkDuration)
  return { percentage, time }
}

const getTimeLeft = function (benchmarkEnd, benchmarkDuration) {
  // Not started yet
  if (benchmarkEnd === undefined) {
    return benchmarkDuration
  }

  return Math.max(benchmarkEnd - now(), 0)
}
