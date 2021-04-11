import { addStats } from '../stats/add.js'

import { normalizeSampleMeasures } from './normalize.js'
import { handleRepeat } from './repeat.js'

// Returns initial `sampleState`
export const getInitialSampleState = function () {
  return {
    measures: [],
    allSamples: 0,
    repeat: 1,
    calibrated: false,
    totalDuration: 0,
  }
}

// Update sampleState because on the return value from the last sample
export const getSampleState = function ({
  stats,
  sampleState,
  sampleState: { measures, allSamples, repeat, calibrated },
  returnValue: { measures: sampleMeasures },
  minLoopDuration,
}) {
  if (sampleMeasures === undefined) {
    return {}
  }

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
  const {
    stats: statsA,
    measures: measuresA,
    allSamples: allSamplesA,
  } = addStats({
    stats,
    measures,
    sampleMeasures: sampleMeasuresA,
    allSamples,
    sampleLoops,
    repeat,
    calibrated: calibratedA,
    minLoopDuration,
  })
  const sampleStateA = {
    ...sampleState,
    measures: measuresA,
    allSamples: allSamplesA,
    sampleLoops,
    repeat: newRepeat,
    repeatLast: repeat,
    calibrated: calibratedA,
  }
  return { stats: statsA, sampleState: sampleStateA }
}
