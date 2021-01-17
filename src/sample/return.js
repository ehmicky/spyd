/* eslint-disable max-lines */

import { aggregateMeasures } from './aggregate.js'
import { getMeasureDuration } from './measure_duration.js'
import { getMinLoopDuration } from './min_loop_duration.js'
import { getRepeat } from './repeat.js'
import { repeatInitReset, getRepeatInit } from './repeat_init.js'

// Handle return value from the last sample
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
    emptyMeasures,
    measureCosts,
    resolution,
    resolutionSize,
    minLoopDuration,
    stats,
    aggregateCountdown,
    sampleDurationLast,
    measureDurationLast,
    measureDurations,
  },
  { mainMeasures },
  { empty },
) {
  if (mainMeasures === undefined) {
    return {}
  }

  const [
    measuresA,
    bufferedMeasuresA,
    measureCostsA,
    measureDurationsA,
    samplesA,
    loopsA,
    timesA,
  ] = repeatInitReset({
    repeatInit,
    measures,
    bufferedMeasures,
    measureCosts,
    measureDurations,
    samples,
    loops,
    times,
  })

  const samplesB = samplesA + 1
  const newLoops = mainMeasures.length
  const loopsB = loopsA + newLoops
  const timesB = timesA + newLoops * repeat

  const measureDuration = getMeasureDuration(
    measureDurationsA,
    measureDurationLast,
    newLoops,
  )

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
    emptyMeasures,
    resolution: resolutionA,
    resolutionSize: resolutionSizeA,
    minLoopDuration: minLoopDurationA,
    stats: statsA,
    aggregateCountdown: aggregateCountdownA,
    measureDurations: measureDurationsA,
    measureDuration,
  }
}
/* eslint-enable max-lines */
