/* eslint-disable max-lines */
import now from 'precise-now'

import { executeChild } from '../processes/main.js'
import { removeOutliers } from '../stats/outliers.js'

import { getLoadCost, startLoadCost, endLoadCost } from './load_cost.js'
import { getMaxDuration } from './max_duration.js'
import { getMedian } from './median.js'
import { normalizeMeasures, denormalizeMeasure } from './normalize.js'
import { getRepeat, getChildRepeat } from './repeat.js'

// Measure a task, measureCost or repeatCost using a group of processes
// eslint-disable-next-line max-statements, max-lines-per-function
export const measureProcessGroup = async function ({
  sampleType,
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  processGroupDuration,
  cwd,
  loadDuration,
  measureCost,
  repeatCost,
  resolution,
  initialRepeat,
  dry,
}) {
  const processGroupEnd = now() + processGroupDuration
  const eventPayload = {
    type: 'run',
    opts: commandOpt,
    taskPath,
    taskId,
    inputId,
    dry,
  }
  const processMeasures = []
  // eslint-disable-next-line fp/no-let
  let loops = 0
  const processMedians = []
  // `median` is initially 0. This means it is not used to compute `maxDuration`
  // in the first process.
  // eslint-disable-next-line fp/no-let
  let median = 0
  // eslint-disable-next-line fp/no-let
  let repeat = initialRepeat
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
    const childRepeat = getChildRepeat(repeat, sampleType)

    const loadCostStart = startLoadCost()
    // eslint-disable-next-line no-await-in-loop
    const { measures: childMeasures, start } = await executeChild({
      commandSpawn,
      commandSpawnOptions,
      eventPayload: { ...eventPayload, maxDuration, repeat: childRepeat },
      timeoutNs: processGroupDuration,
      cwd,
      taskId,
      inputId,
      type: 'combinationRun',
    })
    const childLoadCost = endLoadCost(loadCostStart, start)

    normalizeMeasures(childMeasures, {
      measureCost,
      repeatCost,
      repeat,
      sampleType,
    })

    // eslint-disable-next-line fp/no-mutating-methods
    processMeasures.push({ childMeasures, repeat })
    // eslint-disable-next-line fp/no-mutation
    loops += childMeasures.length

    // eslint-disable-next-line fp/no-mutation
    loadCost = getLoadCost(childLoadCost, loadCosts)
    // eslint-disable-next-line fp/no-mutation
    median = getMedian(childMeasures, processMedians)
    // eslint-disable-next-line fp/no-mutation
    repeat = getRepeat({
      repeat,
      median,
      sampleType,
      repeatCost,
      measureCost,
      resolution,
      processGroupDuration,
    })
  } while (
    !shouldStopProcessGroup({
      loadCost,
      measureCost,
      repeatCost,
      median,
      repeat,
      processGroupEnd,
      loops,
    })
  )

  const { measures, times, processes } = removeOutliers(processMeasures)
  return { measures, times, processes }
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
  loadCost,
  measureCost,
  repeatCost,
  median,
  repeat,
  processGroupEnd,
  loops,
}) {
  const loopDuration = denormalizeMeasure(median, {
    measureCost,
    repeatCost,
    repeat,
  })
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
