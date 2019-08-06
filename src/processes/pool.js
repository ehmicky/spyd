import { startChildren } from './start.js'
import { runChildren } from './run.js'
import { shouldStop } from './stop.js'

// We initially aim at launching `PROCESS_COUNT` child processes
// If the task is slower than `duration / PROCESS_COUNT`, we launch fewer than
// `PROCESS_COUNT`.
// If `duration` is high enough to run each task until it reaches its
// `MAX_LOOPS` limit, we keep spawning new child processes. We stop once we
// reach `MAX_RESULTS` though.
export const runPools = async function({
  taskPath,
  taskId,
  variationId,
  runner,
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
      runner,
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
  runner,
  processDuration,
  runEnd,
  requireOpt,
}) {
  try {
    const children = await startChildren({ taskPath, runner, requireOpt })
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
