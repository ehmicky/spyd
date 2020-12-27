import now from 'precise-now'

import { getTime } from './time.js'

// Retrieve `percentage` and `time` to show in progress reporting. There are
// two modes:
//  - When `duration` is 0 or 1, `time` goes up and `percentage` is `undefined`
//  - Otherwise, `time` does down and `percentage` is based on `duration`
export const getTimeProps = function ({
  progressState,
  combinations,
  duration,
}) {
  return duration === 0 || duration === 1
    ? getStartDurationProps(progressState)
    : getEndDurationProps({ progressState, combinations, duration })
}

const getStartDurationProps = function ({ benchmarkStart }) {
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

const getEndDurationProps = function ({
  progressState: { benchmarkEnd },
  combinations,
  duration,
}) {
  const benchmarkDuration = combinations.length * duration
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
