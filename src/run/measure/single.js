import { getCombinationPrefix } from '../../combination/ids/name.js'
import { handlePluginError } from '../../config/plugin/error.js'
import { useConfigSelectors } from '../../config/select/use.js'
import { BaseError, PluginError } from '../../error/main.js'
import { hasLogs, startLogs, stopLogs } from '../logs/create.js'
import { addErrorTaskLogs } from '../logs/error.js'
import { startLogsStream, stopLogsStream } from '../logs/stream.js'
import {
  endCombinationPreview,
  startCombinationPreview,
} from '../preview/combination.js'
import { updateDescription } from '../preview/description.js'
import {
  spawnRunnerProcess,
  terminateRunnerProcess,
} from '../process/runner.js'
import { throwIfStopped } from '../stop/error.js'

// eslint-disable-next-line import/max-dependencies
import { runEvents } from './events.js'

// Measure a single combination
export const measureCombination = async ({ index, config, ...args }) => {
  const { previewState, combination, noDimensions } = args
  const configA = await useConfigSelectors(combination, config)

  try {
    await startCombinationPreview({
      previewState,
      combination,
      index,
      noDimensions,
    })
    const { stats, taskIds } = await logAndMeasure({ ...args, config: configA })
    await endCombinationPreview(previewState)
    return { ...combination, stats, taskIds }
  } catch (error) {
    throw handlePluginError({
      error,
      bugs: combination.dimensions.runner.bugs,
      PluginError,
      BaseError,
    })
  } finally {
    await updateDescription(previewState, '')
  }
}

const logAndMeasure = async (args) => {
  if (!hasLogs(args.stage)) {
    return await spawnAndMeasure(args)
  }

  const { logsPath, logsFd } = await startLogs()

  try {
    return await logStreamAndMeasure({ ...args, logsFd })
  } catch (error) {
    throw await addErrorTaskLogs(error, logsPath)
  } finally {
    await stopLogs(logsPath, logsFd)
  }
}

const logStreamAndMeasure = async (args) => {
  const logsStream = startLogsStream(args.logsFd)

  try {
    return await spawnAndMeasure({ ...args, logsStream })
  } finally {
    await stopLogsStream(logsStream)
  }
}

// Spawn combination processes, then measure them
const spawnAndMeasure = async ({ serverUrl, logsStream, ...args }) => {
  const { childProcess, onTaskExit } = await spawnRunnerProcess({
    ...args,
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
const handleStopAndMeasure = async (args) => {
  const { stopState } = args
  const returnValue = await Promise.race([stopState.onAbort, handleError(args)])
  throwIfStopped(stopState)
  return returnValue
}

// When an error happens while a measuring a specific combination, display its
// dimensions in the error message
const handleError = async ({ onTaskExit, noDimensions, ...args }) => {
  try {
    return await Promise.race([onTaskExit, runEvents(args)])
  } catch (error) {
    const prefix = getCombinationPrefix(args.combination, noDimensions)
    throw prefix === undefined ? error : new BaseError(prefix, { cause: error })
  }
}
