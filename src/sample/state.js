import { addStats } from '../stats/add.js'

import { normalizeSampleMeasures } from './normalize.js'
import { handleRepeat } from './repeat.js'

// Returns initial `sampleState`
export const getInitialSampleState = function () {
  return {
    measures: [],
    stats: { samples: 0, loops: 0, times: 0 },
    allSamples: 0,
    repeat: 1,
    calibrated: false,
  }
}

// Update sampleState because on the return value from the last sample
export const getSampleState = function (
  { stats, measures, allSamples, repeat, calibrated },
  { measures: sampleMeasures },
  minLoopDuration,
) {
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

  return {
    stats: statsA,
    measures: measuresA,
    allSamples: allSamplesA,
    sampleLoops,
    repeat: newRepeat,
    repeatLast: repeat,
    calibrated: calibratedA,
  }
}
