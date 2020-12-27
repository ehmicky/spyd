import now from 'precise-now'

import { setBenchmarkEnd } from '../progress/set.js'

// Tasks that are longer than the `duration` configuration property are likely
// reasons why users might stop the benchmark. In that case, the task might be
// much longer to end, so we do not do any end/exit and directly terminate it.
export const terminateLongTask = function ({
  stopState,
  stopState: {
    sampleStart,
    combination: { totalDuration, maxDuration, childProcess } = {},
  },
}) {
  if (!isLongTask({ sampleStart, totalDuration, maxDuration })) {
    return
  }

  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  stopState.longTask = true
  childProcess.kill('SIGKILL')
}

// Total duration is `undefined` when not in `measure` phase
const isLongTask = function ({ sampleStart, totalDuration, maxDuration }) {
  return (
    totalDuration !== undefined &&
    now() - sampleStart + totalDuration > maxDuration
  )
}

// Update `benchmarkEnd` to match the time the currently executing task is
// expected to end.
// Not done if `sampleDurationMean` is `0` meaning either:
//  - not in measure phase
//  - measuring the first sample of the task
// In that case, we leave `benchmarkEnd` as is
export const setStopBenchmarkEnd = function (
  progressState,
  { sampleStart, combination: { sampleDurationMean = 0 } = {} },
) {
  if (sampleDurationMean === 0) {
    return
  }

  const benchmarkEnd = sampleStart + sampleDurationMean
  setBenchmarkEnd(progressState, benchmarkEnd)
}
