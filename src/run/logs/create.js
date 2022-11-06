import { open, mkdir, unlink } from 'node:fs/promises'
import { dirname } from 'node:path'

import { tmpName } from 'tmp-promise'

// Redirect all of the runner's stdout/stderr to a file:
//  - This is used to print the runner's output when an error is thrown, which
//    is important for debugging.
//  - This applies to all errors: core errors, plugin errors, task errors,
//    except stop errors.
//  - This works with errors:
//     - In both the parent and child process
//     - Due to the child process exiting, including suddenly due to a signal.
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

// The file is append-only
//  - not setting that flag would make truncate() fail since new writes would
//    restore the original size due to the cursor position not being reset to 0.
// We do not use `O_SYNC` nor `O_DSYNC` because:
//  - They decrease the precision (stdev) a lot
//  - They slow down I/O operations, making them not accurate anymore
// We also do not do `logsFd.sync()` nor `logsFd.datasync()` after each sample:
//  - This would also decrease the precision a lot
//  - This is slow, especially when logs are big
const LOGS_FILE_FLAGS = 'ax'

// Delete logs file after each combination
export const stopLogs = async function (logsPath, logsFd) {
  await Promise.all([logsFd.close(), unlink(logsPath)])
}

// The `dev` command does not need logs because it directly streams
// stdout/stderr.
// Anything printed during process spawning (e.g. top-level scope in Node.js)
// might be repeated for each combination. This is good since:
//  - It makes it clear that each combination has its own process
//  - Some stdout/stderr might differ from process to process
export const hasLogs = function (stage) {
  return stage !== 'dev'
}
