import { calibrateReset } from './calibrate.js'
import { normalizeSampleMeasures } from './normalize.js'
import { getRepeat } from './repeat.js'

// Handle return value from the last sample
// eslint-disable-next-line max-lines-per-function
export const handleReturnValue = function (
  {
    measures,
    bufferedMeasures,
    allSamples,
    samples,
    loops,
    times,
    repeat,
    calibrated,
    minLoopDuration,
  },
  { measures: sampleMeasures },
) {
  if (sampleMeasures === undefined) {
    return {}
  }

  const loopsLast = sampleMeasures.length
  const {
    samples: samplesA,
    allSamples: allSamplesA,
    loops: loopsA,
    times: timesA,
  } = incrementCounts({
    samples,
    allSamples,
    loops,
    loopsLast,
    times,
    repeat,
  })

  const {
    sampleMeasures: sampleMeasuresA,
    sampleMedian,
  } = normalizeSampleMeasures(sampleMeasures, repeat)
  const bufferedMeasuresA = [...bufferedMeasures, sampleMeasuresA]

  const { newRepeat, coldStart } = getRepeat({
    repeat,
    sampleMedian,
    minLoopDuration,
    allSamples: allSamplesA,
  })
  const {
    calibrated: calibratedA,
    measures: measuresA,
    bufferedMeasures: bufferedMeasuresB,
    samples: samplesB,
    loops: loopsB,
    times: timesB,
  } = calibrateReset({
    calibrated,
    repeat,
    newRepeat,
    coldStart,
    measures,
    bufferedMeasures: bufferedMeasuresA,
    samples: samplesA,
    loops: loopsA,
    times: timesA,
  })

  return {
    measures: measuresA,
    bufferedMeasures: bufferedMeasuresB,
    samples: samplesB,
    allSamples: allSamplesA,
    loops: loopsB,
    loopsLast,
    times: timesB,
    repeat: newRepeat,
    repeatLast: repeat,
    calibrated: calibratedA,
  }
}

const incrementCounts = function ({
  samples,
  allSamples,
  loops,
  loopsLast,
  times,
  repeat,
}) {
  return {
    samples: samples + 1,
    allSamples: allSamples + 1,
    loops: loops + loopsLast,
    times: times + loopsLast * repeat,
  }
}
