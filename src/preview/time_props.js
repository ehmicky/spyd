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
  benchmarkDuration,
  previewState: { benchmarkStart, timeLeft },
}) {
  return benchmarkDuration === 0 || benchmarkDuration === 1
    ? getStartDurationProps(benchmarkStart)
    : getEndDurationProps(benchmarkDuration, timeLeft)
}

const getStartDurationProps = function (benchmarkStart) {
  const startDuration = getStartDuration(benchmarkStart)
  const time = getTime(startDuration)
  return { time }
}

// `benchmarkStart` is undefined when not started yet
const getStartDuration = function (benchmarkStart) {
  if (benchmarkStart === undefined) {
    return 0
  }

  return now() - benchmarkStart
}

// `timeLeft` is undefined when not started yet
const getEndDurationProps = function (
  benchmarkDuration,
  timeLeft = benchmarkDuration,
) {
  const percentage = 1 - timeLeft / benchmarkDuration
  const time = getTime(timeLeft, benchmarkDuration)
  return { percentage, time }
}
