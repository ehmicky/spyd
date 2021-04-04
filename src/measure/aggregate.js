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
  combination: { sampleDurationLast, bufferedMeasures },
  previewConfig,
  previewState,
  minLoopDuration,
}) {
  if (bufferedMeasures.length === 0) {
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
const addBufferedMeasures = function (measures, bufferedMeasures) {
  bufferedMeasures.forEach((sampleMeasures) => {
    mergeSort(measures, sampleMeasures)
  })
}
