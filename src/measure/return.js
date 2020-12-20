/* eslint-disable max-lines */
import { computeStats } from '../stats/compute.js'

import { addProcessMeasures } from './add.js'
import { getMinLoopDuration } from './min_loop_duration.js'
import { getRepeat } from './repeat.js'
import { repeatInitReset, getRepeatInit } from './repeat_init.js'
import { getTaskMedian } from './task_median.js'

// eslint-disable-next-line max-statements, max-lines-per-function
export const handleReturnValue = function (
  {
    runnerRepeats,
    state: {
      measures,
      processMeasures,
      taskMedians,
      samples,
      loops,
      times,
      repeat,
      repeatInit,
      measureCosts,
      resolution,
      resolutionSize,
      minLoopDuration,
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
    taskMediansA,
    measureCostsA,
    samplesA,
    loopsA,
    timesA,
  ] = repeatInitReset({
    repeatInit,
    measures,
    processMeasures,
    taskMedians,
    measureCosts,
    samples,
    loops,
    times,
  })

  const samplesB = samplesA + 1
  const loopsB = loopsA + mainMeasures.length
  const timesB = timesA + mainMeasures.length * repeat

  const processMeasuresB = [...processMeasuresA, { mainMeasures, repeat }]
  const [taskMediansB, taskMedian] = getTaskMedian(
    taskMediansA,
    mainMeasures,
    repeat,
  )

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
    taskMedian,
    minLoopDuration: minLoopDurationA,
    runnerRepeats,
  })
  const repeatInitA = getRepeatInit({ repeatInit, repeat, newRepeat: repeatA })

  const processMeasuresC = addProcessMeasures(measuresA, processMeasuresB)
  const stats = computeStats({
    measures: measuresA,
    samples: samplesB,
    loops: loopsB,
    times: timesB,
    minLoopDuration: minLoopDurationA,
  })

  return {
    measures: measuresA,
    processMeasures: processMeasuresC,
    taskMedians: taskMediansB,
    taskMedian,
    samples: samplesB,
    loops: loopsB,
    times: timesB,
    repeat: repeatA,
    repeatInit: repeatInitA,
    measureCosts: measureCostsB,
    resolution: resolutionA,
    resolutionSize: resolutionSizeA,
    minLoopDuration: minLoopDurationA,
    stats,
  }
}
/* eslint-enable max-lines */
