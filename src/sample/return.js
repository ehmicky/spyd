import { aggregateMeasures } from './aggregate.js'
import { calibrateReset, getCalibrated } from './calibrate.js'
import { getMeasureDuration } from './measure_duration.js'
import { normalizeSampleMeasures } from './normalize.js'
import { getRepeat } from './repeat.js'

// Handle return value from the last sample
// eslint-disable-next-line max-statements, max-lines-per-function
export const handleReturnValue = function (
  {
    measures,
    bufferedMeasures,
    samples,
    loops,
    times,
    repeat,
    calibrated,
    minLoopDuration,
    stats,
    aggregateCountdown,
    sampleDurationLast,
    measureDurationLast,
    measureDurations,
  },
  { measures: sampleMeasures },
) {
  if (sampleMeasures === undefined) {
    return {}
  }

  const [
    measuresA,
    bufferedMeasuresA,
    measureDurationsA,
    samplesA,
    loopsA,
    timesA,
  ] = calibrateReset({
    calibrated,
    measures,
    bufferedMeasures,
    measureDurations,
    samples,
    loops,
    times,
  })

  const samplesB = samplesA + 1
  const newLoops = sampleMeasures.length
  const loopsB = loopsA + newLoops
  const timesB = timesA + newLoops * repeat

  const measureDuration = getMeasureDuration(
    measureDurationsA,
    measureDurationLast,
    newLoops,
  )

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
  const calibratedA = getCalibrated({ calibrated, repeat, newRepeat })

  return {
    measures: measuresB,
    bufferedMeasures: bufferedMeasuresB,
    samples: samplesB,
    loops: loopsB,
    times: timesB,
    repeat: newRepeat,
    calibrated: calibratedA,
    stats: statsA,
    aggregateCountdown: aggregateCountdownA,
    measureDurations: measureDurationsA,
    measureDuration,
  }
}
