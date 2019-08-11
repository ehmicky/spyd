import { now } from '../now.js'
import { getStats } from '../stats/compute.js'

import { runChildren } from './run.js'

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

// When a task errors, communicate to user which one failed
const addTaskInfo = function({ error, taskId, variationId }) {
  const variationStr =
    variationId === undefined ? '' : ` (variation '${variationId}')`
  const message = error instanceof Error ? error.message : String(error)
  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  error.message = `Task '${taskId}'${variationStr} errored:\n\n${message}`
}
