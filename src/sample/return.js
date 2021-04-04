import { normalizeSampleMeasures } from './normalize.js'
import { handleRepeat } from './repeat.js'

// Handle return value from the last sample
export const handleReturnValue = function (
  { bufferedMeasure, allSamples, samples, loops, times, repeat, calibrated },
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
    allSamples: allSamplesA,
    samples: samplesA,
    loops: loopsA,
    times: timesA,
    bufferedMeasure: bufferedMeasureA,
  } = bufferMeasures({
    calibrated: calibratedA,
    allSamples,
    samples,
    loops,
    sampleLoops,
    times,
    repeat,
    bufferedMeasure,
    sampleMeasures: sampleMeasuresA,
  })

  return {
    bufferedMeasure: bufferedMeasureA,
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

// Uncalibrated stats are removed because they:
//  - Are eventually reset, which create confusion for stats like min or max
//  - Change a lot, creating flicker
const bufferMeasures = function ({
  calibrated,
  allSamples,
  samples,
  loops,
  sampleLoops,
  times,
  repeat,
  sampleMeasures,
}) {
  const allSamplesA = allSamples + 1

  if (!calibrated) {
    return { allSamples: allSamplesA, samples, loops, times }
  }

  return {
    allSamples: allSamplesA,
    samples: samples + 1,
    loops: loops + sampleLoops,
    times: times + sampleLoops * repeat,
    bufferedMeasure: sampleMeasures,
  }
}
