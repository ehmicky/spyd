/* eslint-disable max-lines */
import now from 'precise-now'

import { executeChild } from '../processes/main.js'
import { mergeSort } from '../stats/merge.js'
import { sortFloats } from '../stats/sort.js'

import { getLoadCost, startLoadCost, endLoadCost } from './load_cost.js'
import { getMaxDuration } from './max_duration.js'
import { loopDurationsToMedians } from './normalize.js'
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
  sampleType,
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandConfig,
  runnerRepeats,
  processGroupDuration,
  cwd,
  loadDuration,
  minLoopDuration,
  dry,
}) {
  const processGroupEnd = now() + processGroupDuration
  const eventPayload = {
    type: 'benchmark',
    runConfig: commandConfig,
    taskPath,
    taskId,
    inputId,
    dry,
  }
  // eslint-disable-next-line fp/no-let
  let processMeasures = []
  // eslint-disable-next-line fp/no-let
  let processMedians = []
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
  let loadCost = loadDuration

  // eslint-disable-next-line fp/no-loops
  do {
    const maxDuration = getMaxDuration({
      processGroupEnd,
      loadCost,
      repeat,
      taskMedian,
    })
    const childRepeat = getChildRepeat(repeat, runnerRepeats)

    const loadCostStart = startLoadCost()
    // eslint-disable-next-line no-await-in-loop
    const { measures: loopDurations, start } = await executeChild({
      commandSpawn,
      commandSpawnOptions,
      eventPayload: { ...eventPayload, maxDuration, repeat: childRepeat },
      timeoutNs: processGroupDuration,
      cwd,
      taskId,
      inputId,
      type: 'benchmarkBench',
    })
    const childLoadCost = endLoadCost(loadCostStart, start)
    // eslint-disable-next-line fp/no-mutation
    loadCost = getLoadCost(childLoadCost, loadCosts)

    // eslint-disable-next-line fp/no-mutation
    ;[
      processMeasures,
      processMedians,
      processes,
      loops,
      times,
    ] = repeatInitReset({
      repeatInit,
      processMeasures,
      processMedians,
      processes,
      loops,
      times,
    })

    // eslint-disable-next-line fp/no-mutation
    processes += 1
    // eslint-disable-next-line fp/no-mutation
    loops += loopDurations.length
    // eslint-disable-next-line fp/no-mutation
    times += loopDurations.length * repeat

    // eslint-disable-next-line fp/no-mutating-methods
    processMeasures.push({ loopDurations, repeat })
    // eslint-disable-next-line fp/no-mutation
    taskMedian = getTaskMedian(processMedians, loopDurations, repeat)

    const newRepeat = getRepeat({
      repeat,
      taskMedian,
      sampleType,
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
  processMeasures.forEach(({ loopDurations, repeat }) => {
    const childMeasures = loopDurationsToMedians(loopDurations, repeat)
    sortFloats(childMeasures)
    mergeSort(measures, childMeasures)
  })

  return { measures, processes, loops, times, loadCost }
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
  const loopDuration = taskMedian * repeat
  return (
    loops >= MAX_LOOPS || now() + loadCost + loopDuration >= processGroupEnd
  )
}

// We stop child processes when the `measures` is over `MAX_LOOPS`. This
// is meant to prevent memory overflow.
// The default limit for V8 in Node.js is 1.7GB, which allows measures to hold a
// little more than 1e8 floats.
const MAX_LOOPS = 1e8
/* eslint-enable max-lines */
