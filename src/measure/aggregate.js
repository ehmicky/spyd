import now from 'precise-now'

import { computeStats } from '../stats/compute.js'
import { mergeSort } from '../stats/merge.js'

import { updatePreviewReport } from './preview_report.js'
import { isRemainingCombination } from './remaining.js'

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
  combination,
  combination: { aggregateCountdown, sampleDurationLast, bufferedMeasures },
  previewConfig,
  previewState,
  minLoopDuration,
  duration,
  exec,
  stopState,
}) {
  const aggregateCountdownA = aggregateCountdown - sampleDurationLast

  if (
    !shouldAggregate({
      aggregateCountdown: aggregateCountdownA,
      bufferedMeasures,
      combination,
      duration,
      exec,
      stopState,
    })
  ) {
    return { ...combination, aggregateCountdown: aggregateCountdownA }
  }

  const aggregateStart = getAggregateStart()
  const combinationA = aggregateMeasures(combination, minLoopDuration)
  await updatePreviewReport({
    combination: combinationA,
    previewConfig,
    previewState,
  })
  const aggregateCountdownB = getAggregateCountdown(aggregateStart)
  return { ...combinationA, aggregateCountdown: aggregateCountdownB }
}

// We do not recompute during calibration or when there are no new buffered
// measures to aggregate.
// We also recompute on the last sample.
const shouldAggregate = function ({
  aggregateCountdown,
  bufferedMeasures,
  combination,
  duration,
  exec,
  stopState,
}) {
  return (
    bufferedMeasures.length !== 0 &&
    (aggregateCountdown <= 0 ||
      !isRemainingCombination({ combination, duration, exec, stopState }))
  )
}

const aggregateMeasures = function (
  { measures, bufferedMeasures, ...combination },
  minLoopDuration,
) {
  addBufferedMeasures(measures, bufferedMeasures)
  const stats = computeStats(measures, combination, minLoopDuration)
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
