import { getSortedMedian } from '../stats/median.js'
import { sortFloats } from '../stats/sort.js'

// Add `sampleMeasures` to `bufferedMeasures`
export const addSampleMeasures = function (
  sampleMeasures,
  bufferedMeasures,
  repeat,
) {
  const sampleMeasuresA = normalizeSampleMeasures(sampleMeasures, repeat)
  const sampleMedian = getSortedMedian(sampleMeasuresA)
  const bufferedMeasuresA = [...bufferedMeasures, sampleMeasuresA]
  return { bufferedMeasures: bufferedMeasuresA, sampleMedian }
}

// Normalize `sampleMeasures` by dividing `repeat` and sorting.
const normalizeSampleMeasures = function (sampleMeasures, repeat) {
  const sampleMeasuresA = normalizeRepeat(sampleMeasures, repeat)
  sortFloats(sampleMeasuresA)
  return sampleMeasuresA
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
