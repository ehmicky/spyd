import { addSampleMeasures } from './add.js'
import { aggregateMeasures } from './aggregate.js'
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
    bufferedMeasures: bufferedMeasuresB,
    sampleMedian,
  } = addSampleMeasures(sampleMeasures, bufferedMeasuresA, repeat)
  const [
    measuresB,
    bufferedMeasuresC,
    statsA,
    aggregateCountdownA,
  ] = aggregateMeasures({
    measures: measuresA,
    bufferedMeasures: bufferedMeasuresB,
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
    bufferedMeasures: bufferedMeasuresC,
    samples: samplesB,
    loops: loopsB,
    loopsLast,
    times: timesB,
    repeat: newRepeat,
    repeatLast: repeat,
    calibrated: calibratedA,
    sampleMedian,
    stats: statsA,
    aggregateCountdown: aggregateCountdownA,
  }
}
