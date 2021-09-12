import filterObj from 'filter-obj'

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
  const { previewState, combination } = args

  try {
    await startCombinationPreview(previewState, combination, index)
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
    return await handleErrorsAndMeasure({ ...args, onTaskExit })
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
const handleErrorsAndMeasure = async function ({
  stopState,
  onTaskExit,
  ...args
}) {
  try {
    const returnValue = await Promise.race([
      stopState.onAbort,
      onTaskExit,
      runEvents({ ...args, stopState }),
    ])
    throwIfStopped(stopState)
    return returnValue
  } catch (error) {
    prependCombinationPrefix(error, args.combination)
    throw error
  }
}

const prependCombinationPrefix = function (error, combination) {
  if (error.name === 'StopError') {
    return
  }

  const combinationPrefix = getCombinationPrefix(combination)
  error.message = `In ${combinationPrefix}:\n${error.message}`
}

const getCombinationPrefix = function (combination) {
  const dimensions = filterObj(combination.dimensions, shouldKeepDimension)
  return getCombinationName({ ...combination, dimensions })
}

// Some dimensions are always the same during a given run, i.e. are not useful
// in error messages
const shouldKeepDimension = function (dimension) {
  return !dimension.startsWith('system')
}
