import { bufferMeasures } from './buffer.js'
import { calibrateReset } from './calibrate.js'
import { getRepeat } from './repeat.js'

// Handle return value from the last sample
// eslint-disable-next-line max-statements, max-lines-per-function
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

  const samplesA = samples + 1
  const allSamplesA = allSamples + 1
  const loopsLast = sampleMeasures.length
  const loopsA = loops + loopsLast
  const timesA = times + loopsLast * repeat

  const { bufferedMeasures: bufferedMeasuresA, sampleMedian } = bufferMeasures({
    sampleMeasures,
    bufferedMeasures,
    repeat,
  })

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
