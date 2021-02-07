import { normalizeSampleMeasures } from './normalize.js'
import { handleRepeat } from './repeat.js'

// Handle return value from the last sample
// eslint-disable-next-line max-lines-per-function
export const handleReturnValue = function (
  {
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
    bufferedMeasures: bufferedMeasuresA,
  } = bufferMeasures({
    calibrated: calibratedA,
    allSamples,
    samples,
    loops,
    sampleLoops,
    times,
    repeat,
    bufferedMeasures,
    sampleMeasures: sampleMeasuresA,
  })

  return {
    bufferedMeasures: bufferedMeasuresA,
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

const bufferMeasures = function ({
  calibrated,
  allSamples,
  samples,
  loops,
  sampleLoops,
  times,
  repeat,
  bufferedMeasures,
  sampleMeasures,
}) {
  const allSamplesA = allSamples + 1

  if (!calibrated) {
    return { allSamples: allSamplesA, samples, loops, times, bufferedMeasures }
  }

  return {
    allSamples: allSamplesA,
    samples: samples + 1,
    loops: loops + sampleLoops,
    times: times + sampleLoops * repeat,
    bufferedMeasures: [...bufferedMeasures, sampleMeasures],
  }
}
