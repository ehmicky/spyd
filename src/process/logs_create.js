import { createWriteStream, constants } from 'fs'
// eslint-disable-next-line node/no-missing-import, import/no-unresolved
import { open, unlink, mkdir } from 'fs/promises'
import { dirname } from 'path'
import { promisify } from 'util'

import { tmpName } from 'tmp-promise'

import { readLogs } from './logs_read.js'

// Use a temporary file to log all of the runner's stdout and stderr.
// This is unique for each combination.
export const startLogs = async function () {
  const logsPath = await getLogsPath()
  const logsFd = await open(logsPath, LOGS_FILE_FLAGS)
  return { logsPath, logsFd }
}

const getLogsPath = async function () {
  const logsPath = await tmpName({ dir: LOGS_DIR })
  await mkdir(dirname(logsPath), { recursive: true })
  return logsPath
}

const LOGS_DIR = 'spyd/logs/'
// TODO: check all possible flag, especially O_DIRECT, O_SYNC, O_DSYNC
//       If none are used, use 'a+' instead of individual flags.
const LOGS_FILE_FLAGS =
  // eslint-disable-next-line no-bitwise
  constants.O_APPEND | constants.O_CREAT | constants.O_WRONLY | constants.O_EXCL

// Delete logs file after each combination
export const stopLogs = async function (logsPath, logsFd) {
  await Promise.all([logsFd.close(), unlink(logsPath)])
}

// Start file stream for the runner process to write to
export const startLogsStream = function (logsFd) {
  return createWriteStream(undefined, { fd: logsFd })
}

// Ensure the stream buffer is flushed, i.e. we do not miss the last characters
export const stopLogsStream = async function (logsStream) {
  await promisify(logsStream.end.bind(logsStream))()
}

// When an exception is thrown, add the runner's last log lines to the error
// message to help with debugging.
export const addTaskTaskLogs = async function (logsPath, error) {
  if (error.name === 'StopError') {
    return
  }

  const taskLogs = await readLogs(logsPath)

  if (taskLogs === undefined) {
    return
  }

  error.message = `${error.message}

Task logs:

${taskLogs}`
}

// The `exec` command prints stdout/stderr. stdin is always ignored.
// Anything printed during process spawning (e.g. top-level scope in Node.js)
// might be repeated for each combination. This is good since:
//  - It makes it clear that each combination has its own process
//  - Some stdout/stderr might differ from process to process
export const hasLogs = function (stage) {
  return stage !== 'exec'
}
