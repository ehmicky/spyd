import { getSortedMedian } from '../../stats/quantile.js'
import { sortFloats } from '../../stats/sort.js'

// Normalize `sampleMeasures` by dividing `repeat` and sorting.
// We use the `sampleMedian` instead of `stats.median`:
//  - So that `repeat` adjusts to slowdowns of the task (for example due to
//    competing processes).
//  - It makes the initial calibration phase shorter. This leads to more
//    stable `max` and `stdev` stats.
// We use the `sampleMedian` instead of the `sampleMean` because:
//  - The duration of faster measures is more important than slower here when
//    it comes to `repeat` callibration, since those are the ones being fixed
//    by it.
//  - It is more stable
//  - It is faster to compute since we need to sort `sampleMeasures` anyway
export const normalizeSampleMeasures = function (sampleMeasures, repeat) {
  const sampleMeasuresA = normalizeRepeat(sampleMeasures, repeat)
  sortFloats(sampleMeasuresA)
  const sampleMedian = getSortedMedian(sampleMeasuresA)
  const sampleLoops = sampleMeasuresA.length
  return { sampleMeasures: sampleMeasuresA, sampleMedian, sampleLoops }
}

// The runner measures loops of the task. This retrieve the mean time to execute
// the task each time, from the time to execute the whole loop.
const normalizeRepeat = function (sampleMeasures, repeat) {
  if (repeat === 1) {
    return sampleMeasures
  }

  // Somehow this is faster than direct mutation, providing `sampleMeasures` is
  // not used anymore after this function and can be garbage collected.
  return sampleMeasures.map((sampleMeasure) => sampleMeasure / repeat)
}
