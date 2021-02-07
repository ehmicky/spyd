import now from 'precise-now'

import { setTimeLeft } from '../preview/set.js'

// Tasks that are longer than the `duration` configuration property are likely
// reasons why users might stop the benchmark. In that case, the task might be
// much longer to end, so we do not do any end/exit and directly terminate it.
export const terminateLongTask = function ({
  stopState,
  stopState: { sampleStart, combination: { totalDuration, childProcess } = {} },
  duration,
}) {
  if (!isLongTask({ sampleStart, totalDuration, duration })) {
    return
  }

  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  stopState.longTask = true
  childProcess.kill('SIGKILL')
}

// Total duration is `undefined` when not in `measure` phase
const isLongTask = function ({ sampleStart, totalDuration, duration }) {
  return (
    totalDuration !== undefined &&
    duration !== 0 &&
    duration !== 1 &&
    now() - sampleStart + totalDuration > duration
  )
}

// Update `timeLeft` to match the time the currently executing task is expected
// to last.
// Not done if `sampleDurationMean` is `0` meaning either:
//  - not in measure phase
//  - measuring the first sample of the task
// In that case, we leave `timeLeft` as is
export const setStopTimeLeft = function ({
  previewState,
  stopState: { sampleStart, combination: { sampleDurationMean = 0 } = {} },
  duration,
}) {
  if (sampleDurationMean === 0 || duration === 0 || duration === 1) {
    return
  }

  const timeLeft = now() - sampleStart - sampleDurationMean
  setTimeLeft(previewState, timeLeft)
}
