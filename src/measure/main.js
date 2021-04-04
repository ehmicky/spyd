import { throwOnProcessExit } from '../process/error.js'
import {
  spawnRunnerProcess,
  terminateRunnerProcess,
} from '../process/runner.js'
import { startServer, endServer } from '../server/main.js'

import { measureAllCombinations } from './all.js'
import { addInitProps } from './props.js'
import { addStopHandler } from './stop.js'

// Measure all combinations and add results to `combinations`.
// Also used when starting combinations to retrieve their tasks and steps.
// Start server to communicate with combinations, then measure them.
export const measureCombinations = async function (
  combinations,
  { duration, cwd, previewConfig, previewState, exec },
) {
  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index < combinations.length; index += 1) {
    const combination = combinations[index]
    // eslint-disable-next-line no-await-in-loop
    const { combination: combinationA, stopped } = await measureCombination(
      combination,
      {
        duration,
        cwd,
        previewConfig: { ...previewConfig, combinations, index },
        previewState,
        exec,
      },
    )
    // eslint-disable-next-line fp/no-mutation, require-atomic-updates, no-param-reassign
    combinations[index] = combinationA

    // eslint-disable-next-line max-depth
    if (stopped) {
      return { combinations, stopped }
    }
  }

  return { combinations, stopped: false }
}

export const measureCombination = async function (
  combination,
  { duration, cwd, previewConfig, previewState, exec },
) {
  const combinationA = addInitProps(combination)
  const { server, serverUrl } = await startServer()

  try {
    return await spawnAndMeasure({
      combination: combinationA,
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
  serverUrl,
  duration,
  cwd,
  previewConfig,
  previewState,
  exec,
  server,
}) {
  const childProcess = spawnRunnerProcess({ combination, serverUrl, cwd, exec })

  try {
    return await stopOrMeasure({
      combination,
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
  combination,
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
    const combinationA = await eMeasureAllCombinations({
      combination,
      duration,
      previewConfig,
      previewState,
      stopState,
      exec,
      server,
      childProcess,
      onAbort,
    })
    return { combination: combinationA, stopped: stopState.stopped }
  } finally {
    removeStopHandler()
  }
}

const eMeasureAllCombinations = async function ({
  combination,
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
        combination,
        duration,
        previewConfig,
        previewState,
        stopState,
        exec,
        server,
      }),
    ])
  } catch (error) {
    prependTaskPrefix(error, combination)
    throw error
  }
}

// taskId is `undefined` during init
const prependTaskPrefix = function (error, { taskId }) {
  if (taskId === undefined) {
    return
  }

  const taskPrefix = `In task "${taskId}"`
  error.message = `${taskPrefix}:\n${error.message}`
}
