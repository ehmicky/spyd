/* eslint-disable max-lines */
import { executeChild } from '../processes/main.js'

import { addProcessMeasures } from './add.js'
import { getMaxLoops } from './max_loops.js'
import { getEmpty, getMinLoopDuration } from './min_loop_duration.js'
import { getRepeat, getChildRepeat } from './repeat.js'
import { repeatInitReset, getRepeatInit } from './repeat_init.js'
import { getTaskMedian } from './task_median.js'

// Measure a task using a group of processes until reaching the max `duration`.
// At least one process must be executed.
// CPU-heavy computation (e.g. sorting `measures` and computing stats) are done
// incrementally after each process, as opposed to at the end. This is because:
//  - Stats are reported in realtime
//  - This avoids a big slowdown at the beginning/end of combinations, which
//    would be perceived by users
export const measureProcessGroup = async function (runnerRepeats) {
  // eslint-disable-next-line fp/no-let
  let sampleState = getInitialSampleState(runnerRepeats)

  // eslint-disable-next-line fp/no-mutation
  sampleState = await runSample(sampleState, runnerRepeats)

  const measures = []
  addProcessMeasures(measures, sampleState.processMeasures)

  return { measures, sampleState }
}

const getInitialSampleState = function (runnerRepeats) {
  return {
    processMeasures: [],
    taskMedians: [],
    // `taskMedian` is initially 0. This means it is not used to compute
    // `maxDuration` in the first process.
    taskMedian: 0,
    samples: 0,
    loops: 0,
    times: 0,
    repeat: 1,
    // If the runner does not support `repeats`, `repeatInit` is always `false`
    repeatInit: runnerRepeats,
    measureCosts: [],
    resolution: Infinity,
    resolutionSize: 0,
    minLoopDuration: 0,
  }
}

// eslint-disable-next-line max-statements, max-lines-per-function
const runSample = async function (
  {
    processMeasures,
    taskMedians,
    taskMedian,
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
  runnerRepeats,
) {
  const maxLoops = getMaxLoops(taskMedian, repeat)
  const childRepeat = getChildRepeat(repeat, runnerRepeats)
  const empty = getEmpty(repeat, repeatInit, runnerRepeats)

  // TODO: pass those to execa
  // commandSpawn,
  // commandSpawnOptions,
  // cwd,
  // TODO: pass those as loadParams
  // runConfig: commandConfig,
  // taskPath,
  // taskId,
  // inputId,

  const { mainMeasures, emptyMeasures } = await executeChild({
    maxLoops,
    repeat: childRepeat,
    empty,
  })

  const [
    processMeasuresA,
    taskMediansA,
    measureCostsA,
    samplesA,
    loopsA,
    timesA,
  ] = repeatInitReset({
    repeatInit,
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
  const [taskMediansB, taskMedianA] = getTaskMedian(
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
    minLoopDuration,
    runnerRepeats,
  })
  const repeatInitA = getRepeatInit({ repeatInit, repeat, newRepeat: repeatA })

  return {
    processMeasures: processMeasuresB,
    taskMedians: taskMediansB,
    taskMedian: taskMedianA,
    samples: samplesB,
    loops: loopsB,
    times: timesB,
    repeat: repeatA,
    repeatInit: repeatInitA,
    measureCosts: measureCostsB,
    resolution: resolutionA,
    resolutionSize: resolutionSizeA,
    minLoopDuration: minLoopDurationA,
  }
}

// We stop running samples when the `measures` is over `MAX_LOOPS`. This
// is meant to prevent memory overflow.
// The default limit for V8 in Node.js is 1.7GB, which allows measures to hold a
// little more than 1e8 floats.
const shouldStopProcessGroup = function ({ loops }) {
  return loops >= MAX_LOOPS
}

const MAX_LOOPS = 1e8
/* eslint-enable max-lines */
