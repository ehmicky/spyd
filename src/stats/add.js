import { computeStats } from './compute.js'
import { mergeSort } from './merge.js'

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
export const addStats = function ({
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
