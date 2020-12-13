import { mergeSort } from '../stats/merge.js'
import { sortFloats } from '../stats/sort.js'

import { loopDurationsToMedians } from './normalize.js'

// Add all not-merged-yet measures from the last processes.
// Sort them incrementally to the final `measures` big array, as opposed to
// sorting `measures` directly, which would be much slower.
// The measures are also normalized from loopDurations + repeat.
export const addProcessMeasures = function (measures, processMeasures) {
  processMeasures.forEach(({ loopDurations, repeat }) => {
    addMeasures(measures, loopDurations, repeat)
  })
}

const addMeasures = function (measures, loopDurations, repeat) {
  const newMeasures = loopDurationsToMedians(loopDurations, repeat)
  sortFloats(newMeasures)
  mergeSort(measures, newMeasures)
}
