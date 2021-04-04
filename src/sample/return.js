import { addStats } from '../stats/add.js'

import { normalizeSampleMeasures } from './normalize.js'
import { handleRepeat } from './repeat.js'

// Handle return value from the last sample
// eslint-disable-next-line max-lines-per-function
export const handleReturnValue = function (
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
    samples: samplesA,
    allSamples: allSamplesA,
    loops: loopsA,
    sampleLoops,
    times: timesA,
    repeat: newRepeat,
    repeatLast: repeat,
    calibrated: calibratedA,
  }
}
