import { computeStats } from './compute.js'

// Returns initial `stats`
export const getInitialStats = function () {
  return { samples: 0, loops: 0, times: 0 }
}

// Compute new `stats` based on the `sampleState`.
// We perform this after each sample, not after several samples because:
//  - If the number of samples was based on how long aggregation takes,
//    aggregation would happen at longer and longer intervals, creating big
//    and infrequent slowdowns.
//  - This allows using any `stats` in the sample logic
// Uncalibrated stats are removed because they:
//  - Are eventually reset, which create confusion for stats like min|max
//  - Change a lot, creating flicker
// Some stats can be `undefined`:
//   - all: in combinations not measured yet, nor saved
//   - mean, rstdev, moe, rmoe, outliersMin, outliersMax, samples, loops, times,
//     repeat, minLoopDuration: when `reporter.capabilities.debugStats` is false
//   - mean: when `showPrecision` is true
//   - moe, rmoe, meanMin, meanMax, outliersMin, outliersMax: when
//    `showPrecision` is false
//   - stdev, rstdev, moe, rmoe, meanMin, meanMax: when loops < 5
//      - This means both mean and meanMin|meanMax might be `undefined` while
//        other stats are not
//      - This might differ between combinations of the same result
//   - diff, diffPrecise: when either `showDiff` is false or there is no
//     previous combination
// Stat types:
//   - samples, loops, times, repeat, minLoopDuration, diffLimit: integer
//   - min, max, median, mean, meanMin, meanMax, stdev, rstdev, moe, rmoe,
//     outliersMin, outliersMax, diff: float
//   - diffPrecise: boolean
//   - quantiles: array of floats
//   - histogram: array of objects
//      - histogram[*].start|end|frequency: float
// Stat constraints:
//   - samples, loops, times, repeat, minLoopDuration, histogram[*].end: >0
//   - min, max, median, mean, stdev, rstdev, moe, rmoe, meanMin, meanMax,
//     diff, quantiles[*], histogram[*].start|frequency: >=0
//      - mean 0 is unlikely and impossible in saved results (except the
//        last/current result and if the unit is `boolean`)
//   - outliersMin, outliersMax: >=0 <=1
//   - histogram[*].end: <=1
export const addStats = function ({
  stats,
  sampleState,
  sampleState: { measures, unsortedMeasures, sampleLoops, sampleTimes },
  minLoopDuration,
  outliers,
  precisionTarget,
}) {
  if (measures.length === 0) {
    return { stats, sampleState }
  }

  const countStats = getCountStats(stats, {
    sampleLoops,
    sampleTimes,
    minLoopDuration,
  })
  const { coldLoopsTarget, ...computedStats } = computeStats({
    measures,
    unsortedMeasures,
    outliers,
    precisionTarget,
  })
  return {
    stats: { ...countStats, ...computedStats },
    sampleState: { ...sampleState, coldLoopsTarget },
  }
}

// Retrieve stats related to sampling itself, not the measures.
// `times` is the number of times `main()` was called
// `loops` is the number of repeat loops
// `repeat` is the average number of iterations inside those repeat loops
const getCountStats = function (
  { samples, loops, times },
  { sampleLoops, sampleTimes, minLoopDuration },
) {
  const samplesA = samples + 1
  const loopsA = loops + sampleLoops
  const timesA = times + sampleTimes
  const meanRepeat = Math.round(timesA / loopsA)
  return {
    samples: samplesA,
    loops: loopsA,
    times: timesA,
    repeat: meanRepeat,
    minLoopDuration,
  }
}
