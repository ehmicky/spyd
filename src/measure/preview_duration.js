import now from 'precise-now'

import { updatePreview } from '../preview/update.js'
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
export const startCombinationPreview = async function (previewState, index) {
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(previewState, {
    combinationStart: now(),
    combinationEnd: undefined,
    index,
  })
  await updatePreview(previewState)
}

// Done when combination's sample starts
export const updateCombinationPreview = function ({
  stats,
  stats: { moe, samples },
  previewConfig: { quiet },
  previewState,
  previewState: { combinationEnd: previousCombinationEnd },
  sampleState,
  sampleState: { previewSamples },
  durationState,
  precisionTarget,
}) {
  if (quiet || samples === 0 || moe === undefined) {
    return sampleState
  }

  const samplesTarget = getSamplesTarget(stats, precisionTarget)
  const combinationEnd = getCombinationEnd(samplesTarget, durationState)
  const combinationEndA = smoothCombinationEnd({
    combinationEnd,
    previousCombinationEnd,
    previewSamples,
    samplesTarget,
  })
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.combinationEnd = combinationEndA
  return { ...sampleState, previewSamples: previewSamples + 1 }
}

// Estimate how many samples are left to reach the rmoe target for the current
// `precision`.
const getSamplesTarget = function (
  { median, stdev, loops, samples },
  precisionTarget,
) {
  const moeTarget = precisionTarget * median
  const lengthTarget = getLengthForMoe(moeTarget, stdev)
  const loopsTarget = getLoopsFromLength(lengthTarget)
  const samplesTarget = computeSamplesTarget(loopsTarget, loops, samples)
  return samplesTarget
}

const computeSamplesTarget = function (loopsTarget, loops, samples) {
  const loopsLeft = Math.max(loopsTarget - loops, 0)
  const sampleLoopsMean = loops / samples
  return Math.ceil(loopsLeft / sampleLoopsMean)
}

// Estimate `combinationEnd` based on the current data
const getCombinationEnd = function (samplesTarget, { sampleDurationMean }) {
  const durationLeft = samplesTarget * sampleDurationMean
  return now() + durationLeft
}

// Blend the previous `combinationEnd` with the new one to stabilize its change
// between samples.
const smoothCombinationEnd = function ({
  combinationEnd,
  previousCombinationEnd,
  previewSamples,
  samplesTarget,
}) {
  if (previousCombinationEnd === undefined) {
    return combinationEnd
  }

  const previousCombinationEndA = Math.max(previousCombinationEnd, now())
  const smoothRatio = getSmoothRatio(previewSamples, samplesTarget)
  return (
    previousCombinationEndA * smoothRatio + combinationEnd * (1 - smoothRatio)
  )
}

const getSmoothRatio = function (previewSamples, samplesTarget) {
  const samplesToEdge = Math.min(previewSamples + 1, samplesTarget)
  const smoothSamples = samplesToEdge * ADJUSTED_SMOOTH_PERIOD
  return SMOOTH_CLOSENESS ** (1 / smoothSamples)
}

const SMOOTH_PERIOD = 0.65
const ADJUSTED_SMOOTH_PERIOD = SMOOTH_PERIOD * 2
const SMOOTH_CLOSENESS = 0.05

// Done when combination ends
export const endCombinationPreview = async function (previewState) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.combinationEnd = now()
  await updatePreview(previewState)
}
