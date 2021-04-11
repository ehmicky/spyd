import { getSortedMedian } from '../stats/quantile.js'
import { sortFloats } from '../stats/sort.js'

// Normalize `sampleMeasures` by dividing `repeat` and sorting.
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
