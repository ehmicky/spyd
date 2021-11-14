import { appendArray } from '../../stats/append.js'
import { mergeSort } from '../../stats/merge.js'

import { normalizeSampleMeasures } from './normalize.js'
import { handleRepeat } from './repeat.js'

// Returns initial `sampleState`
export const getInitialSampleState = function () {
  return {
    measures: [],
    unsortedMeasures: [],
    allSamples: 0,
    repeat: 1,
    calibrated: false,
  }
}

// Update sampleState because on the return value from the last sample
export const getSampleState = function (
  { measures, unsortedMeasures, allSamples, repeat, calibrated },
  { measures: sampleMeasures },
  { minLoopDuration, measureDuration },
) {
  const {
    sampleSortedMeasures,
    sampleUnsortedMeasures,
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
  const { measures: measuresA, unsortedMeasures: unsortedMeasuresA } =
    addSampleMeasures({
      measures,
      unsortedMeasures,
      sampleSortedMeasures,
      sampleUnsortedMeasures,
      calibrated,
    })
  return {
    measures: measuresA,
    unsortedMeasures: unsortedMeasuresA,
    allSamples: allSamples + 1,
    sampleLoops,
    repeat: newRepeat,
    repeatLast: repeat,
    calibrated: calibratedA,
    measureDuration,
  }
}

// Appends `sampleSortedMeasures` to `measures`.
// Sort them incrementally to the final `measures` big array, as opposed to
// sorting `measures` directly, which would be much slower.
// Also appends `sampleUnsortedMeasures` to `unsortedMeasures` but without
// sorting.
const addSampleMeasures = function ({
  measures,
  unsortedMeasures,
  sampleSortedMeasures,
  sampleUnsortedMeasures,
  calibrated,
}) {
  if (!calibrated) {
    return { measures, unsortedMeasures }
  }

  mergeSort(measures, sampleSortedMeasures)
  appendArray(unsortedMeasures, sampleUnsortedMeasures)
  return { measures, unsortedMeasures }
}
