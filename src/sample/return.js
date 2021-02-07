import { bufferMeasures } from './buffer.js'
import { calibrateReset, getCalibrated } from './calibrate.js'
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
  duration,
) {
  if (sampleMeasures === undefined) {
    return {}
  }

  const {
    measures: measuresA,
    bufferedMeasures: bufferedMeasuresA,
    samples: samplesA,
    loops: loopsA,
    times: timesA,
  } = calibrateReset({
    calibrated,
    measures,
    bufferedMeasures,
    samples,
    loops,
    times,
  })

  const samplesB = samplesA + 1
  const allSamplesA = allSamples + 1
  const loopsLast = sampleMeasures.length
  const loopsB = loopsA + loopsLast
  const timesB = timesA + loopsLast * repeat

  const { bufferedMeasures: bufferedMeasuresB, sampleMedian } = bufferMeasures({
    sampleMeasures,
    bufferedMeasures: bufferedMeasuresA,
    repeat,
  })

  const { newRepeat, coldStart } = getRepeat({
    repeat,
    sampleMedian,
    minLoopDuration,
    allSamples,
  })
  const calibratedA = getCalibrated({
    calibrated,
    repeat,
    newRepeat,
    coldStart,
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
