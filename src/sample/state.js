import { addStats } from '../stats/add.js'

import { normalizeSampleMeasures } from './normalize.js'
import { handleRepeat } from './repeat.js'

// Returns initial `sampleState`
export const getInitialSampleState = function () {
  return {
    measures: [],
    stats: {},
    allSamples: 0,
    samples: 0,
    loops: 0,
    times: 0,
    repeat: 1,
    calibrated: false,
  }
}

// Update sampleState because on the return value from the last sample
// eslint-disable-next-line max-lines-per-function
export const getSampleState = function (
  { measures, stats, allSamples, samples, loops, times, repeat, calibrated },
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
    measures: measuresA,
    stats: statsA,
    allSamples: allSamplesA,
    samples: samplesA,
    loops: loopsA,
    times: timesA,
  } = addStats({
    measures,
    sampleMeasures: sampleMeasuresA,
    stats,
    allSamples,
    samples,
    loops,
    sampleLoops,
    times,
    repeat,
    calibrated: calibratedA,
    minLoopDuration,
  })

  return {
    measures: measuresA,
    stats: statsA,
    allSamples: allSamplesA,
    samples: samplesA,
    loops: loopsA,
    sampleLoops,
    times: timesA,
    repeat: newRepeat,
    repeatLast: repeat,
    calibrated: calibratedA,
  }
}
