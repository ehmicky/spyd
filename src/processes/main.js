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
  runnerId,
  runnerTitle,
  runner,
  index,
  progressState,
  duration,
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
    runner,
    processDuration,
    runEnd,
  })

  const stats = getStats(results)

  return {
    name,
    columnName,
    taskId,
    taskTitle,
    variationId,
    variationTitle,
    runnerId,
    runnerTitle,
    stats,
  }
}

const PROCESS_COUNT = 2e1
