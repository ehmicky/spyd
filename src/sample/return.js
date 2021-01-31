import { calibrateReset, getCalibrated } from './calibrate.js'
import { normalizeSampleMeasures } from './normalize.js'
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

  const [
    measuresA,
    bufferedMeasuresA,
    samplesA,
    loopsA,
    timesA,
  ] = calibrateReset({
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

  const {
    sampleMeasures: sampleMeasuresA,
    sampleMedian,
  } = normalizeSampleMeasures(sampleMeasures, repeat)
  const bufferedMeasuresB = [...bufferedMeasuresA, sampleMeasuresA]

  const newRepeat = getRepeat({ repeat, sampleMedian, minLoopDuration })
  const calibratedA = getCalibrated({
    calibrated,
    repeat,
    newRepeat,
    allSamples: allSamplesA,
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
    sampleMedian,
  }
}
