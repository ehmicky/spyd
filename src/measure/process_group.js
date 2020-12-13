/* eslint-disable max-lines */
import now from 'precise-now'

import { executeChild } from '../processes/main.js'

import { addProcessMeasures } from './add.js'
import { startLoadCost, endLoadCost } from './load_cost.js'
import { getMaxDuration } from './max_duration.js'
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
// We launch child processes serially:
//  - otherwise they would slow down each other and have higher variance
//  - multi-core CPUs are designed to execute in parallel but in practice they
//    do impact the performance of each other
//  - this does mean we are under-utilizing CPUs
export const measureProcessGroup = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandConfig,
  runnerRepeats,
  initialLoadCost,
  duration,
  cwd,
}) {
  const processGroupEnd = now() + duration

  // eslint-disable-next-line fp/no-let
  let sampleState = getInitialSampleState({ runnerRepeats, initialLoadCost })

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line fp/no-mutation, no-await-in-loop
    sampleState = await runSample({
      cwd,
      duration,
      processGroupEnd,
      runnerRepeats,
      commandSpawn,
      commandSpawnOptions,
      commandConfig,
      taskPath,
      taskId,
      inputId,
      sampleState,
    })
  } while (!shouldStopProcessGroup({ processGroupEnd, sampleState }))

  const measures = []
  addProcessMeasures(measures, sampleState.processMeasures)

  return { measures, sampleState }
}

const getInitialSampleState = function ({ runnerRepeats, initialLoadCost }) {
  return {
    processMeasures: [],
    taskMedians: [],
    // `taskMedian` is initially 0. This means it is not used to compute
    // `maxDuration` in the first process.
    taskMedian: 0,
    processes: 0,
    loops: 0,
    times: 0,
    repeat: 1,
    // If the runner does not support `repeats`, `repeatInit` is always `false`
    repeatInit: runnerRepeats,
    loadCosts: [],
    loadCost: initialLoadCost,
    measureCosts: [],
    resolution: Infinity,
    resolutionSize: 0,
    minLoopDuration: 0,
  }
}

// eslint-disable-next-line max-statements, max-lines-per-function
const runSample = async function ({
  // Specific to benchmark
  cwd,
  duration,
  processGroupEnd,
  // Specific to runner
  runnerRepeats,
  commandSpawn,
  commandSpawnOptions,
  // Specific to combination
  commandConfig,
  taskPath,
  taskId,
  inputId,
  // Specific to sample, modified by it
  sampleState: {
    processMeasures,
    taskMedians,
    taskMedian,
    processes,
    loops,
    times,
    repeat,
    repeatInit,
    loadCosts,
    loadCost,
    measureCosts,
    resolution,
    resolutionSize,
    minLoopDuration,
  },
}) {
  const maxDuration = getMaxDuration({
    processGroupEnd,
    loadCost,
    repeat,
    taskMedian,
  })
  const childRepeat = getChildRepeat(repeat, runnerRepeats)
  const empty = getEmpty(repeat, repeatInit, runnerRepeats)
  const eventPayload = {
    type: 'benchmark',
    runConfig: commandConfig,
    taskPath,
    taskId,
    inputId,
    maxDuration,
    repeat: childRepeat,
    empty,
  }

  const loadCostStart = startLoadCost()
  const { mainMeasures, emptyMeasures, start } = await executeChild({
    commandSpawn,
    commandSpawnOptions,
    eventPayload,
    timeoutNs: duration,
    cwd,
    taskId,
    inputId,
    type: 'benchmarkBench',
  })
  const [loadCostsA, loadCostA] = endLoadCost(loadCosts, loadCostStart, start)

  const [
    processMeasuresA,
    taskMediansA,
    measureCostsA,
    processesA,
    loopsA,
    timesA,
  ] = repeatInitReset({
    repeatInit,
    processMeasures,
    taskMedians,
    measureCosts,
    processes,
    loops,
    times,
  })

  const processesB = processesA + 1
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
    processes: processesB,
    loops: loopsB,
    times: timesB,
    repeat: repeatA,
    repeatInit: repeatInitA,
    loadCosts: loadCostsA,
    loadCost: loadCostA,
    measureCosts: measureCostsB,
    resolution: resolutionA,
    resolutionSize: resolutionSizeA,
    minLoopDuration: minLoopDurationA,
  }
}

// We stop iterating when the next process does not have any time to spawn a
// single loop. We estimate this taking into account the time to launch the
// runner (`loadCost`).
// This means we allow the last process to be shorter than the others.
// On one side, this means we are comparing processes with different durations,
// which introduce more variance since shorter processes will measure slower
// code (since it is less optimized by the runtime). On the other side:
//   - When the number of processes is low (including when there is only one
//     process), this improves the total number of measures enough to justify it
//   - Not doing it would make the `times` increment less gradually as the
//     `duration` increases.
const shouldStopProcessGroup = function ({
  processGroupEnd,
  sampleState: { taskMedian, loops, repeat, loadCost },
}) {
  return (
    loops >= MAX_LOOPS ||
    now() + loadCost + taskMedian * repeat >= processGroupEnd
  )
}

// We stop child processes when the `measures` is over `MAX_LOOPS`. This
// is meant to prevent memory overflow.
// The default limit for V8 in Node.js is 1.7GB, which allows measures to hold a
// little more than 1e8 floats.
const MAX_LOOPS = 1e8
/* eslint-enable max-lines */
