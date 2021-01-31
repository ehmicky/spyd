import now from 'precise-now'

import { computeStats } from '../stats/compute.js'
import { mergeSort } from '../stats/merge.js'

import { previewCombinations } from './preview.js'

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
//  - During calibration to recompute the `stats.median`
//  - At the beginning, or when `calibrateReset` has just been called, so
//    that there are some `measures` to compute the `stats.median`
export const aggregatePreview = async function ({
  newCombination,
  newCombination: {
    measures,
    aggregateCountdown,
    sampleDurationLast,
    calibrated,
  },
  combinations,
  previewState,
  previewConfig,
}) {
  if (calibrated && aggregateCountdown > 0 && measures.length !== 0) {
    return {
      ...newCombination,
      aggregateCountdown: aggregateCountdown - sampleDurationLast,
    }
  }

  const aggregateStart = getAggregateStart()
  const newCombinationA = aggregateMeasures(newCombination)
  await previewCombinations({
    combinations,
    newCombination: newCombinationA,
    previewState,
    previewConfig,
  })
  const aggregateCountdownA = getAggregateCountdown(aggregateStart)
  return { ...newCombinationA, aggregateCountdown: aggregateCountdownA }
}

// Performed both incrementally, and once at the end.
export const aggregateMeasures = function ({
  measures,
  bufferedMeasures,
  ...combination
}) {
  if (bufferedMeasures.length === 0) {
    return { ...combination, measures, bufferedMeasures }
  }

  addBufferedMeasures(measures, bufferedMeasures)
  const stats = computeStats(measures)
  return { ...combination, measures, bufferedMeasures: [], stats }
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
  return aggregateDuration / AGGREGATE_PERCENTAGE
}

// How much duration of the benchmark should be spent aggregating.
// A higher value spends less duration measuring, giving less precise results.
// A lower value spends less duration aggregating, resulting in less responsive
// preview and less precise `stats.median`.
const AGGREGATE_PERCENTAGE = 0.1
