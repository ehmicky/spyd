import now from 'precise-now'

import { computeStats, addSideStats } from '../stats/compute.js'
import { mergeSort } from '../stats/merge.js'

// Aggregate `bufferedMeasures` to `measures`.
// The `stats` need a single `measures` array, so they are computed right after.
// Since this is CPU-heavy, this is done incrementally after one or several
// samples, as opposed to at the end of the benchmark. This is because:
//  - Stats are reported in realtime
//  - This avoids a big slowdown at the end of the benchmark, which would be
//    perceived by users
// We aim at performing this for a specific percentage of the total duration.
// We do this by computing how long each aggregation takes, then waiting a
// specific amount of duration based on that last aggregation duration.
// We always recompute this:
//  - During `repeatInit` to recompute the `stats.median`
//  - At the beginning, or when `repeatInitReset` has just been called, so
//    that there are some `measures` to compute the `stats.median`
export const aggregateMeasures = function ({
  measures,
  bufferedMeasures,
  stats,
  aggregateCountdown,
  sampleDurationLast,
  repeatInit,
}) {
  if (!repeatInit && aggregateCountdown > 0 && measures.length !== 0) {
    const aggregateCountdownA = aggregateCountdown - sampleDurationLast
    return [measures, bufferedMeasures, stats, aggregateCountdownA]
  }

  const aggregateStart = getAggregateStart()
  const { measures: measuresA, stats: statsA } = aggregateBuffer(
    measures,
    bufferedMeasures,
  )
  const aggregateCountdownB = getAggregateCountdown(aggregateStart)
  return [measuresA, [], statsA, aggregateCountdownB]
}

// At the end, if there are still some pending `bufferedMeasures`, we aggregate
// them
export const getFinalStats = function ({
  measures,
  bufferedMeasures,
  stats,
  loops,
  times,
  samples,
  minLoopDuration,
}) {
  const statsA = aggregateMeasuresEnd({ measures, bufferedMeasures, stats })
  const statsB = addSideStats({
    stats: statsA,
    loops,
    times,
    samples,
    minLoopDuration,
  })
  return statsB
}

const aggregateMeasuresEnd = function ({ measures, bufferedMeasures, stats }) {
  if (bufferedMeasures.length === 0) {
    return stats
  }

  const { stats: statsA } = aggregateBuffer(measures, bufferedMeasures)
  return statsA
}

const aggregateBuffer = function (measures, bufferedMeasures) {
  addBufferedMeasures(measures, bufferedMeasures)
  const stats = computeStats(measures)
  return { measures, stats }
}

// Add all not-merged-yet measures from the last samples.
// Sort them incrementally to the final `measures` big array, as opposed to
// sorting `measures` directly, which would be much slower.
// The measures are also normalized from sampleMeasures + repeat.
const addBufferedMeasures = function (measures, bufferedMeasures) {
  bufferedMeasures.forEach((sampleMeasures) => {
    mergeSort(measures, sampleMeasures)
  })
}

const getAggregateStart = function () {
  return now()
}

// Retrieve duration that should be spent measuring before doing another
// aggregate. This increases as the benchmark lasts longer.
const getAggregateCountdown = function (aggregateStart) {
  const aggregateDuration = now() - aggregateStart
  return aggregateDuration * AGGREGATE_TIMES
}

// How much duration of the benchmark should be spent aggregating.
// A higher value spends less duration measuring, giving less precise results.
// A lower value spends less duration aggregating, resulting in less responsive
// live reporting and less precise `stats.median`.
const AGGREGATE_PERCENTAGE = 0.1
const AGGREGATE_TIMES = 1 / AGGREGATE_PERCENTAGE - 1
