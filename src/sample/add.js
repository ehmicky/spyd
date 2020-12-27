import { mergeSort } from '../stats/merge.js'
import { sortFloats } from '../stats/sort.js'

// Add all not-merged-yet measures from the last samples.
// Sort them incrementally to the final `measures` big array, as opposed to
// sorting `measures` directly, which would be much slower.
// The measures are also normalized from mainMeasures + repeat.
export const addBufferedMeasures = function (measures, bufferedMeasures) {
  bufferedMeasures.forEach(({ mainMeasures, repeat }) => {
    addMeasures(measures, mainMeasures, repeat)
  })
}

const addMeasures = function (measures, mainMeasures, repeat) {
  const newMeasures = normalizeMainMeasures(mainMeasures, repeat)
  sortFloats(newMeasures)
  mergeSort(measures, newMeasures)
}

// The runner measures loops of the task. This retrieve the mean time to execute
// the task each time, from the time to execute the whole loop.
const normalizeMainMeasures = function (mainMeasures, repeat) {
  if (repeat === 1) {
    return mainMeasures
  }

  // Somehow this is faster than direct mutation, providing `mainMeasures` is
  // not used anymore after this function and can be garbage collected.
  return mainMeasures.map((mainMeasure) => mainMeasure / repeat)
}
