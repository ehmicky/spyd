import { mergeSort } from '../stats/merge.js'

import { normalizeSampleMeasures } from './normalize.js'
import { handleRepeat } from './repeat.js'

// Returns initial `sampleState`
export const getInitialSampleState = function () {
  return { measures: [], allSamples: 0, repeat: 1, calibrated: false }
}

// Update sampleState because on the return value from the last sample
export const getSampleState = function (
  { measures, allSamples, repeat, calibrated },
  { measures: sampleMeasures },
  { minLoopDuration, measureDuration },
) {
  const {
    sampleMeasures: sampleMeasuresA,
    sampleMedian,
    sampleLoops,
  } = normalizeSampleMeasures(sampleMeasures, repeat)
  const { newRepeat, calibrated: calibratedA } = handleRepeat({
    repeat,
    sampleMedian,
    minLoopDuration,
    allSamples,
    calibrated,
  })
  const measuresA = addSampleMeasures(measures, sampleMeasuresA, calibratedA)
  return {
    measures: measuresA,
    allSamples: allSamples + 1,
    sampleLoops,
    repeat: newRepeat,
    repeatLast: repeat,
    calibrated: calibratedA,
    measureDuration,
  }
}

// Aggregates `sampleMeasures` to `measures`.
// Sort them incrementally to the final `measures` big array, as opposed to
// sorting `measures` directly, which would be much slower.
const addSampleMeasures = function (measures, sampleMeasures, calibrated) {
  if (!calibrated) {
    return measures
  }

  mergeSort(measures, sampleMeasures)
  return measures
}

// We end running samples when the `measures` is over `MAX_MEASURES`.
// This is meant to prevent memory overflow.
// We also make sure `measures` is garbage-collectable between each combination.
// We could use a more elaborate logic to allow for the benchmark to continue
// even after reaching that threshold:
//  - For example, we could persist measures on the filesysystem, or aggregate
//    them in-memory
//  - However, needing more measures is unlikely to be needed:
//     - With a single step and max `precision`, the number of loops is:
//        - 4e4 with `rstdev` 10%
//        - 4e6 with `rstdev` 100%
//  - This assumption could be wrong in the following unlikely cases:
//     - A combination with hundreds of steps
//     - A `rstdev` > 100%, which is theoritically possible if the task duration
//       is exponential based on a random factor
export const hasMaxMeasures = function ({ measures }) {
  return measures.length >= MAX_MEASURES
}

// The default limit for V8 in Node.js is 1.7GB, which allows measures to hold a
// little more than 1e8 floats. We use a smaller number since this is not the
// only variable taking memory.
export const MAX_MEASURES = 1e7
