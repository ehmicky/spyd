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
//  - Are eventually reset, which create confusion for stats like min or max
//  - Change a lot, creating flicker
export const addStats = function (
  stats,
  { measures, sampleLoops, repeatLast },
  minLoopDuration,
) {
  if (measures.length === 0) {
    return stats
  }

  const countStats = getCountStats(stats, {
    sampleLoops,
    repeatLast,
    minLoopDuration,
  })
  const computedStats = computeStats(measures)
  return { ...countStats, ...computedStats }
}

// Retrieve stats related to sampling itself, not the measures.
// `times` is the number of times `main()` was called
// `loops` is the number of repeat loops
// `repeat` is the average number of iterations inside those repeat loops
const getCountStats = function (
  { samples, loops, times },
  { sampleLoops, repeatLast, minLoopDuration },
) {
  const samplesA = samples + 1
  const loopsA = loops + sampleLoops
  const timesA = times + sampleLoops * repeatLast
  const meanRepeat = Math.round(timesA / loopsA)
  return {
    samples: samplesA,
    loops: loopsA,
    times: timesA,
    repeat: meanRepeat,
    minLoopDuration,
  }
}
