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
  minLoopDuration,
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
  }
}

const addSampleMeasures = function (measures, sampleMeasures, calibrated) {
  if (!calibrated) {
    return measures
  }

  mergeSort(measures, sampleMeasures)
  return measures
}
