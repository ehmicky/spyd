import { getCombinationPrefix } from '../../combination/ids/name.js'
import { useConfigSelectors } from '../../config/select/use.js'
import { AnyError } from '../../error/main.js'
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
  handleRunnerError,
} from '../process/runner.js'
import { throwIfStopped } from '../stop/error.js'

// eslint-disable-next-line import/max-dependencies
import { runEvents } from './events.js'

// Measure a single combination
export const measureCombination = async function ({ index, config, ...args }) {
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
    throw await addErrorTaskLogs(error, logsPath)
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
const spawnAndMeasure = async function ({ serverUrl, logsStream, ...args }) {
  const { childProcess, onTaskExit } = await spawnRunnerProcess({
    ...args,
    serverUrl,
    logsStream,
  })

  try {
    return await handleStopAndMeasure({ ...args, onTaskExit })
  } catch (error) {
    throw handleRunnerError(error, args)
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
  const { stopState } = args
  const returnValue = await Promise.race([stopState.onAbort, handleError(args)])
  throwIfStopped(stopState)
  return returnValue
}

// When an error happens while a measuring a specific combination, display its
// dimensions in the error message
const handleError = async function ({ onTaskExit, noDimensions, ...args }) {
  try {
    return await Promise.race([onTaskExit, runEvents(args)])
  } catch (error) {
    const prefix = getCombinationPrefix(args.combination, noDimensions)
    throw prefix === undefined ? error : new AnyError(prefix, { cause: error })
  }
}
