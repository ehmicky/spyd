/* eslint-disable max-lines */
import { aggregateMeasures } from './aggregate.js'
import { getMinLoopDuration } from './min_loop_duration.js'
import { getRepeat } from './repeat.js'
import { repeatInitReset, getRepeatInit } from './repeat_init.js'

// eslint-disable-next-line max-statements, max-lines-per-function
export const handleReturnValue = function (
  {
    runnerRepeats,
    measures,
    bufferedMeasures,
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
  { mainMeasures, emptyMeasures },
  { empty },
) {
  if (mainMeasures === undefined) {
    return {}
  }

  const [
    measuresA,
    bufferedMeasuresA,
    measureCostsA,
    samplesA,
    loopsA,
    timesA,
  ] = repeatInitReset({
    repeatInit,
    measures,
    bufferedMeasures,
    measureCosts,
    samples,
    loops,
    times,
  })

  const samplesB = samplesA + 1
  const loopsB = loopsA + mainMeasures.length
  const timesB = timesA + mainMeasures.length * repeat

  const bufferedMeasuresB = [...bufferedMeasuresA, { mainMeasures, repeat }]
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
    bufferedMeasures: bufferedMeasuresC,
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
