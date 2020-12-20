/* eslint-disable max-lines */
import { aggregateMeasures } from './aggregate.js'
import { getMinLoopDuration } from './min_loop_duration.js'
import { getRepeat } from './repeat.js'
import { repeatInitReset, getRepeatInit } from './repeat_init.js'

// eslint-disable-next-line max-statements, max-lines-per-function
export const handleReturnValue = function (
  {
    runnerRepeats,
    state: {
      measures,
      processMeasures,
      samples,
      loops,
      times,
      repeat,
      repeatInit,
      measureCosts,
      resolution,
      resolutionSize,
      minLoopDuration,
      stats,
      aggregateCountdown,
      sampleDurationLast,
    },
  },
  { mainMeasures, emptyMeasures },
  { empty },
) {
  if (mainMeasures === undefined) {
    return {}
  }

  const [
    measuresA,
    processMeasuresA,
    measureCostsA,
    samplesA,
    loopsA,
    timesA,
  ] = repeatInitReset({
    repeatInit,
    measures,
    processMeasures,
    measureCosts,
    samples,
    loops,
    times,
  })

  const samplesB = samplesA + 1
  const loopsB = loopsA + mainMeasures.length
  const timesB = timesA + mainMeasures.length * repeat

  const processMeasuresB = [...processMeasuresA, { mainMeasures, repeat }]
  const {
    measures: measuresB,
    processMeasures: processMeasuresC,
    stats: statsA,
    aggregateCountdown: aggregateCountdownA,
  } = aggregateMeasures({
    measures: measuresA,
    processMeasures: processMeasuresB,
    stats,
    aggregateCountdown,
    sampleDurationLast,
    repeatInit,
  })

  const [
    minLoopDurationA,
    measureCostsB,
    resolutionA,
    resolutionSizeA,
  ] = getMinLoopDuration({
    minLoopDuration,
    measureCosts: measureCostsA,
    resolution,
    resolutionSize,
    emptyMeasures,
    empty,
  })
  const repeatA = getRepeat({
    repeat,
    stats: statsA,
    minLoopDuration: minLoopDurationA,
    runnerRepeats,
  })
  const repeatInitA = getRepeatInit({ repeatInit, repeat, newRepeat: repeatA })

  return {
    measures: measuresB,
    processMeasures: processMeasuresC,
    samples: samplesB,
    loops: loopsB,
    times: timesB,
    repeat: repeatA,
    repeatInit: repeatInitA,
    measureCosts: measureCostsB,
    resolution: resolutionA,
    resolutionSize: resolutionSizeA,
    minLoopDuration: minLoopDurationA,
    stats: statsA,
    aggregateCountdown: aggregateCountdownA,
  }
}
/* eslint-enable max-lines */
