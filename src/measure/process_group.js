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

// Measure a task or measureCost using a group of processes.
// CPU-heavy computation (e.g. sorting `measures` and computing stats) are done
// incrementally after each process, as opposed to at the end. This is because:
//  - Stats are reported in realtime
//  - This avoids a big slowdown at the beginning/end of combinations, which
//    would be perceived by users
// eslint-disable-next-line max-statements, max-lines-per-function
export const measureProcessGroup = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandConfig,
  runnerRepeats,
  duration,
  cwd,
  initialLoadCost,
}) {
  const processGroupEnd = now() + duration
  // eslint-disable-next-line fp/no-let
  let processMeasures = []
  // eslint-disable-next-line fp/no-let
  let processMedians = []
  // eslint-disable-next-line fp/no-let
  let measureCosts = []
  // eslint-disable-next-line fp/no-let
  let minLoopDuration = 0
  // eslint-disable-next-line fp/no-let
  let resolution = Infinity
  // eslint-disable-next-line fp/no-let
  let resolutionSize = 0
  // eslint-disable-next-line fp/no-let
  let processes = 0
  // eslint-disable-next-line fp/no-let
  let loops = 0
  // eslint-disable-next-line fp/no-let
  let times = 0
  // `taskMedian` is initially 0. This means it is not used to compute
  // `maxDuration` in the first process.
  // eslint-disable-next-line fp/no-let
  let taskMedian = 0
  // eslint-disable-next-line fp/no-let
  let repeat = 1
  // If the runner does not support `repeats`, `repeatInit` is always `false`
  // eslint-disable-next-line fp/no-let
  let repeatInit = runnerRepeats
  // For some unknown reason, the time to spawn a child process is sometimes
  // higher during cost estimation than during the main process group, so
  // we don't share the `previous` array between those.
  const loadCosts = []
  // eslint-disable-next-line fp/no-let
  let loadCost = initialLoadCost

  // eslint-disable-next-line fp/no-loops
  do {
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
    const {
      mainMeasures,
      emptyMeasures,
      start,
      // eslint-disable-next-line no-await-in-loop
    } = await executeChild({
      commandSpawn,
      commandSpawnOptions,
      eventPayload,
      timeoutNs: duration,
      cwd,
      taskId,
      inputId,
      type: 'benchmarkBench',
    })
    // eslint-disable-next-line fp/no-mutation
    loadCost = endLoadCost(loadCosts, loadCostStart, start)

    // eslint-disable-next-line fp/no-mutation
    ;[
      processMeasures,
      processMedians,
      measureCosts,
      processes,
      loops,
      times,
    ] = repeatInitReset({
      repeatInit,
      processMeasures,
      processMedians,
      measureCosts,
      processes,
      loops,
      times,
    })

    // eslint-disable-next-line fp/no-mutation
    processes += 1
    // eslint-disable-next-line fp/no-mutation
    loops += mainMeasures.length
    // eslint-disable-next-line fp/no-mutation
    times += mainMeasures.length * repeat

    // eslint-disable-next-line fp/no-mutating-methods
    processMeasures.push({ mainMeasures, repeat })
    // eslint-disable-next-line fp/no-mutation
    taskMedian = getTaskMedian(processMedians, mainMeasures, repeat)

    // eslint-disable-next-line fp/no-mutation
    ;[minLoopDuration, resolution, resolutionSize] = getMinLoopDuration({
      minLoopDuration,
      measureCosts,
      resolution,
      resolutionSize,
      emptyMeasures,
      empty,
    })
    const newRepeat = getRepeat({
      repeat,
      taskMedian,
      minLoopDuration,
      runnerRepeats,
    })
    // eslint-disable-next-line fp/no-mutation
    repeatInit = getRepeatInit({ repeatInit, repeat, newRepeat })
    // eslint-disable-next-line fp/no-mutation
    repeat = newRepeat
  } while (
    !shouldStopProcessGroup({
      loops,
      loadCost,
      taskMedian,
      repeat,
      processGroupEnd,
    })
  )

  const measures = []
  addProcessMeasures(measures, processMeasures)

  return { measures, processes, loops, times, loadCost, minLoopDuration }
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
  loops,
  loadCost,
  taskMedian,
  repeat,
  processGroupEnd,
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
