import now from 'precise-now'

import { getLoopsFromLength } from '../../../stats/length.js'
import { getLengthForMoe } from '../../../stats/moe.js'
import { MAX_MEASURES } from '../../sample/max_measures.js'

// Update the combination start and expected end.
// This is combined with the current timestamp to compute the expected duration
// left and percentage in previews.
// Reporting the expected duration left is important because this helps:
//   - Chosing between different `precision`
//   - With user impatience or with planning other things while measuring is
//     ongoing
// Done when combination's sample starts
export const updateCombinationEnd = ({
  stats,
  stats: { stdev },
  previewState,
  previewState: { previewSamples, combinationEnd: previousCombinationEnd },
  durationState: { sampleDurationMean },
  sampleState: { coldLoopsTarget },
  precision,
}) => {
  if (sampleDurationMean === undefined || stdev === undefined || stdev === 0) {
    return
  }

  const samplesLeft = getSamplesLeft(stats, precision, coldLoopsTarget)
  const combinationEnd = getCombinationEnd(samplesLeft, sampleDurationMean)
  const combinationEndA = smoothCombinationEnd({
    combinationEnd,
    previousCombinationEnd,
    previewSamples,
    samplesLeft,
  })
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(previewState, {
    previewSamples: previewSamples + 1,
    combinationEnd: combinationEndA,
  })
}

// Estimate how many samples are left to reach the rmoe target for the current
// `precision`.
const getSamplesLeft = (
  { samples, loops, mean, stdev, min, max, outliersMin, outliersMax },
  precision,
  coldLoopsTarget,
) => {
  const moeLengthTarget = getLengthForMoe({
    mean,
    stdev,
    min,
    max,
    precision,
  })
  const moeLoopsTarget = getLoopsFromLength(
    moeLengthTarget,
    outliersMin,
    outliersMax,
  )
  const loopsTarget = Math.min(
    Math.max(moeLoopsTarget, coldLoopsTarget),
    MAX_MEASURES,
  )
  const samplesLeft = computeSamplesLeft(loopsTarget, loops, samples)
  return samplesLeft
}

const computeSamplesLeft = (loopsTarget, loops, samples) => {
  const loopsLeft = Math.max(loopsTarget - loops, 0)
  const sampleLoopsMean = loops / samples
  return Math.ceil(loopsLeft / sampleLoopsMean)
}

// Estimate `combinationEnd` based on the current data
const getCombinationEnd = (samplesLeft, sampleDurationMean) => {
  const durationLeft = samplesLeft * sampleDurationMean
  return now() + durationLeft
}

// The `combinationEnd` estimation is based on `stdev`.
//  - However `stdev` varies a lot and at different rates.
//  - This make `combinationEnd` change a lot from sample to sample.
// This eventually results in issues with `durationLeft` and the progress bar
// with a poor developer experience. They:
//  - Jitter
//  - Sometimes go backward
//  - Sometimes increase|decrease a lot for just a few samples
// We fix this by smoothing the change rate of `combinationEnd` between samples:
//  - We blend the previous `combinationEnd` with the new one
//  - We automatically compute the `smoothRatio` used to know how much those
//    two should be blended
// The `stdev` variation:
//  - Is mostly happening during:
//     - combination start, because `stdev` is imprecise due to the lower number
//       of loops
//     - temporary environment slowdowns
//  - In both cases, smoothing helps but does not eliminate those, i.e. user
//    might still experience `durationLeft`/`percentage` stalling or even
//    going backward
// `previousCombinationEnd` might be in the past due to that smoothing, so we
// need to use `Math.max(..., now())` on it.
const smoothCombinationEnd = ({
  combinationEnd,
  previousCombinationEnd,
  previewSamples,
  samplesLeft,
}) => {
  if (previewSamples === 0 || samplesLeft === 0) {
    return combinationEnd
  }

  const previousCombinationEndA = Math.max(previousCombinationEnd, now())
  const smoothRatio = getSmoothRatio(previewSamples, samplesLeft)
  return (
    previousCombinationEndA * smoothRatio + combinationEnd * (1 - smoothRatio)
  )
}

// `smoothRatio` decides how much the previous `combinationEnd` should be
// retained instead of the new one, in order to smooth the change rate.
// The smoothing is weaker at the beginning or end than the middle of the
// combination. This is because smoothing decreasing the accuracy of
// `combinationEnd` which is a problem at the:
//  - beginning: since the accuracy of stdev is still low, it should not be
//     retained for too long
//  - end: since the `combinationEnd` needs to fully converge so percentage
//    becomes `100%` and `durationLeft` 0
// We do this by making the smoothing proportional to the number of samples from
// either the start or the end:
//  - This also ensures that the smoothing is applied the same regardless of
//    the total number of samples
//     - In other words, the smoothing is relative to a percentage of the total
//       combination duration, not to a specific absolute number of samples
//  - The start refers to the first sample that shows a preview, not the first
//    sample measured, reported, nor calibrated.
//     - This ensures that the first `combinationEnd` always have the same
//       weight compared to the second one.
//     - We track this by incrementing `previewSamples` to excluded non-preview
//       samples
const getSmoothRatio = (previewSamples, samplesLeft) => {
  const samplesToEdge = Math.min(previewSamples, samplesLeft)
  const smoothSamples = samplesToEdge * ADJUSTED_SMOOTH_PERIOD
  return SMOOTH_CLOSENESS ** (1 / smoothSamples)
}

// Percentage of the total number of samples.
// A `combinationEnd` change takes that many samples to be almost fully
// integrated. How close is "almost" is decided by `SMOOTH_CLOSENESS`.
// For example, with 100 samples, if the previous `combinationEnd` is 100, the
// new one is 200 and they are not changing, then after 65 samples,
// `combinationEnd` would be at 195.
// A lower value reduces the smoothing done on non-lasting `combinationEnd`
// changes.
// A higher value makes lasting `combinationEnd` take longer to take effect.
const SMOOTH_PERIOD = 0.65
// Since `smoothPeriod` is applied proportionally to `samplesToEdge`, it is
// fully used in the middle of the benchmark, but not used at all in the start
// and end. Therefore, to keep the mean smoothPeriod, we need to multiply by 2.
const ADJUSTED_SMOOTH_PERIOD = SMOOTH_PERIOD * 2
// There is no reason to change this value instead of `SMOOTH_PERIOD` since it
// completely coupled to it: doing `SMOOTH_CLOSENESS **= number` has the same
// effect as doing `SMOOTH_PERIOD *= number`
const SMOOTH_CLOSENESS = 0.05
