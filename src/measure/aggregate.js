import now from 'precise-now'

import { computeStats } from '../stats/compute.js'
import { mergeSort } from '../stats/merge.js'

import { setPreviewReport } from './preview_report.js'

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
export const aggregatePreview = async function ({
  newCombination,
  newCombination: { aggregateCountdown, sampleDurationLast, bufferedMeasures },
  combinations,
  index,
  previewConfig,
  previewState,
}) {
  const aggregateCountdownA = aggregateCountdown - sampleDurationLast

  if (!shouldAggregate(aggregateCountdownA, bufferedMeasures)) {
    return { ...newCombination, aggregateCountdown: aggregateCountdownA }
  }

  const aggregateStart = getAggregateStart()
  const newCombinationA = aggregateMeasures(newCombination)
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  combinations[index] = newCombinationA
  await setPreviewReport({ combinations, previewConfig, previewState })
  const aggregateCountdownB = getAggregateCountdown(aggregateStart)
  return { ...newCombinationA, aggregateCountdown: aggregateCountdownB }
}

// We do not recompute during calibration or when there are no new buffered
// measures to aggregate
const shouldAggregate = function (aggregateCountdown, bufferedMeasures) {
  return aggregateCountdown <= 0 && bufferedMeasures.length !== 0
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
const addBufferedMeasures = function (
  measures,
  [sampleMeasures, ...bufferedMeasures],
) {
  // As time passes, `bufferedMeasures` becomes much smaller than `measures`,
  // so it is more efficient to sort them together first.
  bufferedMeasures.forEach((sampleMeasuresA) => {
    mergeSort(sampleMeasures, sampleMeasuresA)
  })

  mergeSort(measures, sampleMeasures)
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
