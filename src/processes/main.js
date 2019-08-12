import { now } from '../now.js'
import { getStats } from '../stats/compute.js'

import { runPools } from './pool.js'

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
  const runEnd = now() + duration
  // How long to run each child process
  const processDuration = duration / PROCESS_COUNT

  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(progressState, { name, index, runEnd })

  const results = await runPools({
    taskPath,
    taskId,
    variationId,
    commandValue,
    commandOpt,
    processDuration,
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
}

const PROCESS_COUNT = 2e1
