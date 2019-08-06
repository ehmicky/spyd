import { now } from '../now.js'
import { getStats } from '../stats/compute.js'

import { startChildren, startChild } from './start.js'
import { runChildren } from './run.js'
import { endChild } from './end.js'
import { shouldStop } from './stop.js'

// Start several child processes benchmarking the same task.
// Each iteration is run serially to avoid influencing the timing of another.
export const runProcesses = async function({
  name,
  taskPath,
  taskId,
  taskTitle,
  variationId,
  variationTitle,
  index,
  progressState,
  duration,
  requireOpt,
}) {
  const runEnd = now() + duration
  // How long to run each child process
  const processDuration = duration / PROCESS_COUNT

  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(progressState, { name, index, runEnd })

  const results = await runPools({
    taskPath,
    taskId,
    variationId,
    processDuration,
    runEnd,
    requireOpt,
  })

  const stats = getStats(results)

  return { name, taskId, taskTitle, variationId, variationTitle, stats }
}

const PROCESS_COUNT = 2e1

// We initially aim at launching `PROCESS_COUNT` child processes
// If the task is slower than `duration / PROCESS_COUNT`, we launch fewer than
// `PROCESS_COUNT`.
// If `duration` is high enough to run each task until it reaches its
// `MAX_LOOPS` limit, we keep spawning new child processes. We stop once we
// reach `MAX_RESULTS` though.
const runPools = async function({
  taskPath,
  taskId,
  variationId,
  processDuration,
  runEnd,
  requireOpt,
}) {
  const results = []

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    const poolResults = await runPool({
      taskPath,
      taskId,
      variationId,
      processDuration,
      runEnd,
      requireOpt,
    })
    // eslint-disable-next-line fp/no-mutating-methods
    results.push(...poolResults)
  } while (!shouldStop(runEnd, results))

  return results
}

const runPool = async function({
  taskPath,
  taskId,
  variationId,
  processDuration,
  runEnd,
  requireOpt,
}) {
  try {
    const children = await startChildren({ taskPath, requireOpt })
    const results = await runChildren({
      children,
      processDuration,
      runEnd,
      taskId,
      variationId,
    })
    return results
  } catch (error) {
    addTaskInfo({ error, taskId, variationId })
    throw error
  }
}

// When a task errors, communicate to user which one failed
const addTaskInfo = function({ error, taskId, variationId }) {
  const variationStr =
    variationId === undefined ? '' : ` (variation '${variationId}')`
  const message = error instanceof Error ? error.message : String(error)
  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  error.message = `Task '${taskId}'${variationStr} errored:\n\n${message}`
}

// At startup we run child processes but do not run an benchmarks. We only
// retrieve the task files iterations
export const loadTaskFile = async function(taskPath, requireOpt) {
  const { iterations, child } = await startChild({ taskPath, requireOpt })
  await endChild(child)
  return iterations
}
