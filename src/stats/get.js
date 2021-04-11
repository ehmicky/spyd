import { computeStats } from './compute.js'

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
export const getStats = function ({
  stats,
  measures,
  sampleLoops,
  repeat,
  minLoopDuration,
}) {
  const countStats = getCountStats(stats, {
    sampleLoops,
    repeat,
    minLoopDuration,
  })
  const computedStats = computeStats(measures)
  const statsA = { ...countStats, ...computedStats }
  return statsA
}

// Retrieve stats related to sampling itself, not the measures
const getCountStats = function (
  { samples, loops, times },
  { sampleLoops, repeat, minLoopDuration },
) {
  const samplesA = samples + 1
  const loopsA = loops + sampleLoops
  const timesA = times + sampleLoops * repeat
  const meanRepeat = Math.round(times / loops)
  return {
    samples: samplesA,
    loops: loopsA,
    times: timesA,
    repeat: meanRepeat,
    minLoopDuration,
  }
}

// Returns initial `stats`
export const getInitialStats = function () {
  return { samples: 0, loops: 0, times: 0 }
}
