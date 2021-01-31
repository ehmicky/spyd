import now from 'precise-now'

import { getTime } from './time.js'

// Retrieve `percentage` and `time` to show in preview. There are two modes:
//  - When `duration` is 0 or 1, `time` goes up and `percentage` is `undefined`
//  - Otherwise, `time` does down and `percentage` is based on `duration`
export const getTimeProps = function ({
  benchmarkStart,
  benchmarkEnd,
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
