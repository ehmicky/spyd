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
    stats,
    aggregateCountdown,
    sampleDurationLast,
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
  const loopsLast = sampleMeasures.length
  const loopsB = loopsA + loopsLast
  const timesB = timesA + loopsLast * repeat

  const {
    sampleMeasures: sampleMeasuresA,
    sampleMedian,
  } = normalizeSampleMeasures(sampleMeasures, repeat)
  const [
    measuresB,
    bufferedMeasuresB,
    statsA,
    aggregateCountdownA,
  ] = aggregateMeasures({
    measures: measuresA,
    bufferedMeasures: bufferedMeasuresA,
    sampleMeasures: sampleMeasuresA,
    stats,
    aggregateCountdown,
    sampleDurationLast,
    calibrated,
  })

  const newRepeat = getRepeat({ repeat, sampleMedian, minLoopDuration })
  const calibratedA = getCalibrated({
    calibrated,
    repeat,
    newRepeat,
    allSamples,
  })

  return {
    measures: measuresB,
    bufferedMeasures: bufferedMeasuresB,
    samples: samplesB,
    loops: loopsB,
    loopsLast,
    times: timesB,
    repeat: newRepeat,
    calibrated: calibratedA,
    sampleMedian,
    stats: statsA,
    aggregateCountdown: aggregateCountdownA,
  }
}
