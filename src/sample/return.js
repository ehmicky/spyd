import { computeStats } from '../stats/compute.js'
import { mergeSort } from '../stats/merge.js'

import { normalizeSampleMeasures } from './normalize.js'
import { handleRepeat } from './repeat.js'

// Handle return value from the last sample
// eslint-disable-next-line max-lines-per-function
export const handleReturnValue = function (
  { measures, stats, allSamples, samples, loops, times, repeat, calibrated },
  { measures: sampleMeasures },
  minLoopDuration,
) {
  if (sampleMeasures === undefined) {
    return {}
  }

  const {
    sampleMeasures: sampleMeasuresA,
    sampleMedian,
    sampleLoops,
  } = normalizeSampleMeasures(sampleMeasures, repeat)

  const { newRepeat, calibrated: calibratedA } = handleRepeat({
    repeat,
    sampleMedian,
    minLoopDuration,
    allSamples,
    calibrated,
  })
  const {
    measures: measuresA,
    stats: statsA,
    allSamples: allSamplesA,
    samples: samplesA,
    loops: loopsA,
    times: timesA,
  } = addStats({
    measures,
    sampleMeasures: sampleMeasuresA,
    stats,
    allSamples,
    samples,
    loops,
    sampleLoops,
    times,
    repeat,
    calibrated: calibratedA,
    minLoopDuration,
  })

  return {
    measures: measuresA,
    stats: statsA,
    samples: samplesA,
    allSamples: allSamplesA,
    loops: loopsA,
    sampleLoops,
    times: timesA,
    repeat: newRepeat,
    repeatLast: repeat,
    calibrated: calibratedA,
  }
}

// Compute new `stats` based on the `sampleMeasures`.
// This includes aggregating `sampleMeasures` to `measures`.
//   - sort them incrementally to the final `measures` big array, as opposed to
//     sorting `measures` directly, which would be much slower.
// We perform this after each sample, not after several samples because:
//  - If the number of samples was based on how long aggregation takes,
//    aggregation would happen at longer and longer intervals, creating big
//    and infrequent slowdowns.
//  - This allows using any `stats` in the sample logic
// Uncalibrated stats are removed because they:
//  - Are eventually reset, which create confusion for stats like min or max
//  - Change a lot, creating flicker
const addStats = function ({
  measures,
  sampleMeasures,
  stats,
  allSamples,
  samples,
  loops,
  sampleLoops,
  times,
  repeat,
  calibrated,
  minLoopDuration,
}) {
  const allSamplesA = allSamples + 1

  if (!calibrated) {
    return { measures, stats, allSamples: allSamplesA, samples, loops, times }
  }

  const samplesA = samples + 1
  const loopsA = loops + sampleLoops
  const timesA = times + sampleLoops * repeat

  mergeSort(measures, sampleMeasures)
  const statsA = computeStats({
    measures,
    samples: samplesA,
    loops: loopsA,
    times: timesA,
    minLoopDuration,
  })

  return {
    measures,
    stats: statsA,
    allSamples: allSamplesA,
    samples: samplesA,
    loops: loopsA,
    times: timesA,
  }
}
