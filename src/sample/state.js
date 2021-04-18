import { mergeSort } from '../stats/merge.js'

import { normalizeSampleMeasures } from './normalize.js'
import { handleRepeat } from './repeat.js'

// Returns initial `sampleState`
export const getInitialSampleState = function () {
  return {
    measures: [],
    allSamples: 0,
    previewSamples: 0,
    repeat: 1,
    calibrated: false,
  }
}

// Update sampleState because on the return value from the last sample
export const getSampleState = function (
  { measures, allSamples, previewSamples, repeat, calibrated },
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
    previewSamples,
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

// We end running samples when the `measures` is over `MAX_MEASURES`. This
// is meant to prevent memory overflow.
// The default limit for V8 in Node.js is 1.7GB, which allows measures to hold a
// little more than 1e8 floats.
export const hasMaxMeasures = function ({ measures }) {
  return measures.length >= MAX_MEASURES
}

const MAX_MEASURES = 1e8
