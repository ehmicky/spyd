import { aggregateMeasures } from './aggregate.js'
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
    aggregateCountdown,
    sampleDurationLast,
    stats,
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

  const newRepeat = getRepeat({ repeat, sampleMedian, minLoopDuration })
  const calibratedA = getCalibrated({
    calibrated,
    repeat,
    newRepeat,
    allSamples: allSamplesA,
  })

  const {
    measures: measuresB,
    bufferedMeasures: bufferedMeasuresC,
    aggregateCountdown: aggregateCountdownA,
    stats: statsA,
  } = aggregateMeasures({
    measures: measuresA,
    bufferedMeasures: bufferedMeasuresA,
    sampleMeasures: sampleMeasuresA,
    aggregateCountdown,
    stats,
    sampleDurationLast,
    calibrated: calibratedA,
  })

  return {
    measures: measuresB,
    bufferedMeasures: bufferedMeasuresC,
    samples: samplesB,
    allSamples: allSamplesA,
    loops: loopsB,
    loopsLast,
    times: timesB,
    repeat: newRepeat,
    repeatLast: repeat,
    calibrated: calibratedA,
    sampleMedian,
    aggregateCountdown: aggregateCountdownA,
    stats: statsA,
  }
}
