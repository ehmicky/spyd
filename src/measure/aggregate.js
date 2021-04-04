import { computeStats } from '../stats/compute.js'
import { mergeSort } from '../stats/merge.js'

import { updatePreviewReport } from './preview_report.js'

// Aggregate `bufferedMeasures` to `measures`.
// The `stats` need a single `measures` array, so they are computed right after.
// We perform this after each sample, not after several samples because:
//  - If the number of samples was based on how long aggregation takes,
//    aggregation would happen at longer and longer intervals, creating big
//    and infrequent slowdowns.
//  - This allows using any `stats` in the sample logic
export const aggregatePreview = async function ({
  combination,
  combination: { bufferedMeasure },
  previewConfig,
  previewState,
  minLoopDuration,
}) {
  if (bufferedMeasure === undefined) {
    return combination
  }

  const combinationA = aggregateMeasures(combination, minLoopDuration)
  await updatePreviewReport({
    combination: combinationA,
    previewConfig,
    previewState,
  })
  return combinationA
}

// Add all measures from the sample.
// Sort them incrementally to the final `measures` big array, as opposed to
// sorting `measures` directly, which would be much slower.
const aggregateMeasures = function (
  { measures, bufferedMeasure, ...combination },
  minLoopDuration,
) {
  mergeSort(measures, bufferedMeasure)
  const stats = computeStats(measures, combination, minLoopDuration)
  return { ...combination, measures, bufferedMeasure: undefined, stats }
}
