import { mergeSort } from '../../stats/merge.js'

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
