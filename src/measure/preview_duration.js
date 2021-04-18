import now from 'precise-now'

import { getLoopsFromLength } from '../stats/extreme.js'
import { getLengthForMoe } from '../stats/moe.js'

// Update the combination start and expected end.
// This is combined with the current timestamp to compute the expected duration
// left and percentage in previews.
// Reporting the expected duration left is important because this helps:
//   - Chosing between different `precision`
//   - With user impatience or with planning other things while measuring is
//     ongoing
// Done when combination starts
export const startCombinationPreview = function (previewState, index) {
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(previewState, {
    combinationStart: now(),
    combinationEnd: undefined,
    index,
  })
}

// Done when combination's sample starts
export const updateCombinationPreview = function ({
  stats,
  stats: { moe, samples },
  previewConfig: { quiet },
  previewState,
  durationState,
  precisionTarget,
}) {
  if (quiet || samples === 0 || moe === undefined) {
    return
  }

  const durationLeft = getDurationLeft(stats, durationState, precisionTarget)
  updateCombinationEnd(previewState, durationLeft)
}

// Estimate how much duration is left to reach the rmoe target for the current
// `precision`.
const getDurationLeft = function (
  { median, stdev, loops, samples },
  { sampleDurationMean },
  precisionTarget,
) {
  const moeTarget = precisionTarget * median
  const lengthTarget = getLengthForMoe(moeTarget, stdev)
  const loopsTarget = getLoopsFromLength(lengthTarget)
  const samplesTarget = getSamplesTarget(loopsTarget, loops, samples)
  return samplesTarget * sampleDurationMean
}

const getSamplesTarget = function (loopsTarget, loops, samples) {
  const loopsLeft = Math.max(loopsTarget - loops, 0)
  const sampleLoopsMean = loops / samples
  return Math.ceil(loopsLeft / sampleLoopsMean)
}

// Done when combination ends
export const endCombinationPreview = function (previewState) {
  updateCombinationEnd(previewState, 0)
}

const updateCombinationEnd = function (previewState, durationLeft) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.combinationEnd = now() + durationLeft
}
