import { createWriteStream, constants } from 'fs'
// eslint-disable-next-line node/no-missing-import, import/no-unresolved
import { open, unlink, mkdir } from 'fs/promises'
import { dirname } from 'path'
import { promisify } from 'util'

import { tmpName } from 'tmp-promise'

// Redirect all of the runner's stdout/stderr to a file:
//  - This is used to print the runner's output when an error is thrown, which
//    is important for debugging.
//  - This applies to all errors: core errors, plugin errors, task errors,
//    except stop errors.
//  - This works with errors:
//     - In both the parent and child process
//     - Due to the child process exiting, including suddently due to a signal.
// This is unique for each combination.
// We avoid out-of-memory crashes:
//  - The child process' output is potentially huge due to the task being looped
//  - Making the parent buffer that output in memory can crash the parent
//  - Reading the output (even without buffering it) can crash the child because
//    it can lead to the parent not being to keep up with the child.
//     - For example, using `childProcess.stdout.pipe(createWriteStream())` can
//       crash, as opposed to passing the stream directly to the `stdio` option
//       of `spawn()`
//     - This also applies to using the `data` event, or doing interval `read()`
// To minimize the size on disk:
//  - We use a temporary file
//  - We truncate that file after each sample
// Writing to stdout/stderr in a task has a performance impact which we want to
// measure:
//  - Ignoring those streams would lead to inaccurate I/O results
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

// The `exec` command does not need logs because it directly streams
// stdout/stderr.
// Anything printed during process spawning (e.g. top-level scope in Node.js)
// might be repeated for each combination. This is good since:
//  - It makes it clear that each combination has its own process
//  - Some stdout/stderr might differ from process to process
export const hasLogs = function (stage) {
  return stage !== 'exec'
}
