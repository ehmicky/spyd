import { now } from '../now.js'
import { getStats } from '../stats/compute.js'

import { executeChild } from './execute.js'
import { shouldStop } from './stop.js'

// Start several child processes benchmarking the same task.
// Each iteration is run serially to avoid influencing the timing of another.
export const runProcesses = async function({
  name,
  columnName,
  taskPath,
  taskId,
  taskTitle,
  variationId,
  variationTitle,
  commandId,
  commandTitle,
  commandValue,
  commandOpt,
  index,
  progressState,
  opts: { duration, cwd },
}) {
  try {
    const runEnd = now() + duration

    // eslint-disable-next-line fp/no-mutating-assign
    Object.assign(progressState, { name, index, runEnd })

    const results = await runChildren({
      taskPath,
      taskId,
      variationId,
      commandValue,
      commandOpt,
      duration,
      runEnd,
      cwd,
    })

    const stats = getStats(results)

    return {
      name,
      columnName,
      taskId,
      taskTitle,
      variationId,
      variationTitle,
      commandId,
      commandTitle,
      stats,
    }
  } catch (error) {
    addTaskInfo({ error, taskId, variationId })
    throw error
  }
}

// We initially aim at launching `PROCESS_COUNT` child processes
// If the task is slower than `duration / PROCESS_COUNT`, we launch fewer than
// `PROCESS_COUNT`.
// If `duration` is high enough to run each task until it reaches its
// `MAX_LOOPS` limit, we keep spawning new child processes. We stop once we
// reach `MAX_RESULTS` though.
// We launch child processes serially. Otherwise they would slow down each other
// and have higher variance. Multi-core CPUs are designed to run in parallel
// but in practice they do impact the performance of each other.
// This does mean we are under-utilizing CPUs.
const runChildren = async function({
  taskPath,
  taskId,
  variationId,
  commandValue,
  commandOpt,
  duration,
  runEnd,
  cwd,
}) {
  const processDuration = duration / PROCESS_COUNT
  const input = {
    type: 'run',
    taskPath,
    opts: commandOpt,
    taskId,
    variationId,
    duration: processDuration,
  }
  const results = []

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    const { times, count } = await executeChild({
      commandValue,
      input,
      duration,
      cwd,
    })
    // eslint-disable-next-line fp/no-mutating-methods
    results.push({ times, count })
  } while (!shouldStop(runEnd, results))

  return results
}

const PROCESS_COUNT = 2e1

// When a task errors, communicate to user which one failed
const addTaskInfo = function({ error, taskId, variationId }) {
  const variationStr =
    variationId === undefined ? '' : ` (variation '${variationId}')`
  const message = error instanceof Error ? error.message : String(error)
  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  error.message = `Task '${taskId}'${variationStr} errored:\n\n${message}`
}
