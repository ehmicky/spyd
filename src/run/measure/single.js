import { getCombinationName } from '../../combination/name.js'
import { startLogs, stopLogs, hasLogs } from '../logs/create.js'
import { addErrorTaskLogs } from '../logs/error.js'
import { startLogsStream, stopLogsStream } from '../logs/stream.js'
import {
  startCombinationPreview,
  endCombinationPreview,
} from '../preview/combination.js'
import { updateDescription } from '../preview/description.js'
import {
  spawnRunnerProcess,
  terminateRunnerProcess,
} from '../process/runner.js'
import { throwIfStopped } from '../stop/error.js'

import { runEvents } from './events.js'

// Measure a single combination
export const measureCombination = async function ({ index, ...args }) {
  const { previewState, combination, noDimensions } = args

  try {
    await startCombinationPreview({
      previewState,
      combination,
      index,
      noDimensions,
    })
    const { stats, taskIds } = await logAndMeasure(args)
    await endCombinationPreview(previewState)
    return { ...combination, stats, taskIds }
  } finally {
    await updateDescription(previewState, '')
  }
}

const logAndMeasure = async function (args) {
  if (!hasLogs(args.stage)) {
    return await spawnAndMeasure(args)
  }

  const { logsPath, logsFd } = await startLogs()

  try {
    return await logStreamAndMeasure({ ...args, logsFd })
  } catch (error) {
    await addErrorTaskLogs(logsPath, error)
    throw error
  } finally {
    await stopLogs(logsPath, logsFd)
  }
}

const logStreamAndMeasure = async function (args) {
  const logsStream = startLogsStream(args.logsFd)

  try {
    return await spawnAndMeasure({ ...args, logsStream })
  } finally {
    await stopLogsStream(logsStream)
  }
}

// Spawn combination processes, then measure them
const spawnAndMeasure = async function ({
  cwd,
  serverUrl,
  logsStream,
  ...args
}) {
  const { childProcess, onTaskExit } = await spawnRunnerProcess({
    ...args,
    cwd,
    serverUrl,
    logsStream,
  })

  try {
    return await handleStopAndMeasure({ ...args, onTaskExit })
  } finally {
    terminateRunnerProcess(childProcess)
  }
}

// Handle errors during measuring.
// Asynchronous errors (SIGINT, child process exit):
//  - Are listened to as soon as possible
//  - However, they only throw once all other initializing logic has been
//    performed
//  - This ensures that all initializers and finalizers are always called
//    and in order
const handleStopAndMeasure = async function (args) {
  const returnValue = await Promise.race([
    args.stopState.onAbort,
    handleErrorsAndMeasure(args),
  ])
  throwIfStopped(args.stopState)
  return returnValue
}

const handleErrorsAndMeasure = async function ({
  onTaskExit,
  noDimensions,
  ...args
}) {
  try {
    return await Promise.race([onTaskExit, runEvents(args)])
  } catch (error) {
    prependMeasureError(error, args.combination, noDimensions)
    throw error
  }
}

// When an error happens while a measuring a specific combination, display its
// dimensions in the error message
const prependMeasureError = function (error, combination, noDimensions) {
  const combinationPrefix = getCombinationName(combination, noDimensions)
  error.message = `In ${combinationPrefix}:\n${error.message}`
}
