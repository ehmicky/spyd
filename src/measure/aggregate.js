import now from 'precise-now'

import { computeStats } from '../stats/compute.js'

import { addProcessMeasures } from './add.js'

// Aggregate `processMeasures` to `measures`.
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
  processMeasures,
  stats,
  aggregateCountdown,
  sampleDurationLast,
  repeatInit,
}) {
  if (!repeatInit && aggregateCountdown > 0 && measures.length !== 0) {
    return {
      processMeasures,
      stats,
      aggregateCountdown: aggregateCountdown - sampleDurationLast,
    }
  }

  const aggregateStart = getAggregateStart()

  addProcessMeasures(measures, processMeasures)
  const statsA = computeStats(measures)

  const aggregateCountdownA = getAggregateCountdown(aggregateStart)
  return {
    processMeasures: [],
    stats: statsA,
    aggregateCountdown: aggregateCountdownA,
  }
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
