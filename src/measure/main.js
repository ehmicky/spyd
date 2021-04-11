import pReduce from 'p-reduce'

import { throwOnProcessExit } from '../process/error.js'
import {
  spawnRunnerProcess,
  terminateRunnerProcess,
} from '../process/runner.js'
import { startServer, endServer } from '../server/main.js'

import { measureAllCombinations } from './all.js'
import { addStopHandler, throwIfStopped } from './stop.js'

// Measure all combinations and add results to `combinations`.
// Combinations are measured serially:
//  - Running them concurrently decreases the precision due to sharing the same
//    machine and OS. This is the case even when samples are run one at a time:
//     - Roughly doubles stdev
//     - Changes the distribution of each combination
//     - Increases `minLoopDuration` due to processes being spawned in parallel
//  - This lowers the maximum memory usage since only one combination's
//    `measures` is in memory at a time
//  - The downside is that users do not get early results of all combinations
//    at once. However, the `precision` configuration property can be used for
//    this.
export const measureCombinations = async function (
  combinations,
  { duration, cwd, previewConfig, previewState, exec },
) {
  const allStatsA = await pReduce(
    combinations,
    (allStats, combination, index) =>
      measureCombinationStats({
        allStats,
        combination,
        index,
        duration,
        cwd,
        previewConfig,
        previewState,
        exec,
      }),
    [],
  )
  return combinations.map((combination, index) => ({
    ...combination,
    stats: allStatsA[index],
  }))
}

const measureCombinationStats = async function ({
  allStats,
  combination,
  index,
  duration,
  cwd,
  previewConfig,
  previewState,
  exec,
}) {
  const previewConfigA = { ...previewConfig, allStats, index }
  const { stats } = await measureCombination(combination, {
    duration,
    cwd,
    previewConfig: previewConfigA,
    previewState,
    exec,
  })
  return [...allStats, stats]
}

// Measure a single combination.
// Also used when starting combinations to retrieve their tasks and steps.
// Start server to communicate with combinations, then measure them.
export const measureCombination = async function (
  combination,
  { duration, cwd, previewConfig, previewState, exec },
) {
  const { server, serverUrl } = await startServer()

  try {
    return await spawnAndMeasure({
      combination,
      serverUrl,
      duration,
      cwd,
      previewConfig,
      previewState,
      exec,
      server,
    })
  } finally {
    await endServer(server)
  }
}

// Spawn combination processes, then measure them
const spawnAndMeasure = async function ({
  combination,
  combination: { taskId },
  serverUrl,
  duration,
  cwd,
  previewConfig,
  previewState,
  exec,
  server,
}) {
  const childProcess = spawnRunnerProcess(combination, { serverUrl, cwd, exec })

  try {
    return await stopOrMeasure({
      taskId,
      duration,
      previewConfig,
      previewState,
      exec,
      server,
      childProcess,
    })
  } finally {
    terminateRunnerProcess(childProcess)
  }
}

// Handle stopping the benchmark
const stopOrMeasure = async function ({
  taskId,
  duration,
  previewConfig,
  previewState,
  exec,
  server,
  childProcess,
}) {
  const { stopState, onAbort, removeStopHandler } = addStopHandler(
    previewState,
    duration,
  )

  try {
    const returnValue = await eMeasureAllCombinations({
      taskId,
      duration,
      previewConfig,
      previewState,
      stopState,
      exec,
      server,
      childProcess,
      onAbort,
    })
    throwIfStopped(stopState)
    return returnValue
  } finally {
    removeStopHandler()
  }
}

const eMeasureAllCombinations = async function ({
  taskId,
  duration,
  previewConfig,
  previewState,
  stopState,
  exec,
  server,
  childProcess,
  onAbort,
}) {
  try {
    return await Promise.race([
      throwOnProcessExit(childProcess),
      onAbort,
      measureAllCombinations({
        taskId,
        duration,
        previewConfig,
        previewState,
        stopState,
        exec,
        server,
      }),
    ])
  } catch (error) {
    prependTaskPrefix(error, taskId)
    throw error
  }
}

// taskId is `undefined` during init
const prependTaskPrefix = function (error, taskId) {
  if (taskId === undefined) {
    return
  }

  const taskPrefix = `In task "${taskId}"`
  error.message = `${taskPrefix}:\n${error.message}`
}
