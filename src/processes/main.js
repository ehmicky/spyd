import now from 'precise-now'

import { getStats } from '../stats/compute.js'

import { runChildren } from './run.js'

// Start several child processes benchmarking the same task.
// eslint-disable-next-line max-lines-per-function
export const runProcesses = async function ({
  name,
  columnName,
  taskPath,
  taskId,
  taskTitle,
  inputId,
  inputTitle,
  commandRunner,
  commandId,
  commandTitle,
  commandDescription,
  commandSpawn,
  commandSpawnOptions,
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
    inputId,
    commandSpawn,
    commandSpawnOptions,
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
    inputId,
    inputTitle,
    commandRunner,
    commandId,
    commandTitle,
    commandDescription,
    systemId,
    systemTitle,
    stats,
  }
}
