import { setBenchmarkEnd } from '../preview/set.js'

// Update `benchmarkEnd` to match the time the currently executing task is
// expected to end.
// Not done if `sampleDurationMean` is `0` meaning either:
//  - not in measure phase
//  - measuring the first sample of the task
// In that case, we leave `benchmarkEnd` as is
export const setStopBechmarkEnd = function ({
  previewState,
  stopState: { sampleStart, combination: { sampleDurationMean = 0 } = {} },
  duration,
}) {
  if (sampleDurationMean === 0 || duration === 1) {
    return
  }

  const benchmarkEnd = sampleStart + sampleDurationMean
  setBenchmarkEnd(previewState, benchmarkEnd)
}
