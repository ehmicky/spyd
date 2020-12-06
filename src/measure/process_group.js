/* eslint-disable max-lines */
import now from 'precise-now'

import { executeChild } from '../processes/main.js'
import { getSortedMedian } from '../stats/median.js'
import { addMeasures } from '../stats/merge.js'
import { OUTLIERS_THRESHOLD } from '../stats/outliers.js'

import { getLoadCost, startLoadCost, endLoadCost } from './load_cost.js'
import { getMaxDuration } from './max_duration.js'
import { loopDurationsToMedians, medianToLoopDuration } from './normalize.js'
import { getRepeat, getChildRepeat } from './repeat.js'
import { repeatInitReset, getRepeatInit } from './repeat_init.js'

// Measure a task, measureCost or repeatCost using a group of processes
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
  measureCost,
  repeatCost,
  resolution,
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
  let measures = []
  // eslint-disable-next-line fp/no-let
  let processes = 0
  // eslint-disable-next-line fp/no-let
  let times = 0
  // `median` is initially 0. This means it is not used to compute `maxDuration`
  // in the first process.
  // eslint-disable-next-line fp/no-let
  let median = 0
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
      measureCost,
      repeatCost,
      repeat,
      median,
    })
    const childRepeat = getChildRepeat({ repeat, sampleType, runnerRepeats })

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
    ;[measures, processes, times] = repeatInitReset({
      repeatInit,
      measures,
      processes,
      times,
    })

    const childMeasures = loopDurationsToMedians(loopDurations, {
      measureCost,
      repeatCost,
      repeat,
      sampleType,
    })

    addMeasures(measures, childMeasures)

    // eslint-disable-next-line fp/no-mutation
    processes += 1
    // eslint-disable-next-line fp/no-mutation
    times += childMeasures.length * repeat

    // eslint-disable-next-line fp/no-mutation
    loadCost = getLoadCost(childLoadCost, loadCosts)
    // eslint-disable-next-line fp/no-mutation
    median = getSortedMedian(measures, OUTLIERS_THRESHOLD)
    const newRepeat = getRepeat({
      repeat,
      median,
      sampleType,
      repeatCost,
      measureCost,
      resolution,
      runnerRepeats,
    })
    // eslint-disable-next-line fp/no-mutation
    repeatInit = getRepeatInit({ repeatInit, repeat, newRepeat })
    // eslint-disable-next-line fp/no-mutation
    repeat = newRepeat
  } while (
    !shouldStopProcessGroup({
      measures,
      loadCost,
      measureCost,
      repeatCost,
      median,
      repeat,
      processGroupEnd,
    })
  )

  return { measures, times, processes, loadCost }
}

// We stop iterating when the next process does not have any time to spawn a
// single loop. We estimate this taking into account the time to launch the
// runner (`loadCost`), the time to measure the task (`measureCost`) and
// the time of the task itself, based on previous measurements (`median`).
// This means we allow the last process to be shorter than the others.
// On one side, this means we are comparing processes with different durations,
// which introduce more variance since shorter processes will measure slower
// code (since it is less optimized by the runtime). On the other side:
//   - When the number of processes is low (including when there is only one
//     process), this improves the total number of measures enough to justify it
//   - Not doing it would make the `times` increment less gradually as the
//     `duration` increases.
const shouldStopProcessGroup = function ({
  measures,
  loadCost,
  measureCost,
  repeatCost,
  median,
  repeat,
  processGroupEnd,
}) {
  const loopDuration = medianToLoopDuration(median, {
    measureCost,
    repeatCost,
    repeat,
  })
  return (
    measures.length >= MAX_LOOPS ||
    now() + loadCost + loopDuration >= processGroupEnd
  )
}

// We stop child processes when the `measures` is over `MAX_LOOPS`. This
// is meant to prevent memory overflow.
// The default limit for V8 in Node.js is 1.7GB, which allows measures to hold a
// little more than 1e8 floats.
const MAX_LOOPS = 1e8
/* eslint-enable max-lines */
