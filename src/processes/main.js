import now from 'precise-now'

import { getStats } from '../stats/compute.js'

import { runChildren } from './run.js'

// Start several child processes benchmarking the same task.
export const runProcesses = async function({
  name,
  columnName,
  taskPath,
  taskId,
  taskTitle,
  variationId,
  variationTitle,
  commandRunner,
  commandId,
  commandTitle,
  commandDescription,
  commandValue,
  commandOpt,
  systemId,
  systemTitle,
  index,
  progressState,
  opts: { duration, cwd },
}) {
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
    commandRunner,
    commandId,
    commandTitle,
    commandDescription,
    systemId,
    systemTitle,
    stats,
  }
}
