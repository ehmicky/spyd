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
    const combinationA = { ...combination, index }
    // eslint-disable-next-line no-await-in-loop
    const { combination: combinationB, stopped } = await measureCombination({
      combinations,
      combination: combinationA,
      duration,
      cwd,
      previewConfig,
      previewState,
      exec,
    })
    // eslint-disable-next-line fp/no-mutation, require-atomic-updates, no-param-reassign
    combinations[index] = combinationB

    // eslint-disable-next-line max-depth
    if (stopped) {
      return { combinations, stopped }
    }
  }

  return { combinations, stopped: false }
}

const measureCombination = async function ({
  combinations,
  combination,
  duration,
  cwd,
  previewConfig,
  previewState,
  exec,
}) {
  const combinationA = addInitProps(combination)
  const { server, serverUrl } = await startServer()

  try {
    return await spawnAndMeasure({
      combinations,
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
  combinations,
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
      combinations,
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
  combinations,
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
      combinations,
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
  combinations,
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
        combinations,
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
